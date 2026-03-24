# Podcats (简体中文)

翻译即将推出。请先查看英文版本：[README.md](README.md)。
# Podcats 🎙️ (简体中文)

几分钟内将任何 PDF 转成双人播客，支持多语言，Gemini 密钥保存在本地。

---

## ✨ 功能
- 📄 PDF → 双人对话音频
- 🌍 12 种语言/方言（沙特、埃及、英/美等）
~- 🎙️ 5 种 AI 声音，支持预听~
- ✏️ 可编辑脚本，修改后可重新生成音频
- 🔄 支持全量或局部重新生成
- 🌗 跟随系统的明/暗模式
- 🔒 Gemini 密钥仅存于本机
- 🖥️ 桌面应用（macOS & Windows）

---

## 📥 安装

### 下载（来自 [Releases](../../releases/latest)）
- **Windows：** `Podcats Setup 1.0.0.exe`
- **macOS Apple Silicon：** `Podcats-1.0.0-arm64.dmg`
- **macOS Intel：** `Podcats-1.0.0.dmg`

### 步骤 1 — 安装
- **Windows：** 运行 EXE，然后在 Start 菜单启动 Podcats。
- **macOS：** 打开 DMG，拖到 Applications。

### 步骤 2 — 首次运行 ⚠️（macOS）
Gatekeeper 可能拦截首次启动。执行：
```bash
sudo xattr -cr /Applications/Podcats.app && open /Applications/Podcats.app
```
或进入 **System Settings → Privacy & Security → “Open Anyway”**（仅需一次）。

---

## 🔑 API 密钥
1. 在 [[ai.google.dev]](https://aistudio.google.com/api-keys) 获取免费的 Gemini Key
2. 在应用中点击 **Set API Key**
3. 粘贴密钥——只保存在本地

---

## 🚀 开发者
```bash
git clone https://github.com/Hoxygo/Podcats.git
cd Podcats
npm install
npm run electron:dev       # 开发
npm run electron:build     # 构建 macOS DMG
npm run electron:build:win # 构建 Windows 安装包（需 Windows 或 wine）
```

---

## ⚠️ Windows 警告
如果 SmartScreen 警告：点击 “More info” → “Run anyway”（当前未签名）。

## ☕ 支持
如果觉得有用，可在此支持项目：[ko-fi.com/hoxigo](https://ko-fi.com/hoxigo)

---

## 🎙️ 工作流程
```
上传 PDF → Gemini 2.5 Flash 写出对话脚本
        → Gemini TTS 生成两种声音
        → WaveSurfer 显示波形供播放/下载
```

---

## 🌍 支持的语言
| 语言 | 方言 |
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

## 🛠️ 技术栈
| 层 | 技术 |
|----|------|
| UI | React 19 + Vite + TypeScript |
| 桌面 | Electron 36 |
| AI | Google Gemini 2.5 Flash |
| 音频 | Gemini TTS + WaveSurfer.js |

---

## 📄 许可
MIT © [Hoxygo](https://x.com/Hoxygo)
