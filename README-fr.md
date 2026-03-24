# Podcats 🎙️ (Français)

Transformez n’importe quel PDF en podcast à deux voix en quelques minutes, avec support multilingue et clé Gemini conservée localement.

---

## ✨ Fonctionnalités
- 📄 PDF → dialogue à deux voix
- 🌍 12 langues avec dialectes (saoudien, égyptien, anglais UK/US, etc.)
- 🎙️ 5 voix IA avec pré-écoute
- ✏️ Script modifiable + régénération après édition
- 🔄 Régénération complète ou du passage édité
- 🌗 Mode clair/sombre selon le système
- 🔒 Clé Gemini stockée sur votre appareil
- 🖥️ Application de bureau (macOS & Windows)

---

## 📥 Installation

### Téléchargement (depuis [Releases](../../releases/latest))
- **Windows :** `Podcats Setup 1.0.0.exe`
- **macOS Apple Silicon :** `Podcats-1.0.0-arm64.dmg`
- **macOS Intel :** `Podcats-1.0.0.dmg`

### Étape 1 — Installer
- **Windows :** lancez le fichier EXE puis ouvrez Podcats depuis le menu Start.
- **macOS :** ouvrez le DMG et glissez l’app dans Applications.

### Étape 2 — Premier lancement ⚠️ (macOS)
Gatekeeper peut bloquer au premier démarrage. Exécutez :
```bash
sudo xattr -cr /Applications/Podcats.app && open /Applications/Podcats.app
```
Ou passez par **System Settings → Privacy & Security → “Open Anyway”** (une seule fois).

---

## 🔑 Clé API
1. Obtenez une clé gratuite Gemini sur [[ai.google.dev]](https://aistudio.google.com/api-keys)
2. Dans l’app, cliquez **Set API Key**
3. Collez la clé — elle reste locale

---

## 🚀 Pour les développeurs
```bash
git clone https://github.com/Hoxygo/Podcats.git
cd Podcats
npm install
npm run electron:dev        # développement
npm run electron:build      # build DMG macOS
npm run electron:build:win  # build Windows (Windows ou wine requis)
```

---

## ⚠️ Avertissement Windows
Si SmartScreen affiche un avertissement : cliquez « More info » puis « Run anyway » (l’app n’est pas signée).

## ☕ Support
Si l’app vous est utile, vous pouvez soutenir le projet : [ko-fi.com/hoxigo](https://ko-fi.com/hoxigo)

---

## 🎙️ Fonctionnement
```
Upload PDF → Gemini 2.5 Flash écrit le dialogue
           → Gemini TTS génère deux voix
           → WaveSurfer affiche la forme d’onde pour lecture/téléchargement
```

---

## 🌍 Langues supportées
| Langue | Dialecte |
|--------|----------|
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

## 🛠️ Stack
| Couche | Technologie |
|--------|-------------|
| UI | React 19 + Vite + TypeScript |
| Desktop | Electron 36 |
| IA | Google Gemini 2.5 Flash |
| Audio | Gemini TTS + WaveSurfer.js |

---

## 📄 Licence
MIT © [Hoxygo](https://x.com/Hoxygo)
