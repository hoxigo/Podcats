# بودكاتس 🎙️

محول ملفات PDF إلى بودكاست ثنائي المتحدثين في دقائق، مع دعم لغات ولهجات متعددة وحفظ مفتاح Gemini محليًا.

---

## ✨ المزايا
- 📄 تحويل أي PDF إلى حوار صوتي بين متحدثين
- 🌍 12 لغة بلهجات محددة (السعودية، المصرية، البريطانية، الأمريكية، وغيرها)
- 🎙️ 5 أصوات ذكاء اصطناعي مع معاينة مباشرة
- ✏️ نص قابل للتحرير + إعادة توليد الصوت بعد التعديل
- 🔄 إعادة توليد صوت كامل أو من المقطع المعدَّل فقط
- 🌗 وضع فاتح/داكن يتبع نظام التشغيل
- 🔒 خصوصية تامة: مفتاح Gemini يبقى على جهازك
- 🖥️ تطبيق سطح مكتب أصلي (macOS و Windows)

---

## 📥 التثبيت

### التنزيل (من [Releases](../../releases/latest))
- **Windows:** `Podcats Setup 1.0.0.exe`
- **macOS Apple Silicon:** `Podcats-1.0.0-arm64.dmg`
- **macOS Intel:** `Podcats-1.0.0.dmg`

### الخطوة 1 — التثبيت
- **Windows:** شغّل ملف التثبيت ثم افتح Podcats من قائمة Start.
- **macOS:** افتح ملف DMG واسحب التطبيق إلى مجلد Applications.

### الخطوة 2 — إصلاح التشغيل الأول ⚠️ (macOS)
قد يمنع Gatekeeper التشغيل لأول مرة. نفِّذ:
```bash
sudo xattr -cr /Applications/Podcats.app && open /Applications/Podcats.app
```
أو من الإعدادات: **System Settings → Privacy & Security → “Open Anyway”** (خطوة لمرة واحدة فقط).

---

## 🔑 إعداد مفتاح الـ API
1. احصل على مفتاح Gemini مجاني من [aistudio.google.com/api-keys](https://aistudio.google.com/api-keys)
2. افتح التطبيق واضغط **Set API Key**
3. الصق المفتاح — يُحفظ محليًا ولا يغادر جهازك

---

## 🚀 تشغيل المطورين
```bash
git clone https://github.com/Hoxygo/Podcats.git
cd Podcats
npm install
npm run electron:dev      # وضع التطوير
npm run electron:build    # بناء DMG للـ macOS
npm run electron:build:win # بناء مثبت Windows (يحتاج ويندوز أو wine)
```

---

## ⚠️ إصلاح تحذير Windows
إذا ظهر تحذير SmartScreen: اضغط "More info" ثم "Run anyway" (التطبيق غير موقّع حاليًا).

## ☕ الدعم
إذا وجدت Podcats مفيدًا يمكنك دعم المشروع: [ko-fi.com/hoxigo](https://ko-fi.com/hoxigo)

---

## 🎙️ كيف يعمل
```
رفع PDF → Gemini 2.5 Flash يكتب النص الحواري
        → Gemini TTS يولد صوتين مميزين
        → WaveSurfer يعرض الموجة للتشغيل والتنزيل
```

---

## 🌍 اللغات المدعومة
| اللغة | اللهجة |
|-------|--------|
| الإنجليزية الأمريكية | American English |
| الإنجليزية البريطانية | British English |
| العربية السعودية | لهجة خليجية/سعودية |
| العربية المصرية | لهجة مصرية |
| الإسبانية | لاتينية |
| الفرنسية | قياسية |
| الألمانية | قياسية |
| الإيطالية | قياسية |
| اليابانية | قياسية |
| الكورية | قياسية |
| البرتغالية | برازيلية |
| الروسية | قياسية |
| الصينية | ماندراين |

---

## 🛠️ التقنيات
| الطبقة | التقنية |
|--------|---------|
| الواجهة | React 19 + Vite + TypeScript |
| سطح المكتب | Electron 36 |
| الذكاء الاصطناعي | Google Gemini 2.5 Flash |
| الصوت | Gemini TTS + WaveSurfer.js |

---

## 📄 الترخيص
MIT © [Hoxygo](https://x.com/Hoxygo)
