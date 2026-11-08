# عازب | AZIB

منصة اجتماعية **غير ربحية** لتيسير الزواج في السوق الأول (صنعاء/اليمن).

تهدف المنصة إلى تخفيف تكاليف الزواج وتيسير السبل له عبر:
- مساعدات مالية منضبطة بمراجعة أهلية.
- أعراس جماعية.
- شركاء بخصومات.
- سوق خير للتبرعات العينية.
- وظائف ومتطوعون.
- محتوى توعوي وميثاق مجتمعي.

---

## حالة المشروع

**المرحلة الحالية:** P03 — Core Platform (قادمة). P02 مكتملة.

| المؤشر | الحالة |
|--------|--------|
| Expo SDK | 58 |
| React / React Native | 19.3 / 0.88.1 |
| TypeScript | 6.0 (strict + noUncheckedIndexedAccess) |
| Node | 26 |
| CI | معرّف في `.github/workflows/ci.yml` (بانتظار أول تشغيل ناجح) |
| قاعدة بيانات | غير متصلة (P18) |
| خدمات خارجية | غير متصلة |
---

## المبادئ الحاكمة

- غير ربحي: لا عمولات، لا اشتراكات.
- لا خدمات تعارف، ولا ملفات عامة للأفراد.
- اختيار الزوج مسؤولية الأسر.
- لا مساعدة دون تحقق بشري.
- Non-Custodial: لا محفظة، لا Escrow.
- تقييم آلي **Advisory** فقط.

---

## البيئة التقنية (المعتمدة)

- Expo + React Native + TypeScript (strict) + Expo Router
- Zustand + TanStack Query
- React Hook Form + Zod
- i18next (لغة افتراضية `ar`, RTL)
- Reanimated + Gesture Handler
- Supabase (خلف Provider Abstraction)
- Jest + RNTL + Playwright (Web) + pgTAP
- GitHub Actions · مدير الحزم: npm

---

## الحوكمة

- `docs/AGENT_RULES.md` — القواعد الملزمة.
- `PROJECT_CONTEXT.md` — السياق التقني الحالي.
- `DEVELOPMENT_PROGRESS.md` — حالة المراحل.
- `docs/DECISIONS.md` — سجل القرارات (ADR).
- `docs/PRODUCT_POLICIES.md` — قرارات بشرية معلّقة.
- `docs/GLOSSARY.md` — المصطلحات.
- `docs/ASSET_LICENSES.md` — تراخيص الأصول.
- `docs/THREAT_MODEL.md` — نموذج التهديد.

---

## الترخيص

يُحدَّد في P23 قبل أي نشر عام للكود.

---

> **هذا المستودع عام.** لا أسرار، ولا بيانات شخصية حقيقية، ولا مفاتيح دفع.
