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

**المرحلة الحالية:** P08 — Assistance + Eligibility (**محجوبة** بقرارات بشرية).
**P07 — Home Dashboard & Discovery مغلقة** (2026-11-16): الرئيسية محور اكتشاف كامل بتكوين قابل للتخصيص وثمانية أقسام مستقلة.

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
| المصادقة | ✅ 15 capability: تسجيل · تحقق · دخول · استعادة · تغيير كلمة مرور · جلسات · حذف · تصدير |
| الملف الشخصي | ✅ عرض/تعديل + تسلسل جغرافي + صورة مقصوصة |
| الإعدادات | ✅ Module 20 (لغة · مظهر · أرقام · إشعارات · خصوصية · أمان · أجهزة · مساعدة · حول) |
| **الرئيسية** | ✅ **8 أقسام مستقلة** + Header/Hero/QuickActions + تخصيص محفوظ + Pull-to-Refresh + تحميل كسول |
| **خصوصية المحتوى** | ✅ بوابة موافقة **fail-closed** + تعقيم بطاقات الدعم + إخفاء الأعداد والمبالغ + فصل Demo/Real |
| القانوني | ✅ 5 وثائق بنسخ — **قوالب تتطلب مراجعة قانونية قبل الإطلاق** |
| Navigation | Expo Router + Deep Links `azib://` بقائمة سماح |
| Repositories | 16 contracts + 16 mocks + contract tests (**بلا تعديل عقود**) |
| i18n | 15 namespace (ar + en) + formatters + RTL محفوظ ومُطبَّق |
| Seed | 15 مجموعة demo + شجرة locations (`dataOrigin='demo'`) |
| الاختبارات | **129 suites · 869 tests** ناجحة |
| CI | أخضر: Doctor · Lint · Dead Buttons · Typecheck · Test · Web Export |
| قاعدة بيانات | غير متصلة (P18) |
| خدمات خارجية | غير متصلة |
| تحقق الأجهزة | **لم يُجرَ** — يُغطى في P20/P21 |

---

## قيود صادقة معروفة

- **قسمَا «حالات الدعم» و«قصص النجاح» فارغان دائماً** حتى تُضاف حقول موافقة النشر (P08/P15). لا ننشر شيئاً بلا موافقة سارية.
- **الإحصاءات محجوبة** لأن حجم البيانات التجريبي دون حد الإخفاء المؤقت (10) — والمبلغ يُحجب مع العدد.
- **الحذف مجدول لا منفَّذ**؛ المسح الفعلي مهمة خادم في P18، والمدة بانتظار اعتماد.
- **صورة المستخدم** تُحفظ في الجلسة فقط حتى P18.
- شاشات الميزات غير المنفذة تعرض **Placeholder صادقاً** يذكر المرحلة التي تبنيها (P08–P17). لا أزرار شكلية.

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
- Zustand (6 stores) + TanStack Query (استعلام لكل قسم)
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
- `docs/DECISIONS.md` — سجل القرارات (ADR-0001 … ADR-0026).
- `docs/ARCHITECTURE.md` — البنية وخريطة المسارات وطبقة الرئيسية.
- `docs/INTEGRATIONS.md` — عقود المزوّدين وحالة الربط.
- `docs/DESIGN_SYSTEM.md` — مرجع نظام التصميم.
- `docs/PRODUCT_POLICIES.md` — قرارات بشرية معلّقة + سجل الاستخدام المؤقت.
- `docs/GLOSSARY.md` · `docs/ASSET_LICENSES.md` · `docs/THREAT_MODEL.md`.

---

## الترخيص

يُحدَّد في P23 قبل أي نشر عام للكود.

---

> **هذا المستودع عام.** لا أسرار، ولا بيانات شخصية حقيقية، ولا مفاتيح دفع.
