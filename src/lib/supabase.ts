import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { addWavHeader } from './audio';

// ── Client ───────────────────────────────────────────────────────────────────
const url  = import.meta.env.VITE_SUPABASE_URL  as string | undefined;
const key  = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

let supabase: SupabaseClient | null = null;
if (url && key) supabase = createClient(url, key);

export function isSupabaseConfigured(): boolean { return supabase !== null; }

// ── Session ──────────────────────────────────────────────────────────────────
function getSessionId(): string {
  let id = localStorage.getItem('podcats_session_id');
  if (!id) { id = crypto.randomUUID(); localStorage.setItem('podcats_session_id', id); }
  return id;
}

const BUCKET = 'podcast-files';

// ── Helpers ──────────────────────────────────────────────────────────────────
function base64ToBytes(b64: string): Uint8Array {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

function bytesToBase64(bytes: Uint8Array): string {
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000)
    s += String.fromCharCode(...Array.from(bytes.subarray(i, i + 0x8000)));
  return btoa(s);
}

async function uploadFile(path: string, data: Uint8Array, contentType: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.storage.from(BUCKET).upload(path, data, {
    contentType, upsert: true,
  });
  if (error) throw new Error(`Upload failed: ${error.message}`);
}

async function deleteFile(path: string): Promise<void> {
  if (!supabase) return;
  await supabase.storage.from(BUCKET).remove([path]);
}

function publicUrl(path: string): string {
  if (!supabase) return '';
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

// ── Podcast type matching App.tsx ────────────────────────────────────────────
export interface PodcastRow {
  id: string;
  name: string;
  script: string;
  language: string;
  voice1: string | null;
  voice2: string | null;
  speaker1: string | null;
  speaker2: string | null;
  instructions: string | null;
  word_count: number | null;
  audio_path: string;
  pdf_path: string | null;
}

export interface PodcastWithUrls {
  id: string;
  name: string;
  audioBase64: string;
  script: string;
  language: string;
  pdfBase64?: string;
  voice1?: string;
  voice2?: string;
  speaker1?: string;
  speaker2?: string;
  instructions?: string;
  wordCount?: number;
  audioUrl?: string;   // public URL for direct playback
  audioPath?: string;  // storage path
  pdfPath?: string;    // storage path
}

// ── CRUD ─────────────────────────────────────────────────────────────────────
export async function savePodcast(podcast: PodcastWithUrls): Promise<void> {
  if (!supabase) return;
  const sessionId = getSessionId();

  // Upload audio (add WAV header if needed, then upload as binary)
  const audioPath = `${sessionId}/${podcast.id}/audio.wav`;
  let wavB64 = podcast.audioBase64;
  try { if (!atob(wavB64.slice(0, 20)).startsWith('RIFF')) wavB64 = addWavHeader(wavB64); } catch { wavB64 = addWavHeader(wavB64); }
  await uploadFile(audioPath, base64ToBytes(wavB64), 'audio/wav');

  // Upload PDF if present
  let pdfPath: string | null = null;
  if (podcast.pdfBase64) {
    pdfPath = `${sessionId}/${podcast.id}/source.pdf`;
    await uploadFile(pdfPath, base64ToBytes(podcast.pdfBase64), 'application/pdf');
  }

  // Insert metadata row
  const { error } = await supabase.from('podcasts').insert({
    id: podcast.id,
    session_id: sessionId,
    name: podcast.name,
    script: podcast.script,
    language: podcast.language,
    voice1: podcast.voice1 ?? null,
    voice2: podcast.voice2 ?? null,
    speaker1: podcast.speaker1 ?? null,
    speaker2: podcast.speaker2 ?? null,
    instructions: podcast.instructions ?? null,
    word_count: podcast.wordCount ?? null,
    audio_path: audioPath,
    pdf_path: pdfPath,
  });
  if (error) throw new Error(`Save failed: ${error.message}`);
}

export async function loadPodcasts(): Promise<PodcastWithUrls[]> {
  if (!supabase) return [];
  const sessionId = getSessionId();

  const { data, error } = await supabase
    .from('podcasts')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(`Load failed: ${error.message}`);
  if (!data) return [];

  return data.map((row: PodcastRow) => ({
    id: row.id,
    name: row.name,
    audioBase64: '',  // not loaded — use audioUrl for playback
    script: row.script,
    language: row.language,
    voice1: row.voice1 ?? undefined,
    voice2: row.voice2 ?? undefined,
    speaker1: row.speaker1 ?? undefined,
    speaker2: row.speaker2 ?? undefined,
    instructions: row.instructions ?? undefined,
    wordCount: row.word_count ?? undefined,
    audioUrl: publicUrl(row.audio_path),
    audioPath: row.audio_path,
    pdfPath: row.pdf_path ?? undefined,
  }));
}

export async function deletePodcast(id: string): Promise<void> {
  if (!supabase) return;
  const sessionId = getSessionId();

  // Delete storage files
  await deleteFile(`${sessionId}/${id}/audio.wav`);
  await deleteFile(`${sessionId}/${id}/source.pdf`);

  // Delete row
  const { error } = await supabase.from('podcasts').delete().eq('id', id);
  if (error) throw new Error(`Delete failed: ${error.message}`);
}

export async function updatePodcast(podcast: PodcastWithUrls): Promise<void> {
  if (!supabase) return;
  const sessionId = getSessionId();

  // Re-upload audio if base64 is present (means it was regenerated)
  if (podcast.audioBase64) {
    const audioPath = `${sessionId}/${podcast.id}/audio.wav`;
    let wavB64 = podcast.audioBase64;
    try { if (!atob(wavB64.slice(0, 20)).startsWith('RIFF')) wavB64 = addWavHeader(wavB64); } catch { wavB64 = addWavHeader(wavB64); }
    await uploadFile(audioPath, base64ToBytes(wavB64), 'audio/wav');
  }

  const { error } = await supabase.from('podcasts').update({
    name: podcast.name,
    script: podcast.script,
    language: podcast.language,
    voice1: podcast.voice1 ?? null,
    voice2: podcast.voice2 ?? null,
    speaker1: podcast.speaker1 ?? null,
    speaker2: podcast.speaker2 ?? null,
    instructions: podcast.instructions ?? null,
    word_count: podcast.wordCount ?? null,
  }).eq('id', podcast.id);
  if (error) throw new Error(`Update failed: ${error.message}`);
}

export async function clearAllPodcasts(): Promise<void> {
  if (!supabase) return;
  const sessionId = getSessionId();

  // Get all podcast IDs for this session to clean up storage
  const { data } = await supabase.from('podcasts').select('id').eq('session_id', sessionId);
  if (data) {
    const paths = data.flatMap((row: { id: string }) => [
      `${sessionId}/${row.id}/audio.wav`,
      `${sessionId}/${row.id}/source.pdf`,
    ]);
    if (paths.length) await supabase.storage.from(BUCKET).remove(paths);
  }

  await supabase.from('podcasts').delete().eq('session_id', sessionId);
}

export async function downloadAudioBase64(audioPath: string): Promise<string> {
  if (!supabase) return '';
  const { data, error } = await supabase.storage.from(BUCKET).download(audioPath);
  if (error || !data) throw new Error('Failed to download audio');
  const buf = await data.arrayBuffer();
  return bytesToBase64(new Uint8Array(buf));
}
