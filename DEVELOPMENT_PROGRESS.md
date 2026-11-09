# DEVELOPMENT_PROGRESS — حالة المراحل

> يُحدَّث في نهاية كل مرحلة. الحالات المسموحة: `Not Started` / `In Progress` / `Blocked` / `Done`.
> **Done** لا تعني «تم التصميم» بل «تم التنفيذ + الاختبار + تحديث الوثائق + تقرير صادق».
> **عام المستودع:** لا أسرار ولا بيانات حقيقية.

---

## جدول المراحل (24)

| # | المرحلة | الحالة | تاريخ الإنجاز | ملاحظات |
|---|---------|--------|----------------|---------|
| P01 | Requirements, Architecture & Agent Governance | Done | 2026-11-08 | وثائق فقط. | (`AGENT_RULES.md §6`). |
| P02 | Init (Expo + TS strict + ESLint + Jest + i18n + بنية) | Done | 2026-11-09 | Expo SDK 58، React 19.3، RN 0.88.1، Node 26، ESLint 9. CI أخضر 2026-11-09. |
| P03 | Core Platform (Types, Provider Abstraction, Errors, Env) | Not Started | — | لا كود خادم قبل عقد Provider واضح. |
| P04 | Design System (Royal Black / Purple / Mustard, Qamariya, 3D ثلاث طبقات) | Not Started | — | يستهلك توكنز فقط، لا قيم Hardcoded. |
| P05 | Shell + Onboarding | Not Started | — | RTL أولاً، Logical Properties فقط. |
| P06 | Auth / Profile / Settings / Legal | Not Started | — | التزام بسياسة الخصوصية وحقوق الأدوار. |
| P07 | Home | Not Started | — | كل بلاطة إما تعمل أو `Not Connected`. |
| P08 | Assistance + Eligibility | Not Started | — | **محجوب** حتى قرارات الاستحقاق ونطاقات الدخل وأوزان التقييم. |
| P09 | Financial Architecture | Not Started | — | Non-Custodial، لا محفظة ولا Escrow، لا نظام دفع تجريبي. |
| P10 | Group Weddings | Not Started | — | **محجوب** حتى سياسة الانسحاب. |
| P11 | Partners + Ambassadors | Not Started | — | **محجوب** حتى قرار فئة خصومات الشركاء. |
| P12 | Souk | Not Started | — | تبرعات عينية فقط، لا دفع داخلي. |
| P13 | Jobs + Volunteers | Not Started | — | لا بيانات تواصل عامة. |
| P14 | Calculator + Guide | Not Started | — | الحاسبة إرشادية، والتقييم Advisory فقط. |
| P15 | Education + Charter + Impact | Not Started | — | **محجوب** حتى الحد الأدنى لإخفاء الإحصاءات. |
| P16 | Notifications + Search | Not Started | — | احترام Private-first في البحث. |
| P17 | Staff Console | Not Started | — | كل مسار محمي بدور صريح + RLS لاحقاً. |
| P18 | Supabase (Schema + RLS + pgTAP) | Not Started | — | لا `service_role` في التطبيق. |
| P19 | Security (Threat Model + ضوابط) | Not Started | — | يستهلك `docs/THREAT_MODEL.md`. |
| P20 | Offline / Perf / A11y | Not Started | — | RTL وA11y جزء من DoD. |
| P21 | Testing (Jest + RNTL + Playwright + pgTAP) | Not Started | — | لا «اختبار شكلي» بدون قيمة. |
| P22 | GitHub Actions (CI + فحوص) | Not Started | — | لا أسرار في الـ repo، GitHub Secrets فقط. |
| P23 | Docs (استكمال README + تشغيل الأدلة) | Not Started | — | يُحدَّث README هنا. |
| P24 | Final Integration | Not Started | — | مسار كامل من Onboarding → إجراء حقيقي. |

---

## قائمة تحقق P01 (تفصيل)

- [x] `docs/AGENT_RULES.md` (HRD + 22 قاعدة + حلقة العمل + بيئة التنفيذ + قائمة تحقق لكل مرحلة).
- [x] `PROJECT_CONTEXT.md` (9 أقسام مطلوبة، غير فارغة).
- [x] `DEVELOPMENT_PROGRESS.md` (24 مرحلة مدرجة).
- [x] `docs/DECISIONS.md` (قالب ADR + 6 قرارات مسجَّلة).
- [x] `docs/PRODUCT_POLICIES.md` (8 قرارات بشرية معلَّمة صراحةً).
- [x] `docs/GLOSSARY.md` (مصطلحات عربي/إنجليزي).
- [x] `docs/ASSET_LICENSES.md` (هيكل + تعليمات).
- [x] `docs/THREAT_MODEL.md` (STRIDE: أصول، مهاجمون، أسطح، ضوابط).
- [x] `README.md` (تعريف + حالة، يُستكمل في P23).
- [x] لا كود تطبيق في P01.
- [x] تأكيد المستخدم بتشغيل أوامر التحقق (بتاريخ 2026-11-8).

---

## قائمة تحقق P02 (تفصيل)

- [x] مشروع Expo SDK 58 من قالب `default` (React 19.3 / RN 0.88.1).
- [x] TypeScript strict + `noUncheckedIndexedAccess` + Path Alias `@/*`.
- [x] ESLint flat config + Prettier + سكربتات `lint`/`format`/`typecheck`/`test`/`web:export`/`doctor`.
- [x] Jest (jest-expo) + RNTL مع اختبارات وحدة حقيقية (i18n + سكربت العربية).
- [x] هيكل مجلدات `src/*` مع READMEs.
- [x] `.env.example` موثق، و`.gitignore` يمنع `.env` و keystores.
- [x] `scripts/check-hardcoded-arabic.mjs` مربوط بسكربت `lint`.
- [x] `app.config.ts` مع `android.allowBackup=false`، `android.supportsRTL=true`، scheme.
- [x] CI: `npm ci` → `lint` → `typecheck` → `test` (contents: read, concurrency).
- [x] شاشة Index مؤقتة تستخدم `t('common.appName')`.
- [x] تأكيد المستخدم بنتائج `expo-doctor` و`web:export` (2026-11-09، CI أخضر).

### فجوات أدوات موثّقة (لا تكسر CI، تُعالَج في مرحلة لاحقة)

- [ ] `prettier` غير مثبت رغم وجود سكربتَي `format`/`format:check` — يُضاف في P03/P04 (موثَّق في `PROJECT_CONTEXT §8 #9`).
- [ ] `@testing-library/react-native` + `react-test-renderer` غير مثبتين — يُضافان مع أول اختبار مكوّن (موثَّق في `PROJECT_CONTEXT §8 #10`).
---
## القرارات البشرية المفتوحة (Blockers محتملة)

| # | القرار | يحجب |
|---|--------|------|
| 1 | حدود الاستحقاق ونطاقات الدخل | P08 |
| 2 | أوزان التقييم الآلي | P08 / P14 |
| 3 | مدة الاعتراض | P08 |
| 4 | سياسة الانسحاب من العرس الجماعي | P10 |
| 5 | الاستثناء من قاعدة مساعدة واحدة | P08 |
| 6 | الفئة المستفيدة من خصومات الشركاء | P11 |
| 7 | مدة الاحتفاظ بالبيانات | P19 / P23 |
| 8 | الحد الأدنى لإخفاء الإحصاءات | P15 / P17 |
```
