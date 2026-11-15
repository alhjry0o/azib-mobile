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

**المرحلة الحالية:** P06 — Auth / Profile / Settings / Legal (قادمة).
**P05 — Shell + Onboarding مكتملة** (2026-11-16): الهيكل الكامل، Gate، FloatingDock، المضيفات العامة، Splash المتحرك، Onboarding بخمس شاشات، إعدادات المطور، وفاحص الأزرار الميتة.

| المؤشر | الحالة |
|--------|--------|
| Expo SDK | 58 |
| React / React Native | 19.3 / 0.88.1 |
| TypeScript | 6.0 (strict + noUncheckedIndexedAccess) |
| Node | 26 |
| Providers | 12 contracts + 12 mocks + 12 NotConnected stubs |
| Design System | ✅ 42 components, 4 hooks, tokens, Gallery (محجوبة في الإنتاج) |
| App Shell | ✅ Gate + FloatingDock + Toast/Dialog/Sheet Hosts + Offline/Demo Banners + ErrorBoundary |
| Onboarding | ✅ 5 شاشات + تخطي دائم + حفظ الاكتمال + اختيار اللغة |
| Navigation | Expo Router + Deep Links `azib://` بقائمة سماح |
| Repositories | 16 contracts + 16 mocks + contract tests |
| i18n | 15 namespaces (ar + en) + formatters + RTL محفوظ ومُطبَّق |
| Seed | 15 مجموعة demo (`dataOrigin='demo'`) — غير موصولة بالواجهة بعد |
| الاختبارات | **623 اختباراً ناجحاً** (Jest + RNTL) |
| CI | أخضر: Expo Doctor · Lint · **Dead Buttons Check** · Typecheck · Test · Web Export |
| قاعدة بيانات | غير متصلة (P18) |
| خدمات خارجية | غير متصلة |

> شاشات الميزات غير المنفذة تعرض **Placeholder صادقاً** يذكر المرحلة التي تبنيها (P07–P17). لا أزرار شكلية.

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
- Zustand (4 stores) + TanStack Query
- React Hook Form + Zod
- i18next (لغة افتراضية `ar`, RTL)
- Reanimated + Gesture Handler
- Supabase (خلف Provider Abstraction — P18)
- Jest + RNTL + Playwright (Web) + pgTAP
- GitHub Actions · مدير الحزم: npm

---

## الحوكمة

- `docs/AGENT_RULES.md` — القواعد الملزمة.
- `PROJECT_CONTEXT.md` — السياق التقني الحالي.
- `DEVELOPMENT_PROGRESS.md` — حالة المراحل.
- `docs/DECISIONS.md` — سجل القرارات (ADR-0001 … ADR-0015).
- `docs/ARCHITECTURE.md` — البنية وخريطة المسارات.
- `docs/DESIGN_SYSTEM.md` — مرجع نظام التصميم.
- `docs/PRODUCT_POLICIES.md` — قرارات بشرية معلّقة.
- `docs/GLOSSARY.md` — المصطلحات.
- `docs/ASSET_LICENSES.md` — تراخيص الأصول.
- `docs/THREAT_MODEL.md` — نموذج التهديد.

---

## الترخيص

يُحدَّد في P23 قبل أي نشر عام للكود.

---

> **هذا المستودع عام.** لا أسرار، ولا بيانات شخصية حقيقية، ولا مفاتيح دفع.
