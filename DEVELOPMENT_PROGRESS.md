# DEVELOPMENT_PROGRESS — حالة المراحل

> يُحدَّث في نهاية كل مرحلة. الحالات المسموحة: `Not Started` / `In Progress` / `Blocked` / `Done`.
> **Done** لا تعني «تم التصميم» بل «تم التنفيذ + الاختبار + تحديث الوثائق + تقرير صادق».
> **عام المستودع:** لا أسرار ولا بيانات حقيقية.

---

## جدول المراحل (24)

| # | المرحلة | الحالة | تاريخ الإنجاز | ملاحظات |
|---|---------|--------|----------------|---------|
| P01 | Requirements, Architecture & Agent Governance | Done | 2026-11-08 | وثائق فقط (`AGENT_RULES.md §6`). |
| P02 | Init (Expo + TS strict + ESLint + Jest + i18n + بنية) | Done | 2026-11-09 | Expo SDK 58، React 19.3، RN 0.88.1، Node 26، ESLint 9. CI أخضر. |
| P03 | Core Platform (Types, Provider Abstraction, Errors, Env, i18n, Repos, Seed) | Done | 2026-11-12 | 12 providers, 16 repos, seed, ARCHITECTURE. |
| P04 | Design System (Tokens + 42 components + 4 hooks + Gallery + docs) | Done | 2026-11-14 | Reanimated 4 عبر mock (ADR-0011). 565 اختباراً، 71 suite. |
| P05 | Shell + Onboarding (Navigation, App Shell, Splash & Onboarding) | **Done** | **2026-11-16** | 3 أجزاء. **623 اختباراً ناجحاً، CI أخضر بالكامل** (بتقرير المستخدم). ADR-0012…0015. |
| P06 | Auth / Profile / Settings / Legal | Not Started | — | التزام بسياسة الخصوصية وحقوق الأدوار. |
| P07 | Home | Not Started | — | كل بلاطة إما تعمل أو `Not Connected`. |
| P08 | Assistance + Eligibility | Not Started | — | **محجوب** حتى قرارات الاستحقاق ونطاقات الدخل وأوزان التقييم. |
| P09 | Financial Architecture | Not Started | — | Non-Custodial، لا محفظة ولا Escrow، لا دفع تجريبي. |
| P10 | Group Weddings | Not Started | — | **محجوب** حتى سياسة الانسحاب. |
| P11 | Partners + Ambassadors | Not Started | — | **محجوب** حتى قرار فئة خصومات الشركاء. |
| P12 | Souk | Not Started | — | تبرعات عينية فقط، لا دفع داخلي. |
| P13 | Jobs + Volunteers | Not Started | — | لا بيانات تواصل عامة. |
| P14 | Calculator + Guide | Not Started | — | الحاسبة إرشادية، والتقييم Advisory فقط. |
| P15 | Education + Charter + Impact | Not Started | — | **محجوب** حتى الحد الأدنى لإخفاء الإحصاءات. |
| P16 | Notifications + Search | Not Started | — | Private-first؛ يربط مصدر شارة Dock. |
| P17 | Staff Console | Not Started | — | أدوار صريحة + RLS لاحقاً؛ يستفيد من حارس P05. |
| P18 | Supabase (Schema + RLS + pgTAP) | Not Started | — | لا `service_role` في التطبيق. |
| P19 | Security (Threat Model + ضوابط) | Not Started | — | يستهلك `docs/THREAT_MODEL.md`. |
| P20 | Offline / Perf / A11y | Not Started | — | RTL وA11y جزء من DoD. |
| P21 | Testing (Jest + RNTL + Playwright + pgTAP) | Not Started | — | لا «اختبار شكلي» بدون قيمة. |
| P22 | GitHub Actions (CI + فحوص) | Not Started | — | فاحص الأزرار الميتة أُضيف مبكراً في P05. |
| P23 | Docs (استكمال README + تشغيل الأدلة) | Not Started | — | يُحدَّث README هنا. |
| P24 | Final Integration | Not Started | — | مسار كامل من Onboarding → إجراء حقيقي. |

---

## قائمة تحقق P01 (تفصيل)

- [x] `docs/AGENT_RULES.md` (HRD + 22 قاعدة + حلقة العمل + بيئة التنفيذ + قائمة تحقق لكل مرحلة).
- [x] `PROJECT_CONTEXT.md` (9 أقسام مطلوبة، غير فارغة).
- [x] `DEVELOPMENT_PROGRESS.md` (24 مرحلة مدرجة).
- [x] `docs/DECISIONS.md` (قالب ADR + 6 قرارات مسجَّلة).
- [x] `docs/PRODUCT_POLICIES.md` (8 قرارات بشرية معلَّمة صراحةً).
- [x] `docs/GLOSSARY.md` و`docs/ASSET_LICENSES.md` (هيكل + تعليمات).
- [x] `docs/THREAT_MODEL.md` (STRIDE: أصول، مهاجمون، أسطح، ضوابط).
- [x] `README.md` (تعريف + حالة، يُستكمل في P23).
- [x] لا كود تطبيق في P01.
- [x] تأكيد المستخدم بتشغيل أوامر التحقق (2026-11-08).

## قائمة تحقق P02 (تفصيل)

- [x] مشروع Expo SDK 58 (React 19.3 / RN 0.88.1).
- [x] TypeScript strict + `noUncheckedIndexedAccess` + Path Alias `@/*`.
- [x] ESLint flat config + Prettier + سكربتات `lint`/`format`/`typecheck`/`test`/`web:export`/`doctor`.
- [x] Jest (jest-expo) + RNTL مع اختبارات وحدة حقيقية.
- [x] هيكل مجلدات `src/*` مع READMEs.
- [x] `.env.example` موثق، و`.gitignore` يمنع `.env` و keystores.
- [x] `scripts/check-hardcoded-arabic.mjs` مربوط بسكربت `lint`.
- [x] `app.config.ts` مع `allowBackup=false`، `supportsRTL=true`، scheme `azib`.
- [x] CI: `npm ci` → `lint` → `typecheck` → `test`.
- [x] شاشة Index مؤقتة (استُبدلت بالـGate في P05).
- [x] تأكيد المستخدم بنتائج `expo-doctor` و`web:export` (2026-11-09).

### فجوات أدوات أُغلقت لاحقاً
- [x] `prettier` أُضيف في P04 (`^3.10.0`).
- [x] `@testing-library/react-native` + `react-test-renderer` أُضيفا في P04.
- [x] `Expo Doctor` مُفعَّل في CI.

## قائمة تحقق P03 (تفصيل)

### Core
- [x] `Result<T, E>` + `AppError` (8 kinds) + `toAppError` + `logger` مع redaction.
- [x] `env` محقق بـZod مع فشل مبكر.
- [x] `useAppModeStore` (demo | backend) مع persist.

### i18n
- [x] i18next + react-i18next + expo-localization.
- [x] 14 namespaces ar/en (28 JSON) — صارت 15 في P05.
- [x] Formatters (number/currency YER/date/percent) مع `Intl` + fallback.
- [x] RTL helpers + `I18nManager.allowRTL`.
- [x] Plurals عربية (6 صيغ).
- [x] استبدال `src/lib/i18n.ts` القديم.

### Providers
- [x] 12 contracts + NotConnected stubs.
- [x] 12 Mock adapters (`dataOrigin='demo'`).
- [x] `IntegrationRegistry` (5 statuses).
- [x] `ProviderContainer` + `ProviderContainerProvider`.
- [x] `PaymentProvider` مطابق ADR-0005.
- [x] `AiProvider` مطابق ADR-0006 (`advisory: true`).

### Repositories
- [x] 16 contracts + 16 mocks + Contract tests.
- [x] `createMockCrudRepository` generic factory (6 repos).
- [x] `RepositoryContainer` مع `searchProvider` injection.
- [x] حذف `stubs.ts` و`stubs.test.ts`.

### Seed & Components
- [x] 15 مجموعة seed بـ`dataOrigin='demo'`, لا PII حقيقي.
- [x] `populateDemoSeed(container)` (13/16).
- [x] `DemoBadge` + `NotConnectedScreen`.
- [x] seed tests: PII, uniqueness, ISO, i18n keys.

### Documentation & CI
- [x] `docs/ARCHITECTURE.md` + تحديث الملفين + README.
- [x] CI أخضر بعد كل جزء (بتقرير المستخدم).

## قائمة تحقق P04 (تفصيل)

### Foundations
- [x] Tokens: colors, typography (8 variants × 2 families), spacing (13), radius (6), shadows (4), glows (3), motion.
- [x] `ThemeProvider` + `useTheme`.
- [x] Hooks: `useDeviceTier`, `useMotion`, `useHaptics`, `useDirection`.
- [x] Contrast utility + 17 WCAG AA pairs.

### Components (42)
- [x] Primitives (4) · Forms (12) · Feedback (3) · Display (8) · Overlays (2) · Navigation (3) · Brand (7) · States (3) + StateView base.

### Gallery & Docs
- [x] Gallery at `/gallery`.
- [x] `docs/DESIGN_SYSTEM.md` كامل.
- [x] ADR-0009 (fonts), ADR-0010 (lucide), ADR-0011 (Reanimated mock).

### Sub-part CI
- [x] P04.1 … P04.6b — كلها خضراء.

### Known deferred (تتبَّع في PROJECT_CONTEXT §8)
- [ ] `RingProgress` animation → مؤجل (لم يُنفَّذ في P05).
- [ ] `BottomSheet` multi-snap → P20 إن لزم.
- [ ] `Tabs` scrollable → P07+ إن لزم.
- [ ] `Avatar` image → P06.
- [x] Gallery gating للإنتاج → **أُنجز مبكراً في P05.1**.

---

## قائمة تحقق P05 (تفصيل)

### P05.1 — الهيكل الأساسي
- [x] `src/constants/routes.ts`: مصدر وحيد للمسارات + `TABS` + `href()` متوافق مع typed-routes.
- [x] متاجر: `onboarding.store` (persist) + `shell.store` (dialog/sheet/banner/badge).
- [x] `resolveGate` نقية + `useShellGate` + `useSession` عبر TanStack Query (`AuthProvider.getSession()`).
- [x] `app/index.tsx` = Gate رفيع (Redirect فقط، بلا منطق أعمال).
- [x] `app/_layout.tsx`: ErrorBoundary → Query → i18n → Theme → SafeArea → Container → Toast + Hosts + Banners.
- [x] **FloatingDock**: 5 خانات، الوسطى ذهبية مميزة، حركة اختيار (Reanimated)، Haptics خفيف، شارة، إخفاء عند الكيبورد، SafeArea، ترتيب RTL (الرئيسية يميناً).
- [x] `TabsShell` بحارس (onboarding/auth/not-connected/error) + شريط Tabs أصلي مخفي.
- [x] DialogHost + BottomSheetHost فوق مكوّني P04، مع منع التكدس المتزامن.
- [x] OfflineBanner عبر NetInfo حقيقي + DemoBanner في وضع demo فقط.
- [x] AppErrorBoundary عام (fallback بتوكنز ثابتة) + NotFound + Maintenance.
- [x] Deep Links: `parseAzibUrl` + `resolveDeepLink` (allow/guarded/not-found) + `DeepLinkGuard`.
- [x] حارس Staff deny-by-default + ForbiddenView.
- [x] 9 شاشات ميزات + 5 تبويبات + auth + staff كـPlaceholders صادقة تذكر مرحلة البناء.
- [x] بوابة `(dev)` للإنتاج (تحمي Gallery).
- [x] مفاتيح `common:shell.*` في ar/en + mock لـNetInfo وexpo-splash-screen في `jest.setup.ts`.

### P05.2 — Splash + Onboarding
- [x] `AnimatedSplash`: قمرية + اتحاد حلقتين، ظهور تدريجي، تخطي دائم، إنهاء ذاتي قصير، مرة واحدة فقط.
- [x] بديل Reduce Motion: ثابت + مدة أقصر؛ كل المدد عبر `useMotion().duration()`.
- [x] `OnboardingFlow`: 5 خطوات (علامة/رسالة/مميزات/خصوصية/لغة) + ProgressBar + تخطي دائم + رجوع + متابعة.
- [x] حفظ `onboardingCompleted` والانتقال إلى sign-in (تخطي وإنهاء).
- [x] Parallax عبر `Hero3D` (يُعطّل نفسه على Tier low وReduce Motion).
- [x] `language.store` (persist) + `useLanguageSwitch` + `LanguageBootstrap` → forceRTL عند التبديل والإقلاع.
- [x] ملاحظة صادقة: الاتجاه الأصلي يكتمل بعد إعادة فتح التطبيق.
- [x] `onboarding` namespace (ar/en) + تحديث `NAMESPACES` إلى 15 + تحديث `config.test.ts`.
- [x] حذف `OnboardingPlaceholder` المؤقت (استبدال مخطط وموثق).

### P05.3 — Dev + الفاحص
- [x] `DevSettingsScreen`: AppMode (مع مسح Query cache) · Tier override · اللغة/الاتجاه · الاهتزاز · عدّاد شارة Dock · روابط · إعادة ضبط Onboarding عبر DialogHost.
- [x] `IntegrationsScreen`: 12 مزوّداً من `IntegrationRegistry` + `healthCheckAll()` حقيقي (demo→connected، backend→error).
- [x] رابط إعدادات المطور من «حسابي» خارج الإنتاج فقط.
- [x] `scripts/check-dead-buttons.mjs`: معالجات `on*` فارغة + `TODO`/`FIXME`، نطاق `app/` و`src/features/`، استثناء Gallery و`__tests__`.
- [x] خطوة CI مستقلة `Dead Buttons Check` قبل Typecheck.
- [x] اختبارات الفاحص (حالات اصطناعية: فشل/نجاح/استثناءات/خارج النطاق).

### الاختبارات والنتائج
- [x] اختبارات Gate (3 مسارات + NotConnected + Loading).
- [x] اختبارات Dock (5 خانات، تنقل، نشاط، شارة، كيبورد، **ترتيب RTL**).
- [x] اختبارات Allowlist + DeepLinkGuard + حارس Staff.
- [x] اختبارات Hosts/Banners/ErrorBoundary/RoutePlaceholder.
- [x] اختبارات Splash (تخطي/إنهاء ذاتي/Reduce Motion).
- [x] اختبارات Onboarding (ترتيب الخطوات، رجوع، تخطي، إنهاء، تبديل اللغة + forceRTL).
- [x] اختبارات Dev + Integrations + الفاحص.
- [x] **النتيجة النهائية: 623 اختباراً ناجحاً، لا فشل، CI أخضر بالكامل** (بتقرير المستخدم 2026-11-16).
- [x] لا انحدار في اختبارات P04 (565) ولا P03.

### دروس تنفيذية ملزمة (تُطبَّق في كل مرحلة لاحقة)
- [x] **اسم مجلد الاختبار `__tests__` دائماً** (بشرطتين سفليتين). `jest.config.js` يتجاهل `tests` كمجلد اختبار؛ المجلد الخارجي `tests/` مسموح فقط لأنه يحتوي `__tests__` بداخله. خطأ التسمية كاد يُخفي 10 اختبارات.
- [x] Class Components: `override` قبل `state` و`render` (قاعدة `noImplicitOverride`).
- [x] Expo Router: `tabBar` يُمرر **prop مباشراً** لـ`<Tabs>` وليس داخل `screenOptions`.
- [x] لا استيراد مزدوج من نفس الحزمة في ملف واحد (يُدمج في سطر واحد).
- [x] React 19 + RNTL: `await renderHook(...)` عند الحاجة، وتغليف `fireEvent` بـ`act` عند تحديث الحالة، و`await act(async () => {})` لتحديثات Zustand.

### مؤجلات P05 (موثقة في PROJECT_CONTEXT §8)
- [ ] `seedBundle` → مؤجل بقرار المالك (لا تعديل على `repositories/container.ts`).
- [ ] مصدر شارة الإشعارات الحقيقي → P16.
- [ ] أدوار `AuthUser` → P06/P17 (حارس Staff يرفض الجميع حتى ذلك).
- [ ] علم Maintenance عن بُعد → P18+.
- [ ] أصول أيقونات التطبيق → P22/P23.
- [ ] ضم الفاحص لسكربت `lint` → عند توفر `package.json` محدث.
- [ ] الحركة الفعلية/Blur/رجوع Android/التدفق على الأجهزة → تحقق يدوي + P21.

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
| 9 | تمديد عقد `AuthUser` بحقل أدوار (ADR جديد) | P06 / P17 |
