import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Upload, Play, Pause, Download, Trash2, FileText,
  CheckCircle2, Loader2, Globe, Key,
  Eye, EyeOff, ChevronDown, X, Sparkles, Info, Moon, Sun
} from 'lucide-react';
import WaveSurfer from 'wavesurfer.js';
import { getPlayableAudioUrl } from './lib/audio';
import { generateScript, generateAudio, generatePreview, validateKey } from './lib/gemini';
import logoBase64 from './logo';

// ─── Voice / Language System ──────────────────────────────────────────────────
type Voice = 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Zephyr';
const VOICES: Voice[] = ['Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'];

// Each voice slot maps to a gender
const VOICE_GENDER: Record<Voice, 'male' | 'female'> = {
  Puck:   'male',
  Charon: 'male',
  Fenrir: 'male',
  Kore:   'female',
  Zephyr: 'female',
};

// Localized display names per language — 3 male, 2 female (matching voice order above)
const LOCALIZED_NAMES: Record<string, { male: string[]; female: string[] }> = {
  'English US':      { male: ['James','Michael','David'],       female: ['Emma','Sarah']           },
  'English UK':      { male: ['Oliver','George','Harry'],       female: ['Olivia','Sophie']        },
  'English':         { male: ['James','Michael','David'],       female: ['Emma','Sarah']           },
  'Saudi Arabic':    { male: ['محمد','خالد','عبدالله'],          female: ['نورة','ريم']              },
  'Egyptian Arabic': { male: ['أحمد','محمود','عمر'],             female: ['فاطمة','منة']             },
  'Spanish':         { male: ['Carlos','Miguel','Juan'],         female: ['Sofia','Isabella']       },
  'French':          { male: ['Pierre','Louis','Antoine'],       female: ['Marie','Sophie']         },
  'German':          { male: ['Hans','Klaus','Stefan'],          female: ['Anna','Laura']           },
  'Italian':         { male: ['Marco','Luca','Giovanni'],        female: ['Giulia','Sofia']         },
  'Japanese':        { male: ['Kenji','Hiroshi','Takashi'],      female: ['Yuki','Hana']            },
  'Korean':          { male: ['Minjun','Jiyong','Hyun'],         female: ['Jiyeon','Soyeon']        },
  'Portuguese':      { male: ['João','Pedro','Carlos'],          female: ['Ana','Beatriz']          },
  'Russian':         { male: ['Ivan','Dmitri','Alexei'],         female: ['Anna','Natasha']         },
  'Chinese':         { male: ['Wei','Ming','Jian'],              female: ['Mei','Xiu']              },
};

// Returns display name for a voice in a given language
function getDisplayName(voice: Voice, language: string): string {
  const names = LOCALIZED_NAMES[language] ?? LOCALIZED_NAMES['English'];
  const gender = VOICE_GENDER[voice];
  const maleVoices   = VOICES.filter(v => VOICE_GENDER[v] === 'male');
  const femaleVoices = VOICES.filter(v => VOICE_GENDER[v] === 'female');
  if (gender === 'male') {
    const idx = maleVoices.indexOf(voice);
    return names.male[idx] ?? voice;
  } else {
    const idx = femaleVoices.indexOf(voice);
    return names.female[idx] ?? voice;
  }
}

const LANGUAGES = [
  { value: 'English US',      label: '🇺🇸 English — US'      },
  { value: 'English UK',      label: '🇬🇧 English — UK'      },
  { value: 'Saudi Arabic',    label: '🇸🇦 Arabic — Saudi'     },
  { value: 'Egyptian Arabic', label: '🇪🇬 Arabic — Egyptian'  },
  { value: 'Spanish',         label: '🇪🇸 Spanish'           },
  { value: 'French',          label: '🇫🇷 French'            },
  { value: 'German',          label: '🇩🇪 German'            },
  { value: 'Italian',         label: '🇮🇹 Italian'           },
  { value: 'Japanese',        label: '🇯🇵 Japanese'          },
  { value: 'Korean',          label: '🇰🇷 Korean'            },
  { value: 'Portuguese',      label: '🇧🇷 Portuguese'        },
  { value: 'Russian',         label: '🇷🇺 Russian'           },
  { value: 'Chinese',         label: '🇨🇳 Chinese'           },
];

interface ApiConfig { key: string; }
interface Podcast   { id: string; name: string; audioBase64: string; script: string; language: string; pdfBase64?: string; voice1?: string; voice2?: string; speaker1?: string; speaker2?: string; instructions?: string; wordCount?: number; }

// ─── Theme ────────────────────────────────────────────────────────────────────
function useTheme() {
  const [dark, setDark] = useState(() =>
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => setDark(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  const toggle = () => setDark(d => !d);
  return { dark, toggle };
}

function makeTheme(dark: boolean) {
  return dark ? {
    // ── Dark ──
    bg:            '#1E1B2E',
    sidebar:       '#16132A',
    card:          '#2D2640',
    cardHover:     '#352f4a',
    border:        '#3d3560',
    borderFocus:   '#A78BFA',
    primary:       '#A78BFA',
    secondary:     '#7C3AED',
    accent:        '#F59E0B',
    text:          '#F5F3FF',
    textMid:       '#c4b5fd',
    textMuted:     '#8b7ec8',
    textFaint:     '#5a5080',
    green:         '#34d399',
    greenBg:       '#022c22',
    amber:         '#fbbf24',
    amberBg:       '#292107',
    headerBg:      'linear-gradient(135deg, #1a1628 0%, #1E1B2E 100%)',
    headerBorder:  '#2a2440',
    outputBg:      '#1a1728',
    purplePale:    '#2d2248',
    purpleMid:     '#6d28d9',
    shadow:        '0 2px 12px rgba(0,0,0,0.4)',
    shadowHover:   '0 6px 24px rgba(0,0,0,0.5)',
    waveColor:     '#5b4fa0',
    waveProgress:  '#A78BFA',
    scrollTrack:   '#1a1628',
    scrollThumb:   '#3d3560',
  } : {
    // ── Light ──
    bg:            '#F5F3FF',
    sidebar:       '#EDE9FE',
    card:          '#FFFFFF',
    cardHover:     '#faf8ff',
    border:        '#ddd6fe',
    borderFocus:   '#7C3AED',
    primary:       '#7C3AED',
    secondary:     '#A78BFA',
    accent:        '#F59E0B',
    text:          '#1e1333',
    textMid:       '#4c3a7a',
    textMuted:     '#7c6aa0',
    textFaint:     '#b0a0cc',
    green:         '#059669',
    greenBg:       '#ecfdf5',
    amber:         '#d97706',
    amberBg:       '#fffbeb',
    headerBg:      'linear-gradient(135deg, #ede9fe 0%, #f5f3ff 100%)',
    headerBorder:  '#ddd6fe',
    outputBg:      '#f0edf9',
    purplePale:    '#ede9fe',
    purpleMid:     '#c4b5fd',
    shadow:        '0 1px 6px rgba(124,58,237,0.08)',
    shadowHover:   '0 4px 16px rgba(124,58,237,0.14)',
    waveColor:     '#c4b5fd',
    waveProgress:  '#7C3AED',
    scrollTrack:   '#ede9fe',
    scrollThumb:   '#c4b5fd',
  };
}

// ─── Generating Waveform Animation ───────────────────────────────────────────
function PulsingWave({ t }: { t: ReturnType<typeof makeTheme> }) {
  const bars = 28;
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:3, height:48, padding:'0 8px' }}>
      {Array.from({ length: bars }).map((_, i) => (
        <div key={i} style={{
          width: 3, borderRadius: 99,
          background: `linear-gradient(to top, ${t.secondary}, ${t.primary})`,
          animation: `waveBar 1.1s ease-in-out ${(i * 0.04).toFixed(2)}s infinite alternate`,
          height: `${20 + Math.sin(i * 0.7) * 14}px`,
          opacity: 0.8,
        }}/>
      ))}
    </div>
  );
}

// ─── API Key Modal ────────────────────────────────────────────────────────────
function ApiKeyModal({ config, onSave, onClose, t }: {
  config: ApiConfig | null;
  onSave: (c: ApiConfig) => void;
  onClose: () => void;
  t: ReturnType<typeof makeTheme>;
}) {
  const [key,    setKey]    = useState(config?.key ?? '');
  const [show,   setShow]   = useState(false);
  const [saving, setSaving] = useState(false);
  const [err,    setErr]    = useState('');

  const save = async () => {
    if (!key.trim()) return;
    setSaving(true);
    const valid = await validateKey(key.trim());
    setSaving(false);
    if (!valid) { setErr('Invalid API key. Please check and try again.'); return; }
    localStorage.setItem('podcats_api_key', key.trim());
    onSave({ key: key.trim() });
  };

  return (
    <div style={{ position:'fixed', inset:0, zIndex:50, display:'flex', alignItems:'center',
                  justifyContent:'center', background:'rgba(10,8,20,0.55)', backdropFilter:'blur(8px)' }}>
      <div style={{ background: t.card, border:`1px solid ${t.border}`, borderRadius:20,
                    width:'100%', maxWidth:400, margin:'0 16px',
                    boxShadow:`0 24px 64px rgba(124,58,237,0.2)` }}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
                      padding:'16px 24px', borderBottom:`1px solid ${t.border}` }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:30, height:30, borderRadius:8, background: t.purplePale,
                          display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Key size={14} style={{ color: t.primary }}/>
            </div>
            <div>
              <p style={{ margin:0, fontSize:13, fontWeight:700, color: t.text }}>Gemini API Key</p>
              <p style={{ margin:0, fontSize:11, color: t.textMuted }}>Google AI</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', color: t.textMuted, cursor:'pointer' }}>
            <X size={16}/>
          </button>
        </div>

        <div style={{ padding:'20px 24px', display:'flex', flexDirection:'column', gap:16 }}>
          {/* Key input */}
          <div>
            <label style={{ fontSize:11, fontWeight:700, color: t.textMid, textTransform:'uppercase',
                            letterSpacing:1, display:'block', marginBottom:8 }}>API Key</label>
            <div style={{ position:'relative' }}>
              <input type={show?'text':'password'} value={key}
                onChange={e => setKey(e.target.value)} onKeyDown={e => e.key==='Enter' && save()}
                placeholder="AIza..." spellCheck={false} autoFocus
                style={{ width:'100%', border:`1px solid ${t.border}`, borderRadius:12,
                         padding:'11px 40px 11px 14px', color: t.text, fontSize:13,
                         fontFamily:'monospace', outline:'none', background: t.bg,
                         boxSizing:'border-box', transition:'border-color .15s' }}
                onFocus={e => (e.target.style.borderColor = t.borderFocus)}
                onBlur={e  => (e.target.style.borderColor = t.border)}/>
              <button onClick={() => setShow(!show)}
                style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)',
                         background:'none', border:'none', color: t.textMuted, cursor:'pointer' }}>
                {show ? <EyeOff size={15}/> : <Eye size={15}/>}
              </button>
            </div>
          </div>

          {/* Info note */}
          <div style={{ display:'flex', gap:8, background: t.purplePale,
                        border:`1px solid ${t.primary}25`, borderRadius:10, padding:'10px 12px' }}>
            <span style={{ fontSize:16 }}>🔒</span>
            <p style={{ margin:0, fontSize:12, color: t.textMid, lineHeight:1.5 }}>
              Your key is stored locally on this device and never sent to any third-party server.
            </p>
          </div>

          {/* Buttons */}
          {err && (
            <p style={{ margin:0, fontSize:12, color:'#ef4444', background:'rgba(239,68,68,0.08)',
                        border:'1px solid rgba(239,68,68,0.2)', borderRadius:8, padding:'8px 12px' }}>
              {err}
            </p>
          )}
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={onClose}
              style={{ flex:1, padding:'10px', borderRadius:12, background:'transparent',
                       border:`1px solid ${t.border}`, color: t.textMid, fontSize:13, cursor:'pointer' }}>
              Cancel
            </button>
            <button onClick={save} disabled={!key.trim() || saving}
              style={{ flex:2, padding:'10px', borderRadius:12, fontWeight:700, fontSize:13,
                       background: key.trim() ? `linear-gradient(135deg,${t.secondary},${t.primary})` : t.border,
                       border:'none', color: key.trim() ? '#fff' : t.textFaint,
                       cursor: key.trim() ? 'pointer':'not-allowed' }}>
              {saving ? 'Validating...' : 'Save Key'}
            </button>
          </div>

          <a href="https://ai.google.dev" target="_blank" rel="noreferrer"
             style={{ display:'block', textAlign:'center', fontSize:12, color: t.primary, textDecoration:'none' }}>
            Get a free Gemini API key at ai.google.dev →
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── Audio Player ─────────────────────────────────────────────────────────────
function AudioPlayer({ podcast, onDelete, onUpdate, onError, t }: {
  podcast: Podcast;
  onDelete: () => void;
  onUpdate: (p: Podcast) => void;
  onError: (msg: string, retry?: () => void) => void;
  t: ReturnType<typeof makeTheme>;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const ws  = useRef<WaveSurfer | null>(null);
  const [playing,         setPlaying]         = useState(false);
  const [current,         setCurrent]         = useState(0);
  const [duration,        setDuration]        = useState(0);
  const [showScript,      setShowScript]      = useState(false);
  const [hovered,         setHovered]         = useState(false);
  const [editMode,        setEditMode]        = useState(false);
  const [editedScript,    setEditedScript]    = useState(podcast.script);
  const [regenAudioBusy,  setRegenAudioBusy]  = useState(false);
  const [regenFullBusy,   setRegenFullBusy]   = useState(false);

  const wordCount = editedScript.trim().split(/\s+/).filter(Boolean).length;
  const charCount = editedScript.length;

  const handleRegenAudio = async () => {
    if (!podcast.voice1 || !podcast.voice2) return;
    setRegenAudioBusy(true);
    try {
      const audioB64 = await generateAudio(
        editedScript,
        podcast.speaker1!, podcast.voice1!,
        podcast.speaker2!, podcast.voice2!
      );
      ws.current?.destroy(); ws.current = null;
      onUpdate({ ...podcast, audioBase64: audioB64, script: editedScript });
      setEditMode(false);
    } catch (err: any) {
      onError(err.message, handleRegenAudio);
    } finally {
      setRegenAudioBusy(false);
    }
  };

  const handleRegenFull = async () => {
    if (!podcast.pdfBase64 || !podcast.voice1 || !podcast.voice2) {
      onError('Original PDF data not available. Please generate a fresh podcast first.');
      return;
    }
    setRegenFullBusy(true);
    try {
      const newScript = await generateScript(
        podcast.pdfBase64!, podcast.instructions ?? '',
        podcast.speaker1!, podcast.speaker2!,
        podcast.language, podcast.wordCount ?? 700
      );
      const audioB64 = await generateAudio(
        newScript,
        podcast.speaker1!, podcast.voice1!,
        podcast.speaker2!, podcast.voice2!
      );
      ws.current?.destroy(); ws.current = null;
      setEditedScript(newScript);
      onUpdate({ ...podcast, audioBase64: audioB64, script: newScript });
      setEditMode(false);
    } catch (err: any) {
      onError(err.message, handleRegenFull);
    } finally {
      setRegenFullBusy(false);
    }
  };

  useEffect(() => {
    if (!ref.current) return;
    ws.current = WaveSurfer.create({
      container: ref.current,
      waveColor: t.waveColor, progressColor: t.waveProgress, cursorColor: t.primary,
      barWidth: 2, barGap: 2, barRadius: 3, height: 56,
      url: getPlayableAudioUrl(podcast.audioBase64),
    });
    ws.current.on('play',       () => setPlaying(true));
    ws.current.on('pause',      () => setPlaying(false));
    ws.current.on('finish',     () => setPlaying(false));
    ws.current.on('timeupdate', t  => setCurrent(t));
    ws.current.on('ready',      d  => setDuration(d));
    return () => { ws.current?.destroy(); };
  }, [podcast.audioBase64, t.waveColor, t.waveProgress]);

  const fmt = (s: number) => `${Math.floor(s/60)}:${String(Math.floor(s%60)).padStart(2,'0')}`;

  return (
    <div style={{ background: t.card, border:`1px solid ${hovered ? t.primary+'50' : t.border}`,
                  borderRadius:16, padding:16, marginBottom:12,
                  boxShadow: hovered ? t.shadowHover : t.shadow, transition:'all .2s' }}
         onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>

      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
        <div style={{ minWidth:0, flex:1 }}>
          <h4 style={{ margin:0, fontSize:13, fontWeight:700, color: t.text,
                       whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{podcast.name}</h4>
          <span style={{ fontSize:11, color: t.primary, display:'block', marginTop:2 }}>{podcast.language}</span>
        </div>
        <div style={{ display:'flex', gap:4, marginLeft:10, flexShrink:0, alignItems:'center' }}>
          <button onClick={() => setShowScript(!showScript)} style={{
            padding:'4px 10px', borderRadius:8, fontSize:11, fontWeight:600, cursor:'pointer',
            background: showScript ? t.purplePale : 'transparent',
            border:`1px solid ${showScript ? t.primary+'60' : t.border}`,
            color: showScript ? t.primary : t.textMuted, transition:'all .15s',
          }}>Script</button>
          {/* Download */}
          <button
            title="Download audio"
            onClick={() => { const a=document.createElement('a'); a.href=getPlayableAudioUrl(podcast.audioBase64); a.download=`${podcast.name}.wav`; a.click(); }}
            style={{ padding:6, background:'none', border:'none', color: t.textMuted, cursor:'pointer', transition:'color .15s' }}
            onMouseEnter={e=>(e.currentTarget.style.color=t.primary)}
            onMouseLeave={e=>(e.currentTarget.style.color=t.textMuted)}>
            <Download size={15}/>
          </button>
          {/* Regenerate full podcast */}
          <button
            title="Regenerate entire podcast"
            onClick={handleRegenFull}
            disabled={regenFullBusy}
            style={{ padding:6, background:'none', border:'none',
                     color: regenFullBusy ? t.primary : t.textMuted,
                     cursor: regenFullBusy ? 'not-allowed' : 'pointer', transition:'color .15s' }}
            onMouseEnter={e=>{ if(!regenFullBusy) e.currentTarget.style.color=t.primary; }}
            onMouseLeave={e=>{ if(!regenFullBusy) e.currentTarget.style.color=t.textMuted; }}>
            {regenFullBusy
              ? <Loader2 size={15} style={{ animation:'spin 1s linear infinite' }}/>
              : <span style={{ fontSize:14 }}>🔄</span>}
          </button>
          {/* Delete */}
          <button onClick={onDelete}
            style={{ padding:6, background:'none', border:'none', color: t.textMuted, cursor:'pointer', transition:'color .15s' }}
            onMouseEnter={e=>(e.currentTarget.style.color='#ef4444')}
            onMouseLeave={e=>(e.currentTarget.style.color=t.textMuted)}>
            <Trash2 size={15}/>
          </button>
        </div>
      </div>

      <div ref={ref} style={{ marginBottom:10 }}/>

      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        <button onClick={() => ws.current?.playPause()} style={{
          width:34, height:34, borderRadius:'50%',
          background:`linear-gradient(135deg,${t.secondary},${t.primary})`,
          border:'none', color:'#fff', cursor:'pointer', flexShrink:0,
          display:'flex', alignItems:'center', justifyContent:'center',
          boxShadow:`0 2px 12px ${t.primary}50`, transition:'transform .1s',
        }}
          onMouseDown={e=>(e.currentTarget.style.transform='scale(0.93)')}
          onMouseUp={e=>(e.currentTarget.style.transform='scale(1)')}>
          {playing ? <Pause size={14}/> : <Play size={14} style={{marginLeft:2}}/>}
        </button>
        <div style={{ flex:1, height:4, borderRadius:99, background: t.purplePale,
                      cursor:'pointer', position:'relative', overflow:'hidden' }}
             onClick={e => { const r=e.currentTarget.getBoundingClientRect(); ws.current?.seekTo((e.clientX-r.left)/r.width); }}>
          <div style={{ position:'absolute', inset:0, borderRadius:99, transition:'width .1s',
                        background:`linear-gradient(90deg,${t.secondary},${t.primary})`,
                        width: duration ? `${(current/duration)*100}%` : '0%' }}/>
        </div>
        <span style={{ fontSize:11, color: t.textMuted, fontFamily:'monospace', flexShrink:0 }}>
          {fmt(current)}/{fmt(duration)}
        </span>
      </div>

      {showScript && (
        <div style={{ marginTop:12 }}>
          {/* Script header row */}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
            <span style={{ fontSize:11, fontWeight:600, color: t.textMuted, textTransform:'uppercase', letterSpacing:0.8 }}>
              Script
            </span>
            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
              {editMode && (
                <span style={{ fontSize:11, color: t.textFaint, fontVariantNumeric:'tabular-nums' }}>
                  {wordCount} words · {charCount} chars
                </span>
              )}
              <button
                onClick={() => { setEditMode(!editMode); if (!editMode) setEditedScript(podcast.script); }}
                style={{
                  display:'flex', alignItems:'center', gap:4,
                  padding:'3px 10px', borderRadius:7, fontSize:11, fontWeight:600, cursor:'pointer',
                  background: editMode ? t.primary : 'transparent',
                  border:`1px solid ${editMode ? t.primary : t.border}`,
                  color: editMode ? '#fff' : t.textMuted, transition:'all .15s',
                }}>
                ✏️ {editMode ? 'Done' : 'Edit'}
              </button>
            </div>
          </div>

          {/* Script textarea / view */}
          {editMode ? (
            <textarea
              value={editedScript}
              onChange={e => setEditedScript(e.target.value)}
              style={{
                width:'100%', boxSizing:'border-box',
                background: t.bg, borderRadius:10, padding:12,
                border:`2px solid ${t.primary}`,
                color: t.textMid, fontSize:12, lineHeight:1.75,
                resize:'vertical', minHeight:160, outline:'none',
                fontFamily:'inherit', transition:'border-color .15s',
                boxShadow:`0 0 0 3px ${t.primary}18`,
              }}
            />
          ) : (
            <div style={{
              background: t.bg, borderRadius:10, padding:12,
              border:`1px solid ${t.border}`, maxHeight:200, overflowY:'auto',
              transition:'background .2s',
            }}>
              <p style={{ margin:0, fontSize:12, color: t.textMid, lineHeight:1.75, whiteSpace:'pre-line' }}>
                {editedScript}
              </p>
            </div>
          )}

          {/* Regenerate Audio button — only shown when in edit mode */}
          {editMode && (
            <button
              onClick={handleRegenAudio}
              disabled={regenAudioBusy || !editedScript.trim()}
              style={{
                marginTop:8, width:'100%', padding:'10px', borderRadius:10,
                border:`1px solid ${t.primary}60`,
                background: regenAudioBusy ? t.purplePale : `linear-gradient(135deg,${t.secondary},${t.primary})`,
                color: regenAudioBusy ? t.primary : '#fff',
                fontSize:12, fontWeight:600, cursor: regenAudioBusy ? 'not-allowed' : 'pointer',
                display:'flex', alignItems:'center', justifyContent:'center', gap:6,
                transition:'all .15s',
              }}>
              {regenAudioBusy
                ? <><Loader2 size={13} style={{ animation:'spin 1s linear infinite' }}/>Generating audio...</>
                : <>🎙️ Regenerate Audio from Script</>}
            </button>
          )}
        </div>
      )}
    </div>
  );
}


// ─── Quota Error Modal (429) ──────────────────────────────────────────────────
function QuotaErrorModal({ onClose, onRetry, t }: {
  onClose: () => void;
  onRetry: () => void;
  t: ReturnType<typeof makeTheme>;
}) {
  return (
    <div style={{ position:'fixed', inset:0, zIndex:60, display:'flex', alignItems:'center',
                  justifyContent:'center', background:'rgba(10,8,20,0.6)', backdropFilter:'blur(8px)' }}>
      <div style={{ background: t.card, border:`1px solid ${t.primary}40`, borderRadius:20,
                    width:'100%', maxWidth:420, margin:'0 16px',
                    boxShadow:`0 24px 64px rgba(124,58,237,0.25)` }}>

        {/* Icon + Title */}
        <div style={{ padding:'28px 28px 0', textAlign:'center' }}>
          <div style={{ fontSize:40, marginBottom:12 }}>⚠️</div>
          <h2 style={{ margin:0, fontSize:18, fontWeight:800, color: t.text }}>Daily Limit Reached</h2>
          <p style={{ margin:'8px 0 0', fontSize:13, color: t.textMuted, lineHeight:1.6 }}>
            You've reached the free daily limit for Gemini API.
            <br/>This resets every 24 hours.
          </p>
        </div>

        {/* Options list */}
        <div style={{ margin:'20px 28px', background: t.purplePale,
                      border:`1px solid ${t.primary}25`, borderRadius:14, padding:'14px 16px' }}>
          <p style={{ margin:'0 0 8px', fontSize:11, fontWeight:700, color: t.primary,
                      textTransform:'uppercase', letterSpacing:1 }}>Your Options</p>
          {[
            '⏰  Wait until tomorrow and try again',
            '🚀  Upgrade to a paid plan at ai.google.dev',
            '🔑  Use a different API key',
          ].map((opt, i) => (
            <p key={i} style={{ margin: i===0 ? 0 : '6px 0 0', fontSize:13, color: t.textMid }}>
              {opt}
            </p>
          ))}
        </div>

        {/* Buttons */}
        <div style={{ padding:'0 28px 24px', display:'flex', flexDirection:'column', gap:8 }}>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={onClose}
              style={{ flex:1, padding:'11px', borderRadius:12, background:'transparent',
                       border:`1px solid ${t.border}`, color: t.textMid, fontSize:13,
                       fontWeight:600, cursor:'pointer' }}>
              Dismiss
            </button>
            <button onClick={onRetry}
              style={{ flex:1, padding:'11px', borderRadius:12, fontWeight:700, fontSize:13,
                       background:`linear-gradient(135deg,${t.secondary},${t.primary})`,
                       border:'none', color:'#fff', cursor:'pointer',
                       boxShadow:`0 4px 14px ${t.primary}40` }}>
              Try Again
            </button>
          </div>
          <a href="https://ai.google.dev" target="_blank" rel="noreferrer"
             style={{ display:'block', textAlign:'center', padding:'11px', borderRadius:12,
                      background: t.purplePale, border:`1px solid ${t.primary}40`,
                      color: t.primary, fontSize:13, fontWeight:600, textDecoration:'none' }}>
            🚀 Get API Key at ai.google.dev
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const { dark, toggle: toggleDark } = useTheme();
  const t = makeTheme(dark);

  const [apiConfig,      setApiConfig]      = useState<ApiConfig | null>(null);
  const [showKeyModal,   setShowKeyModal]   = useState(false);
  const [showQuotaError, setShowQuotaError] = useState(false);
  const [pendingRetry,   setPendingRetry]   = useState<(() => void) | null>(null);
  const [file,           setFile]           = useState<{ name:string; base64:string } | null>(null);
  const [isDragging,     setIsDragging]     = useState(false);
  const [selectedVoices, setSelectedVoices] = useState<Voice[]>(['Puck', 'Kore']);
  const [language,       setLanguage]       = useState('English US');
  const [instructions,   setInstructions]   = useState('');
  const [wordCount,      setWordCount]      = useState(700);
  const [isGenerating,   setIsGenerating]   = useState(false);
  const [step,           setStep]           = useState('');
  const [progress,       setProgress]       = useState(0);
  const [podcasts,       setPodcasts]       = useState<Podcast[]>([]);
  const [previewAudio,   setPreviewAudio]   = useState<HTMLAudioElement | null>(null);
  const [playingVoice,   setPlayingVoice]   = useState<Voice | null>(null);
  const [loadingVoice,   setLoadingVoice]   = useState<Voice | null>(null);

  useEffect(() => () => { previewAudio?.pause(); }, [previewAudio]);

  useEffect(() => {
    // Try new simple key storage first, fallback to old format
    const key = localStorage.getItem('podcats_api_key')
      ?? (() => { try { return JSON.parse(localStorage.getItem('podcats_api_config') ?? '{}').key; } catch { return null; } })();
    if (key) {
      setApiConfig({ key });
      localStorage.setItem('podcats_api_key', key); // normalize
    }
  }, []);

  const saveConfig = (c: ApiConfig) => {
    setApiConfig(c);
    localStorage.setItem('podcats_api_key', c.key);
    setShowKeyModal(false);
  };

  // Shows quota modal for 429, otherwise throws for normal handling
  const handleApiError = (message: string, retryFn?: () => void) => {
    if (message.includes('429') || message.toLowerCase().includes('quota') ||
        message.toLowerCase().includes('resource_exhausted') ||
        message.toLowerCase().includes('rate limit')) {
      setPendingRetry(() => retryFn ?? null);
      setShowQuotaError(true);
    } else {
      alert(message);
    }
  };

  const handleFile = (f: File) => {
    if (f.type !== 'application/pdf') { alert('Please upload a PDF file.'); return; }
    if (f.size > 50*1024*1024) { alert('File too large. Max 50MB.'); return; }
    const reader = new FileReader();
    reader.onload = e => setFile({ name:f.name, base64:(e.target?.result as string).split(',')[1] });
    reader.readAsDataURL(f);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    const f = e.dataTransfer.files[0]; if (f) handleFile(f);
  }, []);

  const toggleVoice = (v: Voice) => {
    if (selectedVoices.includes(v)) setSelectedVoices(selectedVoices.filter(x=>x!==v));
    else if (selectedVoices.length < 2) setSelectedVoices([...selectedVoices, v]);
  };

  const handlePreview = async (e: React.MouseEvent, voice: Voice) => {
    e.stopPropagation();
    if (playingVoice===voice) { previewAudio?.pause(); setPlayingVoice(null); return; }
    previewAudio?.pause(); setLoadingVoice(voice);
    try {
      const audioB64 = await generatePreview(voice);
      const audio = new Audio(getPlayableAudioUrl(audioB64));
      audio.onended = () => setPlayingVoice(null);
      setPreviewAudio(audio); setPlayingVoice(voice); audio.play();
    } catch (e: any) { handleApiError(e.message || 'Preview failed. Check your API key.'); }
    finally { setLoadingVoice(null); }
  };

  const handleGenerate = async () => {
    if (!file)                       { alert('Please upload a PDF first.'); return; }
    if (selectedVoices.length !== 2) { alert('Please select exactly 2 speakers.'); return; }
    if (!apiConfig?.key)             { setShowKeyModal(true); return; }

    const displayName1 = getDisplayName(selectedVoices[0], language);
    const displayName2 = getDisplayName(selectedVoices[1], language);

    setIsGenerating(true); setProgress(5);
    try {
      setStep('Reading document and writing script...');
      const script = await generateScript(
        file.base64, instructions,
        displayName1, displayName2,
        language, wordCount
      );
      if (!script) throw new Error('Failed to generate script');
      setProgress(45);

      setStep('Generating audio — about 1–2 min...');
      const audioB64 = await generateAudio(
        script,
        displayName1, selectedVoices[0],
        displayName2, selectedVoices[1]
      );
      setProgress(100);

      setPodcasts(prev => [{
        id: Date.now().toString(),
        name: file.name.replace('.pdf',''),
        audioBase64: audioB64,
        script,
        language,
        pdfBase64: file.base64,
        voice1: selectedVoices[0],
        voice2: selectedVoices[1],
        speaker1: displayName1,
        speaker2: displayName2,
        instructions,
        wordCount,
      }, ...prev]);
    } catch (err: any) {
      handleApiError(err.message, handleGenerate);
    } finally {
      setIsGenerating(false); setStep(''); setProgress(0);
    }
  };


  const canGenerate = !isGenerating && !!file && selectedVoices.length === 2;

  // ── Input style helper ──
  const inputStyle = (extraStyle?: React.CSSProperties): React.CSSProperties => ({
    width:'100%', border:`1px solid ${t.border}`, borderRadius:12,
    padding:'10px 14px', color: t.text, fontSize:13,
    background: t.bg, outline:'none', boxSizing:'border-box',
    transition:'border-color .15s, background .2s, color .2s',
    ...extraStyle,
  });

  const labelStyle: React.CSSProperties = {
    fontSize:11, fontWeight:700, color: t.textMid, textTransform:'uppercase',
    letterSpacing:1, display:'block', marginBottom:8, transition:'color .2s',
  };

  return (
    <>
      {showKeyModal && (
        <ApiKeyModal config={apiConfig} onSave={saveConfig} onClose={()=>setShowKeyModal(false)} t={t}/>
      )}
      {showQuotaError && (
        <QuotaErrorModal
          t={t}
          onClose={() => setShowQuotaError(false)}
          onRetry={() => {
            setShowQuotaError(false);
            setTimeout(() => pendingRetry?.(), 100);
          }}
        />
      )}

      {/* Global transitions */}
      <style>{`
        * { transition: background-color .2s, border-color .2s, color .2s, box-shadow .2s; }
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes waveBar {
          from { transform: scaleY(0.4); opacity: 0.6; }
          to   { transform: scaleY(1.0); opacity: 1.0; }
        }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: ${t.scrollTrack}; }
        ::-webkit-scrollbar-thumb { background: ${t.scrollThumb}; border-radius: 99px; }
        select option { background: ${t.card}; color: ${t.text}; }
      `}</style>

      <div style={{ height:'100vh', width:'100vw', display:'flex', flexDirection:'column',
                    background: t.bg, color: t.text, overflow:'hidden',
                    fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif' }}>

        {/* ── Header ── */}
        <header style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
                         padding:'10px 24px', borderBottom:`1px solid ${t.headerBorder}`,
                         background: t.headerBg, flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:36, height:36, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <img src={logoBase64} alt="Podcats" style={{ width:36, height:36, objectFit:'contain' }}/>
            </div>
            <div>
              <span style={{ fontWeight:800, fontSize:17, color: t.text, letterSpacing:-0.3 }}>Podcats</span>
              <span style={{ fontSize:12, color: t.textMuted, marginLeft:8, fontStyle:'italic' }}>
                The purr-fect podcast generator
              </span>
            </div>
          </div>

          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            {/* Dark mode toggle */}
            <button onClick={toggleDark} title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
              style={{ width:32, height:32, borderRadius:8, border:`1px solid ${t.border}`,
                       background: t.card, color: t.textMid, cursor:'pointer',
                       display:'flex', alignItems:'center', justifyContent:'center' }}>
              {dark ? <Sun size={14}/> : <Moon size={14}/>}
            </button>

            {/* API Key button */}
            <button onClick={() => setShowKeyModal(true)} style={{
              display:'flex', alignItems:'center', gap:6, padding:'6px 14px', borderRadius:10,
              border:`1px solid ${apiConfig?.key ? t.green+'50' : t.accent+'50'}`,
              background: apiConfig?.key ? t.greenBg : t.amberBg,
              color: apiConfig?.key ? t.green : t.amber,
              fontSize:12, fontWeight:600, cursor:'pointer',
            }}>
              <Key size={12}/>
              {apiConfig?.key ? 'Gemini Key ✓' : 'Set API Key'}
            </button>
          </div>
        </header>

        {/* ── Body ── */}
        <div style={{ display:'flex', flex:1, overflow:'hidden' }}>

          {/* ── Sidebar ── */}
          <div style={{ width:390, flexShrink:0, display:'flex', flexDirection:'column',
                        borderRight:`1px solid ${t.border}`, overflowY:'auto',
                        background: t.sidebar }}>
            <div style={{ padding:20, display:'flex', flexDirection:'column', gap:18 }}>

              {/* Drop zone */}
              <div onDragOver={e=>{e.preventDefault();setIsDragging(true);}}
                   onDragLeave={()=>setIsDragging(false)} onDrop={onDrop}
                style={{
                  position:'relative', borderRadius:14, padding:18, textAlign:'center', cursor:'pointer',
                  border: isDragging ? `2px dashed ${t.primary}`
                        : file       ? `2px dashed ${t.green}`
                        :              `2px dashed ${t.border}`,
                  background: isDragging ? t.purplePale
                            : file       ? t.greenBg
                            :              t.card,
                  transition:'all .2s',
                }}>
                <input type="file" accept="application/pdf"
                  onChange={e=>e.target.files?.[0]&&handleFile(e.target.files[0])}
                  style={{ position:'absolute',inset:0,width:'100%',height:'100%',opacity:0,cursor:'pointer' }}/>
                {file ? (
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <div style={{ width:36,height:36,borderRadius:10,background:t.greenBg,
                                  display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,
                                  border:`1px solid ${t.green}30` }}>
                      <FileText size={18} style={{ color: t.green }}/>
                    </div>
                    <div style={{ textAlign:'left', minWidth:0, flex:1 }}>
                      <p style={{ margin:0,fontSize:12,fontWeight:600,color:t.text,
                                  whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis' }}>{file.name}</p>
                      <p style={{ margin:0,fontSize:11,color:t.green,marginTop:2 }}>Ready to convert ✓</p>
                    </div>
                    <button onClick={e=>{e.stopPropagation();setFile(null);}}
                      style={{ background:'none',border:'none',color:t.textMuted,cursor:'pointer',flexShrink:0 }}>
                      <X size={15}/>
                    </button>
                  </div>
                ) : (
                  <>
                    <div style={{ width:42,height:42,borderRadius:12,background:t.purplePale,
                                  display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 10px' }}>
                      <Upload size={20} style={{ color: t.primary }}/>
                    </div>
                    <p style={{ margin:0,fontSize:13,color:t.textMid }}>
                      Drop PDF here or <span style={{ color:t.primary,fontWeight:600 }}>browse</span>
                    </p>
                    <p style={{ margin:'4px 0 0',fontSize:11,color:t.textFaint }}>Max 50MB</p>
                  </>
                )}
              </div>

              {/* Speakers */}
              <div>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:10 }}>
                  <span style={labelStyle}>Speakers</span>
                  <span style={{ fontSize:12, color: t.primary }}>{selectedVoices.length}/2 selected</span>
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                  {VOICES.map(voice => {
                    const sel = selectedVoices.includes(voice);
                    const dis = !sel && selectedVoices.length >= 2;
                    const displayName = getDisplayName(voice, language);
                    const gender = VOICE_GENDER[voice];
                    return (
                      <div key={voice} onClick={() => !dis && toggleVoice(voice)}
                        style={{
                          display:'flex', alignItems:'center', justifyContent:'space-between',
                          padding:'10px 12px', borderRadius:12, cursor: dis?'not-allowed':'pointer',
                          border:`1px solid ${sel ? t.primary+'60' : t.border}`,
                          background: sel ? t.purplePale : t.card,
                          opacity: dis ? 0.4 : 1, transition:'all .15s',
                        }}>
                        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                          <div style={{
                            width:18, height:18, borderRadius:5, flexShrink:0, transition:'all .15s',
                            border:`2px solid ${sel ? t.primary : t.border}`,
                            background: sel ? t.primary : 'transparent',
                            display:'flex', alignItems:'center', justifyContent:'center',
                          }}>
                            {sel && <CheckCircle2 size={11} style={{ color:'#fff' }}/>}
                          </div>
                          <div>
                            <p style={{ margin:0, fontSize:13, fontWeight:600,
                                        color: sel ? t.primary : t.text }}>{displayName}</p>
                            <p style={{ margin:0, fontSize:11, color: t.textMuted }}>
                              {gender === 'male' ? 'Male' : 'Female'}
                            </p>
                          </div>
                        </div>
                        <button onClick={e=>handlePreview(e,voice)} disabled={loadingVoice===voice}
                          style={{
                            width:28, height:28, borderRadius:8,
                            border:`1px solid ${playingVoice===voice ? t.primary+'50' : t.border}`,
                            background: playingVoice===voice ? t.purplePale : 'transparent',
                            color: playingVoice===voice ? t.primary : t.textMuted,
                            cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
                            transition:'all .15s',
                          }}>
                          {loadingVoice===voice
                            ? <Loader2 size={13} style={{ animation:'spin 1s linear infinite' }}/>
                            : playingVoice===voice ? <Pause size={13}/> : <Play size={13}/>}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Language */}
              <div>
                <label style={labelStyle}>
                  <Globe size={11} style={{ display:'inline', marginRight:5, verticalAlign:'middle' }}/>
                  Output Language
                </label>
                <div style={{ position:'relative' }}>
                  <select value={language} onChange={e=>setLanguage(e.target.value)}
                    style={{ ...inputStyle({ padding:'10px 36px 10px 14px', appearance:'none', cursor:'pointer' }) }}>
                    {LANGUAGES.map(l => (
                      <option key={l.value} value={l.value}>{l.label}</option>
                    ))}
                  </select>
                  <ChevronDown size={15} style={{ position:'absolute',right:12,top:'50%',
                                                  transform:'translateY(-50%)',color:t.textMuted,
                                                  pointerEvents:'none' }}/>
                </div>
              </div>

              {/* Word count */}
              <div>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:10 }}>
                  <span style={labelStyle}>⏱ Length</span>
                  <span style={{ fontSize:12, color:t.primary, fontWeight:600 }}>
                    ~{wordCount} words · {Math.round(wordCount/130)} min
                  </span>
                </div>
                <input type="range" min={300} max={3000} step={100} value={wordCount}
                  onChange={e=>setWordCount(Number(e.target.value))}
                  style={{ width:'100%', accentColor:t.primary, cursor:'pointer' }}/>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:11,
                              color:t.textFaint, marginTop:5 }}>
                  <span>Short (~2 min)</span><span>Long (~23 min)</span>
                </div>
              </div>

              {/* Instructions */}
              <div>
                <label style={labelStyle}>
                  Instructions{' '}
                  <span style={{ color:t.textFaint, fontWeight:400, textTransform:'none', letterSpacing:0 }}>
                    (optional)
                  </span>
                </label>
                <textarea value={instructions} onChange={e=>setInstructions(e.target.value)}
                  placeholder="e.g. Make it funny, target beginners, focus on chapter 3..."
                  style={{ ...inputStyle({ height:76, resize:'none', lineHeight:'1.5' }) }}
                  onFocus={e=>(e.target.style.borderColor=t.borderFocus)}
                  onBlur={e=>(e.target.style.borderColor=t.border)}/>
              </div>

              {/* Generate */}
              <button onClick={handleGenerate} disabled={!canGenerate}
                style={{
                  width:'100%', padding:'14px', borderRadius:14, border:'none',
                  cursor: canGenerate ? 'pointer' : 'not-allowed',
                  background: canGenerate
                    ? `linear-gradient(135deg, ${t.secondary} 0%, ${t.primary} 100%)`
                    : t.border,
                  color: canGenerate ? '#fff' : t.textFaint,
                  fontSize:14, fontWeight:700,
                  display:'flex', alignItems:'center', justifyContent:'center', gap:8,
                  boxShadow: canGenerate ? `0 4px 20px ${t.primary}50` : 'none',
                  position:'relative', overflow:'hidden',
                }}>
                {isGenerating && (
                  <div style={{ position:'absolute', left:0, top:0, bottom:0,
                                background:'rgba(255,255,255,0.18)', transition:'width .6s ease',
                                width:`${progress}%` }}/>
                )}
                <span style={{ position:'relative', display:'flex', alignItems:'center', gap:8 }}>
                  {isGenerating
                    ? <><Loader2 size={16} style={{ animation:'spin 1s linear infinite' }}/>{step||'Generating...'}</>
                    : <><Sparkles size={16}/>Generate Podcast</>}
                </span>
              </button>

              {!apiConfig?.key && (
                <div style={{ display:'flex', gap:8, background:t.amberBg,
                              border:`1px solid ${t.accent}40`, borderRadius:12, padding:'10px 12px' }}>
                  <Info size={14} style={{ color:t.accent, flexShrink:0, marginTop:1 }}/>
                  <p style={{ margin:0, fontSize:12, color:t.amber }}>
                    Set your API key to start generating podcasts.
                  </p>
                </div>
              )}

              {/* Signature */}
              <div style={{ marginTop:4, paddingTop:16, borderTop:`1px solid ${t.border}`,
                            textAlign:'center' }}>
                <p style={{ margin:0, fontSize:11, color: t.textFaint, letterSpacing:0.3 }}>
                  built with{' '}
                  <span style={{ color:'#a855f7', fontSize:13 }}>💜</span>{' '}
                  <a href="https://x.com/Hoxygo" target="_blank" rel="noreferrer"
                     style={{ color: t.primary, fontWeight:600, textDecoration:'none',
                              borderBottom:`1px solid ${t.primary}40`, paddingBottom:1 }}>
                    hoxygo
                  </a>
                </p>
                <a href="https://ko-fi.com/hoxigo" target="_blank" rel="noreferrer"
                   style={{ display:'inline-flex', justifyContent:'center', marginTop:8 }}>
                  <img
                    src="https://storage.ko-fi.com/cdn/kofi5.png"
                    alt="Support on Ko-fi"
                    style={{
                      height:36, borderRadius:12, border:`1px solid ${t.border}`,
                      boxShadow:`0 6px 18px ${t.primary}20`, objectFit:'contain'
                    }}
                  />
                </a>
              </div>
            </div>
          </div>

          {/* ── Output panel ── */}
          <div style={{ flex:1, overflowY:'auto', background: t.outputBg }}>
            {isGenerating && (
              <div style={{ padding:'16px 24px 0' }}>
                <div style={{ background:t.card, border:`1px solid ${t.primary}40`,
                              borderRadius:16, padding:'14px 20px', display:'flex',
                              alignItems:'center', gap:14,
                              boxShadow:`0 0 0 3px ${t.primary}15` }}>
                  <PulsingWave t={t}/>
                  <div>
                    <p style={{ margin:0, fontSize:13, fontWeight:600, color:t.text }}>{step}</p>
                    <p style={{ margin:'3px 0 0', fontSize:11, color:t.textMuted }}>
                      {progress < 50 ? 'Analyzing your document...' : 'Synthesizing voices with AI...'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {podcasts.length === 0 && !isGenerating ? (
              <div style={{ height:'100%', display:'flex', flexDirection:'column',
                            alignItems:'center', justifyContent:'center', textAlign:'center', padding:32 }}>
                <div style={{ width:96, height:96, display:'flex',
                              alignItems:'center', justifyContent:'center', marginBottom:20 }}>
                  <img src={logoBase64} alt="" style={{ width:96, height:96, objectFit:'contain', opacity:0.9 }}/>
                </div>
                <h3 style={{ margin:0, fontSize:16, fontWeight:700, color:t.textMid }}>No podcasts yet</h3>
                <p style={{ margin:'8px 0 0', fontSize:13, color:t.textMuted, maxWidth:260, lineHeight:1.6 }}>
                  Upload a PDF, pick two voices and a language, then hit Generate.
                </p>
                <div style={{ display:'flex', gap:10, marginTop:24 }}>
                  {['📄 Upload PDF', '🎙 Pick voices', '✨ Generate'].map((s,i) => (
                    <div key={i} style={{ background:t.card, border:`1px solid ${t.border}`,
                                         borderRadius:12, padding:'10px 14px', textAlign:'center',
                                         boxShadow: t.shadow }}>
                      <div style={{ width:20,height:20,borderRadius:99,background:t.purplePale,
                                    color:t.primary,fontSize:11,fontWeight:700,
                                    display:'flex',alignItems:'center',justifyContent:'center',
                                    margin:'0 auto 6px' }}>{i+1}</div>
                      <span style={{ fontSize:12, color:t.textMid }}>{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : podcasts.length > 0 ? (
              <div style={{ padding:24 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
                  <h2 style={{ margin:0, fontSize:13, fontWeight:700, color:t.textMid,
                               textTransform:'uppercase', letterSpacing:1 }}>
                    Podcasts{' '}
                    <span style={{ color:t.primary, fontWeight:400, textTransform:'none', letterSpacing:0 }}>
                      ({podcasts.length})
                    </span>
                  </h2>
                  <button onClick={()=>setPodcasts([])}
                    style={{ fontSize:12,color:t.textFaint,background:'none',border:'none',cursor:'pointer' }}
                    onMouseEnter={e=>(e.currentTarget.style.color='#ef4444')}
                    onMouseLeave={e=>(e.currentTarget.style.color=t.textFaint)}>
                    Clear all
                  </button>
                </div>
                {podcasts.map(p => (
                  <AudioPlayer key={p.id} podcast={p} t={t}
                    onDelete={()=>setPodcasts(prev=>prev.filter(x=>x.id!==p.id))}
                    onUpdate={(updated)=>setPodcasts(prev=>prev.map(x=>x.id===updated.id?updated:x))}
                    onError={handleApiError}/>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}
