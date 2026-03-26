// Direct Gemini API calls — no Express server needed.
// We isolate localStorage access in helpers so we can migrate to keytar later.

const DEFAULT_BASE = 'https://generativelanguage.googleapis.com/v1beta';
const LEGACY_KEY_STORAGE = 'podcats_api_key';
const LEGACY_CONFIG_STORAGE = 'podcats_api_config';
const BASE_URL_STORAGE = 'gemini_base_url';
const MULTI_KEYS_STORAGE = 'gemini_api_keys';
const ACTIVE_KEY_STORAGE = 'gemini_active_key_id';

type ApiErrorCode = 'NO_API_KEY' | 'INVALID_KEY' | 'RATE_LIMIT' | 'NETWORK_ERROR' | 'API_ERROR';

export type ApiKeyEntry = {
  id: string;
  key: string;
  label?: string;
};

export class GeminiApiError extends Error {
  public readonly code: ApiErrorCode;
  public readonly status?: number;

  constructor(code: ApiErrorCode, message: string, status?: number) {
    super(`${code}: ${message}`);
    this.name = 'GeminiApiError';
    this.code = code;
    this.status = status;
  }
}

function safeJsonParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function normalizeApiKey(raw: string): string {
  return raw.trim().replace(/^["']|["']$/g, '');
}

function normalizeBaseUrl(raw: string): string {
  const trimmed = raw.trim().replace(/\/+$/, '');
  return trimmed || DEFAULT_BASE;
}

function readLegacyKey(): string | null {
  const direct = normalizeApiKey(localStorage.getItem(LEGACY_KEY_STORAGE) ?? '');
  if (direct) return direct;
  const legacyCfg = safeJsonParse<{ key?: string }>(localStorage.getItem(LEGACY_CONFIG_STORAGE), {});
  const fallback = normalizeApiKey(legacyCfg.key ?? '');
  return fallback || null;
}

function readKeyEntries(): ApiKeyEntry[] {
  const raw = safeJsonParse<ApiKeyEntry[]>(localStorage.getItem(MULTI_KEYS_STORAGE), []);
  return raw
    .map((entry) => ({
      id: (entry.id || '').trim(),
      key: normalizeApiKey(entry.key || ''),
      label: entry.label?.trim() || undefined
    }))
    .filter((entry) => entry.id && entry.key);
}

function writeKeyEntries(entries: ApiKeyEntry[]) {
  localStorage.setItem(MULTI_KEYS_STORAGE, JSON.stringify(entries));
}

export function getBaseUrl(): string {
  const stored = localStorage.getItem(BASE_URL_STORAGE);
  const candidate = normalizeBaseUrl(stored ?? DEFAULT_BASE);
  try {
    // Validate URL shape and fallback if user wrote an invalid base url.
    new URL(candidate);
    return candidate;
  } catch {
    return DEFAULT_BASE;
  }
}

export function setBaseUrl(raw: string): string {
  const next = normalizeBaseUrl(raw);
  localStorage.setItem(BASE_URL_STORAGE, next);
  return next;
}

export function setPrimaryApiKey(rawKey: string, label = 'Primary'): string {
  const normalized = normalizeApiKey(rawKey);
  if (!normalized) {
    throw new GeminiApiError('NO_API_KEY', 'API key is required.');
  }

  const entries = readKeyEntries();
  const existing = entries.find((entry) => entry.key === normalized);
  const active: ApiKeyEntry = existing ?? {
    id: `key_${Date.now()}`,
    key: normalized,
    label
  };
  if (!existing) entries.unshift(active);

  writeKeyEntries(entries);
  localStorage.setItem(ACTIVE_KEY_STORAGE, active.id);
  // Keep backwards compatibility with existing UI/state reads.
  localStorage.setItem(LEGACY_KEY_STORAGE, normalized);
  return normalized;
}

export function getActiveKey(): string {
  const entries = readKeyEntries();
  const activeId = localStorage.getItem(ACTIVE_KEY_STORAGE);
  const active = entries.find((entry) => entry.id === activeId) ?? entries[0];
  if (active?.key) return active.key;

  const legacy = readLegacyKey();
  if (legacy) {
    setPrimaryApiKey(legacy, 'Legacy');
    return legacy;
  }

  throw new GeminiApiError('NO_API_KEY', 'Set your Gemini API key in settings first.');
}

function extractErrorMessage(payload: any, fallback: string): string {
  return payload?.error?.message || payload?.message || fallback;
}

function isInvalidKeyError(status: number, message: string): boolean {
  if (status === 401 || status === 403) return true;
  if (status !== 400) return false;
  return /(api key|invalid key|authentication|permission|unauthorized|api_key_invalid)/i.test(message);
}

async function callGemini(endpoint: string, body: object): Promise<any> {
  const baseUrl = getBaseUrl();
  const apiKey = getActiveKey();
  const url = `${baseUrl}${endpoint}?key=${encodeURIComponent(apiKey)}`;

  let res: Response;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    throw new GeminiApiError('NETWORK_ERROR', 'Unable to reach Gemini API. Check your connection.');
  }

  if (!res.ok) {
    const payload = await res.json().catch(() => ({ error: { message: res.statusText } }));
    const message = extractErrorMessage(payload, res.statusText);

    if (res.status === 429) {
      throw new GeminiApiError('RATE_LIMIT', message || 'Rate limit reached. Try again later.', 429);
    }
    if (isInvalidKeyError(res.status, message)) {
      throw new GeminiApiError('INVALID_KEY', message || 'Invalid Gemini API key.', res.status);
    }
    throw new GeminiApiError('API_ERROR', message || 'Gemini API request failed.', res.status);
  }

  return res.json();
}

// ── Dialect map ───────────────────────────────────────────────────────────────
const DIALECT_MAP: Record<string, string> = {
  'English US':      'American English (US) — use American spelling, idioms: "apartment", "elevator", "soccer".',
  'English UK':      'British English (UK) — use British spelling, idioms: "flat", "lift", "football", "brilliant", "cheers".',
  'English':         'American English.',
  'Saudi Arabic':    'Gulf/Saudi Arabic (اللهجة السعودية) ONLY — use "وش","ليش","زين","عيل","حق". NO Egyptian words.',
  'Egyptian Arabic': 'Egyptian Arabic (اللهجة المصرية) ONLY — use "إزيك","عايز","بتاع","دلوقتي","كده". NO Gulf words.',
  'Spanish':         'Latin American Spanish — natural conversational.',
  'French':          'Standard French as spoken in France.',
  'German':          'Standard conversational German.',
  'Italian':         'Standard conversational Italian.',
  'Japanese':        'Natural spoken Japanese (口語).',
  'Korean':          'Natural conversational Korean.',
  'Portuguese':      'Brazilian Portuguese — natural conversational.',
  'Russian':         'Natural conversational Russian.',
  'Chinese':         'Mandarin Chinese (普通话) — natural conversational.',
};

// ── Generate script ───────────────────────────────────────────────────────────
export async function generateScript(
  pdfBase64: string,
  instructions: string,
  speaker1: string,
  speaker2: string,
  language: string,
  wordCount: number
): Promise<string> {
  const dialect = DIALECT_MAP[language] ?? language;

  const prompt = `You are an expert podcast producer. Write a natural podcast script.

SPEAKERS: ${speaker1} and ${speaker2}
TARGET LENGTH: approximately ${wordCount} words spoken aloud.
${instructions ? `SPECIAL INSTRUCTIONS: ${instructions}` : ''}

═══════════════════════════════════════════
CRITICAL: Write the ENTIRE script in ${dialect}
Strictly follow this dialect. Do NOT mix dialects.
═══════════════════════════════════════════

FORMAT: Each line = "SpeakerName: dialogue"
Natural, conversational, short sentences with pauses (...)
No stage directions, no headers — only dialogue.

${speaker1}: Welcome to today's episode...
${speaker2}: Thanks for having me...`;

  const data = await callGemini('/models/gemini-2.5-flash:generateContent', {
    contents: [{
      parts: [
        { inline_data: { mime_type: 'application/pdf', data: pdfBase64 } },
        { text: prompt },
      ],
    }],
  });

  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
}

// ── Generate audio ────────────────────────────────────────────────────────────
export async function generateAudio(
  script: string,
  speaker1: string, voice1: string,
  speaker2: string, voice2: string
): Promise<string> {
  const data = await callGemini('/models/gemini-2.5-flash-preview-tts:generateContent', {
    contents: [{
      parts: [{ text: `Read this conversation between ${speaker1} and ${speaker2} at a natural, relaxed pace:\n\n${script}` }],
    }],
    generationConfig: {
      responseModalities: ['AUDIO'],
      speechConfig: {
        multiSpeakerVoiceConfig: {
          speakerVoiceConfigs: [
            { speaker: speaker1, voiceConfig: { prebuiltVoiceConfig: { voiceName: voice1 } } },
            { speaker: speaker2, voiceConfig: { prebuiltVoiceConfig: { voiceName: voice2 } } },
          ],
        },
      },
    },
  });

  const audio = data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!audio) throw new Error('No audio generated');
  return audio;
}

// ── Voice preview ─────────────────────────────────────────────────────────────
export async function generatePreview(voice: string): Promise<string> {
  const data = await callGemini('/models/gemini-2.5-flash-preview-tts:generateContent', {
    contents: [{
      parts: [{ text: `Say cheerfully: "Hi! I'm ${voice}, this is how I sound."` }],
    }],
    generationConfig: {
      responseModalities: ['AUDIO'],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } },
      },
    },
  });

  const audio = data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!audio) throw new Error('No audio');
  return audio;
}

// ── Validate key ──────────────────────────────────────────────────────────────
export async function validateKey(
  key: string,
  baseUrlOverride?: string
): Promise<{ success: boolean; error?: string }> {
  const normalized = normalizeApiKey(key);
  if (!normalized) return { success: false, error: 'NO_API_KEY' };

  const candidateBase = normalizeBaseUrl(baseUrlOverride ?? getBaseUrl());
  let baseUrl = DEFAULT_BASE;
  try {
    new URL(candidateBase);
    baseUrl = candidateBase;
  } catch {
    baseUrl = DEFAULT_BASE;
  }
  try {
    const res = await fetch(`${baseUrl}/models?key=${encodeURIComponent(normalized)}&pageSize=1`);
    if (res.ok) return { success: true };

    const payload = await res.json().catch(() => ({ error: { message: res.statusText } }));
    const message = extractErrorMessage(payload, res.statusText);

    if (res.status === 429) return { success: false, error: 'RATE_LIMIT' };
    if (isInvalidKeyError(res.status, message)) return { success: false, error: 'INVALID_KEY' };
    return { success: false, error: message || 'API_ERROR' };
  } catch {
    return { success: false, error: 'NETWORK_ERROR' };
  }
}
