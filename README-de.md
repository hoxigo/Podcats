# Podcats (Deutsch)

Übersetzung folgt in Kürze. Siehe die englische Originalversion: [README.md](README.md).
# Podcats 🎙️ (Deutsch)

Wandelt jedes PDF in wenigen Minuten in einen Zwei-Stimmen-Podcast um, mit Mehrsprachen-Support und lokal gespeichertem Gemini-Schlüssel.

---

## ✨ Funktionen
- 📄 PDF → Dialog mit zwei Sprechern
- 🌍 12 Sprachen mit Dialekten (Saudi, Ägyptisch, Britisch, Amerikanisch usw.)
- 🎙️ 5 KI-Stimmen mit Vorhörfunktion
- ✏️ Bearbeitbares Skript + Audioregeneration nach Änderungen
- 🔄 Vollständige oder Teil-Regeneration
- 🌗 Hell/Dunkel je nach System
- 🔒 Gemini-Schlüssel bleibt lokal
- 🖥️ Desktop-App (macOS & Windows)

---

## 📥 Installation

### Download (über [Releases](../../releases/latest))
- **Windows (empfohlen):** `Podcats Setup 1.0.0.exe`
- **macOS Apple Silicon:** `Podcats-1.0.0-arm64.dmg`
- **macOS Intel:** `Podcats-1.0.0.dmg`

### Schritt 1 — Installieren
- **Windows:** EXE ausführen, dann Podcats im Startmenü öffnen.
- **macOS:** DMG öffnen und in Applications ziehen.

### Schritt 2 — Erster Start ⚠️ (macOS)
Gatekeeper kann blockieren. Führe aus:
```bash
sudo xattr -cr /Applications/Podcats.app && open /Applications/Podcats.app
```
Oder: **System Settings → Privacy & Security → “Open Anyway”** (nur einmal nötig).

---

## 🔑 API-Schlüssel
1. Gratis-Gemini-Key unter [ai.google.dev](https://ai.google.dev) holen
2. In der App **Set API Key** anklicken
3. Key einfügen — bleibt lokal gespeichert

---

## 🚀 Für Entwickler
```bash
git clone https://github.com/Hoxygo/Podcats.git
cd Podcats
npm install
npm run electron:dev       # Entwicklung
npm run electron:build     # macOS DMG bauen
npm run electron:build:win # Windows-Installer bauen (Windows oder wine)
```

---

## 🎙️ Funktionsweise
```
PDF hochladen → Gemini 2.5 Flash schreibt den Dialog
              → Gemini TTS erzeugt zwei Stimmen
              → WaveSurfer zeigt die Wellenform für Playback/Download
```

---

## 🌍 Unterstützte Sprachen
| Sprache | Dialekt |
|---------|---------|
| English US | American |
| English UK | British |
| Arabic — Saudi | Gulf/Saudi |
| Arabic — Egyptian | Egyptian |
| Spanish | Latin American |
| French | Standard |
| German | Standard |
| Italian | Standard |
| Japanese | Standard |
| Korean | Standard |
| Portuguese | Brazilian |
| Russian | Standard |
| Chinese | Mandarin |

---

## 🛠️ Tech-Stack
| Ebene | Technologie |
|-------|-------------|
| UI | React 19 + Vite + TypeScript |
| Desktop | Electron 36 |
| KI | Google Gemini 2.5 Flash |
| Audio | Gemini TTS + WaveSurfer.js |

---

## 📄 Lizenz
MIT © [Hoxygo](https://x.com/Hoxygo)
