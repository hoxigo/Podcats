<div align="center">
  <img src="src/logo.png" width="120" alt="Podcats Logo" />
  <h1>Podcats 🎙️</h1>
  <p><strong>The purr-fect AI podcast generator</strong></p>
  <p>Convert any PDF into an engaging multi-speaker podcast using Gemini AI</p>

  <p>
    <img src="https://img.shields.io/badge/macOS-supported-purple?logo=apple" />
    <img src="https://img.shields.io/badge/Electron-36-blue?logo=electron" />
    <img src="https://img.shields.io/badge/Gemini-AI-orange?logo=google" />
    <img src="https://img.shields.io/badge/license-MIT-green" />
  </p>

  <p>built with 💜 by <a href="https://x.com/Hoxygo">@Hoxygo</a></p>
</div>

---

## ✨ Features

- 📄 **PDF → Podcast** — Drop any PDF and get a natural two-speaker conversation
- 🌍 **12 Languages** — Including Saudi Arabic, Egyptian Arabic, UK/US English, and more
- 🎙️ **5 AI Voices** — Male & Female voices with live preview before generating
- ✏️ **Editable Script** — Edit the generated script and regenerate audio instantly
- 🔄 **Regenerate** — Regenerate audio from edited script, or regenerate the entire podcast
- 🌗 **Light & Dark Mode** — Follows macOS system preference automatically
- 🔒 **Private & Local** — Your Gemini API key is stored on your device only
- 🍎 **Native Mac App** — Runs as a proper macOS app (Apple Silicon + Intel)

---

## 📥 Installation

### Step 1 — Download
Go to [Releases](../../releases/latest) and download:
- `Podcats-1.0.0-arm64.dmg` → Apple Silicon (M1/M2/M3/M4)
- `Podcats-1.0.0.dmg` → Intel Mac

### Step 2 — Install
Open the `.dmg` file and drag **Podcats** to your **Applications** folder.

### Step 3 — First Launch Fix ⚠️

Because Podcats is not signed with an Apple certificate, macOS will block it on first launch.

**Fix — Option A (Terminal):**
```bash
xattr -cr /Applications/Podcats.app
```
Then open the app normally.

**Fix — Option B (No Terminal):**
1. Try to open Podcats → you'll see a "damaged" warning → click **Cancel**
2. Go to **System Settings → Privacy & Security**
3. Scroll down → you'll see **"Podcats was blocked"**
4. Click **"Open Anyway"**

> This is a one-time step. After that, the app opens normally every time.

---

## 🔑 API Key Setup

1. Get a **free** Gemini API key at [ai.google.dev](https://ai.google.dev)
2. Open Podcats and click **"Set API Key"** in the top right
3. Paste your key — it's saved locally on your device and never leaves it

---

## 🚀 Getting Started (Developers)

```bash
git clone https://github.com/Hoxygo/Podcats.git
cd Podcats
npm install
npm run electron:dev   # development
npm run electron:build # build DMG
```

---

## 🎙️ How It Works

```
PDF Upload → Gemini 2.5 Flash reads & writes a dialogue script
           → Gemini TTS generates audio with two distinct voices
           → WaveSurfer renders the waveform for playback & download
```

---

## 🌍 Supported Languages

| Language | Dialect |
|----------|---------|
| 🇺🇸 English US | American English |
| 🇬🇧 English UK | British English |
| 🇸🇦 Arabic — Saudi | Gulf/Saudi dialect |
| 🇪🇬 Arabic — Egyptian | Egyptian dialect |
| 🇪🇸 Spanish | Latin American |
| 🇫🇷 French | Standard French |
| 🇩🇪 German | Standard German |
| 🇮🇹 Italian | Standard Italian |
| 🇯🇵 Japanese | Standard Japanese |
| 🇰🇷 Korean | Standard Korean |
| 🇧🇷 Portuguese | Brazilian |
| 🇷🇺 Russian | Standard Russian |
| 🇨🇳 Chinese | Mandarin |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| UI | React 19 + Vite + TypeScript |
| Desktop | Electron 36 |
| AI Model | Google Gemini 2.5 Flash |
| Audio | Gemini TTS + WaveSurfer.js |

---

## 📄 License

MIT © [Hoxygo](https://x.com/Hoxygo)
