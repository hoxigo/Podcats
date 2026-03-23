# Podcats (日本語)

翻訳は近日公開予定です。英語版はこちらをご覧ください: [README.md](README.md)。
# Podcats 🎙️ (日本語)

数分でPDFを二人の対話ポッドキャストに変換。多言語対応で、Geminiキーはローカル保存。

---

## ✨ 特長
- 📄 PDF → 2人の会話音声
- 🌍 12言語・方言（サウジ、エジプト、英/米など）
- 🎙️ 5つのAIボイス、プレビュー付き
- ✏️ スクリプト編集 & 編集後の再生成
- 🔄 全体または部分の再生成
- 🌗 システムに合わせたライト/ダーク
- 🔒 Geminiキーは端末にのみ保存
- 🖥️ デスクトップアプリ（macOS & Windows）

---

## 📥 インストール

### ダウンロード（[Releases](../../releases/latest)）
- **Windows:** `Podcats Setup 1.0.0.exe`
- **macOS Apple Silicon:** `Podcats-1.0.0-arm64.dmg`
- **macOS Intel:** `Podcats-1.0.0.dmg`

### 手順 1 — インストール
- **Windows:** EXEを実行し、Startメニューから起動。
- **macOS:** DMGを開き、Applicationsへドラッグ。

### 手順 2 — 初回起動 ⚠️（macOS）
Gatekeeperが初回をブロックする場合があります。実行:
```bash
sudo xattr -cr /Applications/Podcats.app && open /Applications/Podcats.app
```
または **System Settings → Privacy & Security → “Open Anyway”**（初回のみ）。

---

## 🔑 APIキー
1. [ai.google.dev](https://ai.google.dev) で無料のGeminiキー取得
2. アプリで **Set API Key** をクリック
3. キーを貼り付け（ローカル保存のみ）

---

## 🚀 開発者
```bash
git clone https://github.com/Hoxygo/Podcats.git
cd Podcats
npm install
npm run electron:dev       # 開発
npm run electron:build     # macOS DMG ビルド
npm run electron:build:win # Windows インストーラ（Windows または wine）
```

---

## 🎙️ 動作
```
PDFアップロード → Gemini 2.5 Flash が台本を作成
                → Gemini TTS が2つの声を生成
                → WaveSurfer が波形を表示し再生/ダウンロード
```

---

## 🌍 対応言語
| 言語 | 方言 |
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

## 🛠️ 技術スタック
| レイヤー | 技術 |
|----------|------|
| UI | React 19 + Vite + TypeScript |
| デスクトップ | Electron 36 |
| AI | Google Gemini 2.5 Flash |
| オーディオ | Gemini TTS + WaveSurfer.js |

---

## 📄 ライセンス
MIT © [Hoxygo](https://x.com/Hoxygo)
