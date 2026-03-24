// Direct Gemini API calls — no Express server needed
// All calls go directly from the app to Google's API

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta';

let cachedKey: string | null = null;

export function setApiKey(key: string): void { cachedKey = key; }

function getKey(): string {
  if (cachedKey) return cachedKey;
  const key = localStorage.getItem('podcats_api_key');
  if (!key) throw new Error('NO_API_KEY');
  return key;
}

async function callGemini(endpoint: string, body: object): Promise<any> {
  const key = getKey();
  const res = await fetch(`${GEMINI_API_BASE}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': key,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: { message: res.statusText } }));
    const msg = err?.error?.message ?? res.statusText;
    throw new Error(res.status === 429 ? '429: ' + msg : msg);
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
export async function validateKey(key: string): Promise<boolean> {
  try {
    const res = await fetch(`${GEMINI_API_BASE}/models?pageSize=1`, {
      headers: { 'x-goog-api-key': key },
    });
    return res.ok;
  } catch { return false; }
}
