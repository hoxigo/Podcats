# Podcats 🎙️ (Español)

Convierte cualquier PDF en un pódcast de dos voces en minutos, con soporte multilenguaje y la clave de Gemini guardada localmente.

---

## ✨ Funciones
- 📄 PDF → diálogo entre dos locutores
- 🌍 12 idiomas con dialectos (saudí, egipcio, británico, estadounidense, etc.)
- 🎙️ 5 voces de IA con vista previa
- ✏️ Guion editable + regeneración de audio tras editar
- 🔄 Regeneración total o del fragmento editado
- 🌗 Modo claro/oscuro según el sistema
- 🔒 Privado: tu clave de Gemini se queda en tu equipo
- 🖥️ App de escritorio (macOS y Windows)

---

## 📥 Instalación

### Descarga (desde [Releases](../../releases/latest))
- **Windows:** `Podcats Setup 1.0.0.exe`
- **macOS Apple Silicon:** `Podcats-1.0.0-arm64.dmg`
- **macOS Intel:** `Podcats-1.0.0.dmg`

### Paso 1 — Instalar
- **Windows:** ejecuta el EXE e inicia Podcats desde el menú Start.
- **macOS:** abre el DMG y arrastra la app a Applications.

### Paso 2 — Primer inicio ⚠️ (macOS)
Gatekeeper puede bloquear el primer arranque. Ejecuta:
```bash
sudo xattr -cr /Applications/Podcats.app && open /Applications/Podcats.app
```
O ve a **System Settings → Privacy & Security → “Open Anyway”** (solo la primera vez).

---

## 🔑 Clave API
1. Consigue una clave gratuita de Gemini en [aistudio.google.com/api-keys](https://aistudio.google.com/api-keys)
2. En la app, pulsa **Set API Key**
3. Pega la clave — se guarda localmente

---

## 🚀 Para desarrolladores
```bash
git clone https://github.com/Hoxygo/Podcats.git
cd Podcats
npm install
npm run electron:dev       # desarrollo
npm run electron:build     # build DMG macOS
npm run electron:build:win # build instalador Windows (requiere Windows o wine)
```

---

## ⚠️ Aviso en Windows
Si SmartScreen muestra una alerta: clic en "More info" → "Run anyway" (la app no está firmada).

## ☕ Soporte
Si te resulta útil, puedes apoyar el proyecto: [ko-fi.com/hoxigo](https://ko-fi.com/hoxigo)

---

## 🎙️ Cómo funciona
```
Subir PDF → Gemini 2.5 Flash escribe el diálogo
          → Gemini TTS genera dos voces
          → WaveSurfer muestra la onda para reproducir y descargar
```

---

## 🌍 Idiomas soportados
| Idioma | Dialecto |
|-------|----------|
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
| Capa | Tecnología |
|------|------------|
| UI | React 19 + Vite + TypeScript |
| Escritorio | Electron 36 |
| IA | Google Gemini 2.5 Flash |
| Audio | Gemini TTS + WaveSurfer.js |

---

## 📄 Licencia
MIT © [Hoxygo](https://x.com/Hoxygo)
