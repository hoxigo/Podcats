# Podcats (한국어)

번역이 곧 제공될 예정입니다. 영어 원문을 참고해주세요: [README.md](README.md).
# Podcats 🎙️ (한국어)

몇 분 만에 PDF를 두 화자의 팟캐스트로 변환합니다. 다국어 지원, Gemini 키는 로컬에만 저장됩니다.

---

## ✨ 주요 기능
- 📄 PDF → 두 사람 대화 오디오
- 🌍 12개 언어/방언 (사우디, 이집트, 영/미 등)
- 🎙️ 5가지 AI 보이스, 미리 듣기 지원
- ✏️ 스크립트 편집 및 재생성
- 🔄 전체 또는 부분 재생성
- 🌗 시스템 연동 라이트/다크 모드
- 🔒 Gemini 키 로컬 저장
- 🖥️ 데스크톱 앱 (macOS & Windows)

---

## 📥 설치

### 다운로드 ([Releases](../../releases/latest))
- **Windows:** `Podcats Setup 1.0.0.exe`
- **macOS Apple Silicon:** `Podcats-1.0.0-arm64.dmg`
- **macOS Intel:** `Podcats-1.0.0.dmg`

### 1단계 — 설치
- **Windows:** EXE 실행 후 Start 메뉴에서 실행
- **macOS:** DMG 열고 Applications로 드래그

### 2단계 — 첫 실행 ⚠️ (macOS)
Gatekeeper가 차단할 수 있습니다. 아래 실행:
```bash
sudo xattr -cr /Applications/Podcats.app && open /Applications/Podcats.app
```
또는 **System Settings → Privacy & Security → “Open Anyway”** (한 번만 필요)

---

## 🔑 API 키 설정
1. [[ai.google.dev]](https://aistudio.google.com/api-keys) 에서 무료 Gemini 키 발급
2. 앱에서 **Set API Key** 클릭
3. 키 붙여넣기 — 로컬에만 저장

---

## 🚀 개발자용
```bash
git clone https://github.com/Hoxygo/Podcats.git
cd Podcats
npm install
npm run electron:dev       # 개발
npm run electron:build     # macOS DMG 빌드
npm run electron:build:win # Windows 설치 파일 (Windows 또는 wine)
```

---

## ⚠️ Windows 경고
SmartScreen 경고가 뜨면 "More info" → "Run anyway" 클릭 (현재 미서명).

## ☕ 후원
유용했다면 여기에서 지원할 수 있습니다: [ko-fi.com/hoxigo](https://ko-fi.com/hoxigo)

---

## 🎙️ 동작 방식
```
PDF 업로드 → Gemini 2.5 Flash가 대본 작성
           → Gemini TTS가 두 가지 보이스 생성
           → WaveSurfer로 파형을 재생/다운로드
```

---

## 🌍 지원 언어
| 언어 | 방언 |
|------|------|
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

## 🛠️ 기술 스택
| 레이어 | 기술 |
|--------|------|
| UI | React 19 + Vite + TypeScript |
| 데스크톱 | Electron 36 |
| AI | Google Gemini 2.5 Flash |
| 오디오 | Gemini TTS + WaveSurfer.js |

---

## 📄 라이선스
MIT © [Hoxygo](https://x.com/Hoxygo)
