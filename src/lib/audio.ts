export function addWavHeader(pcmBase64: string, sampleRate = 24000): string {
  const bin = atob(pcmBase64);
  const pcm = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) pcm[i] = bin.charCodeAt(i);
  const ch = 1, bps = 16;
  const buf = new ArrayBuffer(44 + pcm.length);
  const v = new DataView(buf);
  const ws = (o: number, s: string) => { for (let i = 0; i < s.length; i++) v.setUint8(o+i, s.charCodeAt(i)); };
  ws(0,'RIFF'); v.setUint32(4,36+pcm.length,true); ws(8,'WAVE');
  ws(12,'fmt '); v.setUint32(16,16,true); v.setUint16(20,1,true); v.setUint16(22,ch,true);
  v.setUint32(24,sampleRate,true); v.setUint32(28,(sampleRate*ch*bps)/8,true);
  v.setUint16(32,(ch*bps)/8,true); v.setUint16(34,bps,true);
  ws(36,'data'); v.setUint32(40,pcm.length,true);
  new Uint8Array(buf,44).set(pcm);
  let s=''; const b=new Uint8Array(buf);
  for (let i=0;i<b.length;i+=0x8000) s+=String.fromCharCode(...Array.from(b.subarray(i,i+0x8000)));
  return btoa(s);
}

export function getPlayableAudioUrl(b64: string): string {
  try { if (atob(b64.slice(0,20)).startsWith('RIFF')) return `data:audio/wav;base64,${b64}`; } catch {}
  return `data:audio/wav;base64,${addWavHeader(b64,24000)}`;
}
