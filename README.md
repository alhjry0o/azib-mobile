# عازب | AZIB

منصة اجتماعية **غير ربحية** لتيسير الزواج في السوق الأول (صنعاء/اليمن).

تهدف المنصة إلى تخفيف تكاليف الزواج وتيسير السبل له عبر:
- مساعدات مالية منضبطة بمراجعة أهلية بشرية.
- أعراس جماعية.
- شركاء بخصومات.
- سوق خير للتبرعات العينية.
- وظائف ومتطوعون.
- محتوى توعوي وميثاق مجتمعي.

---

## حالة المشروع

**المرحلة الحالية:** P07 — Home (قادمة).
**P06 — Auth / Profile / Settings / Legal مغلقة** (2026-11-16): حسابات وجلسات، ملف شخصي، إعدادات كاملة، أمان، حذف مجدول، تصدير بيانات، وصفحات قانونية بنسخ.

| المؤشر | الحالة |
|--------|--------|
| Expo SDK | 58 |
| React / React Native | 19.3 / 0.88.1 |
| TypeScript | 6.0 (strict + noUncheckedIndexedAccess) |
| Node | 26 |
| Providers | 12 contracts + 12 mocks + 12 NotConnected stubs |
| Design System | ✅ 42 مكوّناً + 4 hooks + tokens + Gallery (محجوبة في الإنتاج) |
| App Shell | ✅ Gate + FloatingDock + Hosts + Banners + ErrorBoundary |
| Onboarding | ✅ 5 شاشات + تخطي + حفظ + اختيار اللغة |
| **المصادقة** | ✅ **15 capability**: تسجيل · تحقق OTP · دخول · استعادة · تغيير كلمة مرور · جلسات · حذف · تصدير |
| **الملف الشخصي** | ✅ عرض/تعديل + تسلسل جغرافي + صورة مقصوصة |
| **الإعدادات** | ✅ Module 20 (لغة · مظهر · أرقام · إشعارات · خصوصية · أمان · أجهزة · مساعدة · حول) |
| **القانوني** | ✅ 5 وثائق بنسخ — **قوالب تتطلب مراجعة قانونية قبل الإطلاق** |
| Navigation | Expo Router + Deep Links `azib://` بقائمة سماح |
| Repositories | 16 contracts + 16 mocks + contract tests |
| i18n | 15 namespace (ar + en) + formatters + RTL محفوظ ومُطبَّق |
| Seed | 15 مجموعة demo + شجرة locations (`dataOrigin='demo'`) |
| الاختبارات | **110 suites · 780 tests** ناجحة |
| CI | أخضر: Doctor 20/20 · Lint · Dead Buttons · Typecheck · Test · Web Export |
| قاعدة بيانات | غير متصلة (P18) |
| خدمات خارجية | غير متصلة |
| تحقق الأجهزة | **لم يُجرَ** — يُغطى في P20/P21 |

> شاشات الميزات غير المنفذة تعرض **Placeholder صادقاً** يذكر المرحلة التي تبنيها (P07–P17). لا أزرار شكلية.

---

## المبادئ الحاكمة

- غير ربحي: لا عمولات، لا اشتراكات، لا رسوم على المستفيدين.
- لا خدمات تعارف، ولا ملفات عامة للأفراد.
- اختيار الزوج مسؤولية الأسر.
- لا مساعدة دون تحقق بشري.
- Non-Custodial: لا محفظة، لا Escrow، لا تحويل داخلي.
- تقييم آلي **Advisory** فقط.

---

## البيئة التقنية (المعتمدة)

- Expo + React Native + TypeScript (strict) + Expo Router
- Zustand (6 stores) + TanStack Query
- React Hook Form + Zod (`useWatch` إلزامي مع React Compiler)
- i18next (لغة افتراضية `ar`, RTL)
- Reanimated + Gesture Handler
- SecureStore للتوكنات · LocalAuthentication للقفل الاختياري
- Supabase (خلف Provider Abstraction — P18)
- Jest + RNTL v14 + Playwright (Web) + pgTAP
- GitHub Actions · مدير الحزم: npm

---

## الحوكمة

- `docs/AGENT_RULES.md` — القواعد الملزمة.
- `PROJECT_CONTEXT.md` — السياق التقني الحالي.
- `DEVELOPMENT_PROGRESS.md` — حالة المراحل.
- `docs/DECISIONS.md` — سجل القرارات (ADR-0001 … ADR-0022).
- `docs/ARCHITECTURE.md` — البنية وخريطة المسارات.
- `docs/INTEGRATIONS.md` — عقود المزوّدين وحالة الربط.
- `docs/DESIGN_SYSTEM.md` — مرجع نظام التصميم.
- `docs/PRODUCT_POLICIES.md` — قرارات بشرية معلّقة.
- `docs/GLOSSARY.md` · `docs/ASSET_LICENSES.md` · `docs/THREAT_MODEL.md`.

---

## الترخيص

يُحدَّد في P23 قبل أي نشر عام للكود.

---

> **هذا المستودع عام.** لا أسرار، ولا بيانات شخصية حقيقية، ولا مفاتيح دفع.
