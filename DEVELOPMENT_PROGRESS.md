# DEVELOPMENT_PROGRESS — حالة المراحل

> يُحدَّث في نهاية كل مرحلة. الحالات: `Not Started` / `In Progress` / `Blocked` / `Done`.
> **Done** = تنفيذ + اختبار + تحديث وثائق + تقرير صادق.
> **عام المستودع:** لا أسرار ولا بيانات حقيقية.

---

## جدول المراحل (24)

| # | المرحلة | الحالة | تاريخ الإنجاز | ملاحظات |
|---|---------|--------|----------------|---------|
| P01 | Governance | Done | 2026-11-08 | وثائق فقط. |
| P02 | Init | Done | 2026-11-09 | SDK 58 · React 19.3 · RN 0.88.1 · Node 26 · ESLint 9. |
| P03 | Core Platform | Done | 2026-11-12 | 12 providers · 16 repos · seed · ARCHITECTURE. |
| P04 | Design System | Done | 2026-11-14 | 42 مكوّناً · 565 اختباراً · 71 suite. |
| P05 | Shell + Onboarding | Done | 2026-11-16 | 3 أجزاء · 623 اختباراً · ADR-0012…0015. |
| P06 | Auth / Profile / Settings / Legal | Done | 2026-11-16 | 3 أجزاء · 780 اختباراً · 110 suites · ADR-0016…0022. |
| P07 | **Home Dashboard & Discovery** | **Done** | **2026-11-16** | جزءان · **129/129 suites · 869/869 tests** · lint/typecheck نظيفان · CI أخضر (بتقرير المالك) · ADR-0023…0026. |
| P08 | Assistance + Eligibility | **Blocked** | — | **محجوب** حتى `PRODUCT_POLICIES #1,#2,#3,#5`. |
| P09 | Financial Architecture | Not Started | — | Non-Custodial، لا دفع تجريبي. |
| P10 | Group Weddings | Not Started | — | **محجوب** حتى سياسة الانسحاب. |
| P11 | Partners + Ambassadors | Not Started | — | **محجوب** حتى فئة الخصومات؛ يضيف ربط حساب↔شريك. |
| P12 | Souk | Not Started | — | عيني فقط. |
| P13 | Jobs + Volunteers | Not Started | — | يضيف مهام التطوع الحقيقية. |
| P14 | Calculator + Guide | Not Started | — | إرشادي فقط. |
| P15 | Education + Charter + Impact | Not Started | — | **محجوب** حتى حد الإحصاءات؛ يضيف نشر القصص بموافقة. |
| P16 | Notifications + Search | Not Started | — | يربط مصدر شارة Dock وجرس الرئيسية. |
| P17 | Staff Console | Not Started | — | يستفيد من أدوار P06 وحارسه. |
| P18 | Supabase | Not Started | — | ينفّذ الحذف، يحفظ الصورة، يستعيد الجلسة، يفصل Real. |
| P19 | Security | Not Started | — | يستهلك `THREAT_MODEL.md`. |
| P20 | Offline / Perf / A11y | Not Started | — | يشمل تحقق الأجهزة المؤجل (P05–P07). |
| P21 | Testing | Not Started | — | Playwright + pgTAP. |
| P22 | GitHub Actions | Not Started | — | الفاحص أُضيف مبكراً في P05. |
| P23 | Docs | Not Started | — | يُستكمل README. |
| P24 | Final Integration | Not Started | — | مسار كامل حقيقي. |

---

## قوائم التحقق السابقة (مختصرة)

### P01
- [x] `AGENT_RULES` (HRD + 22 قاعدة + حلقة عمل) · `PROJECT_CONTEXT` (9 أقسام) · `DEVELOPMENT_PROGRESS` (24 مرحلة).
- [x] `DECISIONS` (قالب + 6 قرارات) · `PRODUCT_POLICIES` (8 قرارات بشرية) · `GLOSSARY` · `ASSET_LICENSES` · `THREAT_MODEL` · `README`.
- [x] لا كود تطبيق. تأكيد المالك بأوامر التحقق.

### P02
- [x] Expo SDK 58 · TS strict + `noUncheckedIndexedAccess` + alias `@/*`.
- [x] ESLint flat + Prettier + سكربتات lint/format/typecheck/test/web:export/doctor.
- [x] Jest + اختبارات وحدة حقيقية · `.env.example` + `.gitignore` · فاحص العربية مربوط بـ`lint`.
- [x] `app.config.ts` (allowBackup=false, supportsRTL, scheme) · CI أخضر.

### P03
- [x] `Result` · `AppError` (8 kinds) · `logger` مع redaction · `env` بـZod.
- [x] i18next + 14 namespace + formatters + RTL + plurals عربية.
- [x] 12 contracts + 12 mocks + 12 NotConnected + Registry + Container.
- [x] 16 repository contracts + mocks + Contract tests · 15 مجموعة seed + populator (13/16).

### P04
- [x] Tokens كاملة + ThemeProvider + 4 hooks + 17 زوج WCAG AA.
- [x] 42 مكوّناً + Gallery + `DESIGN_SYSTEM.md` + ADR-0009/0010/0011.

### P05
- [x] P05.1 الهيكل · P05.2 Splash + Onboarding + حفظ اللغة · P05.3 Dev + Integrations + فاحص الأزرار.
- [x] 623 اختباراً، CI أخضر.

### P06
- [x] P06.1 نواة المصادقة (عقد +5، آلة، Vault، 6 شاشات، OTP، ضيف، أدوار).
- [x] P06.2 الملف الشخصي + locations + الصورة + Module 20 + الموافقات.
- [x] P06.3 عقد +6 (→15) · الأمان · الجلسات · الحذف · التصدير · Legal · `INTEGRATIONS.md`.
- [x] 780 اختباراً / 110 suites، CI أخضر.

---

## قائمة تحقق P07 (تفصيل)

### P07.1 — الأساس والأقسام الأربعة
- [x] `config/home-config.types.ts`: 8 معرّفات أقسام + 7 إجراءات سريعة + `HomeConfig` + `HomeConfigSource`.
- [x] `config/default-home-config.ts`: افتراضي مستقر + `normalizeOrder` (إسقاط المجهول/المكرر + إلحاق الناقص) + `hiddenFromMap` (false الصريحة فقط) + `moveInList`.
- [x] `config/home-config.source.ts`: تنفيذ Mock + `get/set/resetHomeConfigSource` — **قابل للتبديل بلا مساس بالمستهلكين**.
- [x] `hooks/use-home-config.ts`: دمج المصدر مع تخصيص `settings.store` + ترشيح الأقسام المسجّلة.
- [x] `hooks/use-home-section.ts`: استعلام لكل قسم بمفتاح `['home', mode, id]` + `resolveSectionStatus` نقية (loading/empty/error/not-connected/ready).
- [x] `hooks/use-home-greeting.ts`: `greetingKeyForHour` نقية + تحديث دوري.
- [x] `hooks/use-home-formatters.ts`: ربط الأرقام/النسب/التواريخ باللغة وتفضيل الأرقام.
- [x] `HomeHeader`: تحية + اسم العرض + جرس بعدّاد + بحث + تخصيص + شارة Demo.
- [x] `HomeHero`: قمرية + `Hero3D` حسب Tier + بارالاكس مربوط بالتمرير + زر أساسي بحسب الدور + زر ثانوي.
- [x] `QuickActions`: 7 إجراءات، شبكة RTL، قابلة للإخفاء، Haptics خفيف.
- [x] `SectionShell`: ترويسة + الحالات الأربع + محتوى + `emptyAction` (أُضيف في P07.2).
- [x] `SectionErrorBoundary`: class بـ`override` + إعادة محاولة القسم وحده.
- [x] `LazySection` + `Stagger` (حد 8، خطوة 60ms، يحترم Reduce Motion).
- [x] `WeddingsSection`: `status==='open'` + ترتيب بالتاريخ + Carousel أفقي (حد 6).
- [x] `OffersSection`: `status==='active'` **و** الشريك `verified` (join) — إسقاط أي عرض بلا شريك موثّق (حد 5).
- [x] `SoukSection`: `status==='available'` + فئة عبر i18n (حد 5).
- [x] `JobsSection`: `status==='open'` فقط، **بلا أي بيانات تواصل** (حد 5).
- [x] كتل الأدوار: `PartnerSummarySection` (بلا أرقام — لا ربط بعد) · `VolunteerSection` (تصفية بـ`userId`) · `StaffShortcutSection` (`hasStaffRole`).
- [x] `HomeCustomizeSheet`: ترتيب/إظهار الأقسام + إخفاء الإجراءات + استعادة الافتراضي + إغلاق.
- [x] `HomeScreen`: FlatList مضبوط (`initialNumToRender=2`, `windowSize=5`, `maxToRenderPerBatch=2`, `removeClippedSubviews`) + Pull-to-Refresh + كشف الظهور + fallback 700ms.
- [x] `settings.store`: `homeSectionOrder` · `homeSectionVisibility` · `homeQuickActionVisibility` + setters + reset (محفوظة).
- [x] `dev/demo-seed.ts` + `use-demo-seed.ts`: `populateDemoSeed` ثم نشر (partners→verified, weddings→open, souk→available, jobs→open) + ربط عروض بشركاء حقيقيين + مفاتيح `home:demo.*`.
- [x] زر التعبئة في `DevSettingsScreen` (وضع demo فقط، بلا تعبئة تلقائية).
- [x] استبدال `app/(tabs)/index.tsx` بـ`HomeScreen`.
- [x] اختبارات: home-config · home-utils · SectionShell · SectionErrorBoundary · 4 أقسام · HomeScreen · HomeCustomizeSheet · demo-seed.
- [x] **النتيجة: 121 suites / 829 tests، CI أخضر** (بتقرير المالك).

### P07.2 — الأقسام الحساسة والإحصاءات
- [x] `consent-gate.ts`: `PublicationConsent` + `isConsentActive` **fail-closed** (مفقود/تاريخ فاسد/منح مستقبلي/سحب ماضٍ/سحب فاسد ⇒ رفض) + `indexConsents` (الأحدث يفوز).
- [x] `anonymize.ts`: `PUBLISHABLE_STATUSES=['approved','disbursed']` + إسقاط يوافق فقط `{id, categoryKey, governorateKey, dataOrigin}` — **لا applicantId/programId/notes/reviewerNote/requestedAmount**.
- [x] `stats-privacy.ts`: `SMALL_NUMBER_THRESHOLD=10` موسوم `PENDING_POLICY` + `suppressSmallNumber` + `buildStatCell` (**يحجب المبلغ مع العدد**) + `computeCommunityStats` (دلو demo ودلو real منفصلان) + `totalRecordCount`.
- [x] `success-stories.ts`: `selectPublicStories` بموافقة لكل قصة — موافقة الحساب ليست بديلاً.
- [x] `SupportCasesSection`: استعلام `approved` + بوابة موافقة (مصدرها فارغ) ⇒ **حالة فارغة صادقة + السبب + إجراء حقيقي**.
- [x] `CommunityStatsSection`: 3 مستودعات في استعلام القسم + عرض **دلو demo فقط** + شارة demo + ملاحظة الحد + نص عدم عرض Real.
- [x] `InitiativesSection`: برامج `open` (حد 4) — **بلا مبالغ** (حدود الاستحقاق غير معتمدة).
- [x] `SuccessStoriesSection`: محتوى + بوابة موافقة ⇒ فارغ صادق + ملاحظة موافقة الحساب عند تفعيلها + إجراء إلى التوعية.
- [x] `SectionShell`: خاصية `emptyAction` إضافية (بلا كسر للمستهلكين).
- [x] `registry.ts`: تسجيل الأقسام الثمانية؛ `REGISTERED_SECTION_IDS = HOME_SECTION_IDS`.
- [x] `demo-seed.ts`: تطبيع البرامج (`status='open'` + `nameKey`/`descriptionKey` من `home:demo.programs.*`).
- [x] `locales/{ar,en}/home.json`: كل مفاتيح الأقسام الثمانية + الإحصاءات + المبادرات + القصص + برامج demo.
- [x] تحديث اختبارَي P07.1 المتأثرين بمجموعة الأقسام المسجّلة (`home-config.test.ts`, `HomeCustomizeSheet.test.tsx`).
- [x] اختبارات جديدة: consent-gate · anonymize · stats-privacy · success-stories · 4 أقسام.
- [x] **النتيجة النهائية: 129/129 suites · 869/869 tests · lint وtypecheck نظيفان · CI أخضر بالكامل** (بتقرير المالك).

### إصلاحات P07.1 (5 مجموعات، سجّلها المالك)
- [x] **Syntax:** إزالة `as const HomeSectionId[]` بعد `Object.freeze([...])` — الـtype annotation في التعريف يكفي.
- [x] **React 19 Hooks:** لا `useRef().current` أثناء render ⇒ `useMemo`/`useCallback`; تعديل `SharedValue` يحتاج `// eslint-disable-next-line react-hooks/immutability`.
- [x] **Unused var:** إزالة `i18n` غير المستخدم من `use-home-formatters`.
- [x] **import/first:** نقل `jest.mock` بعد كل الـimports (Jest يتكفّل بالـhoisting).
- [x] **Pull-to-Refresh:** `refreshing`/`onRefresh` كـprops مباشرة على `FlatList` بدل `<RefreshControl>` منفصل.

### إصلاحات P07.2 (مجموعة واحدة)
- [x] **i18n Keys Mismatch:** `home.json` يستخدم `kebab-case` (`sections.support-cases.*`) بينما أشارت الأكواد إلى `camelCase`. صُحّحت المسارات في `SupportCasesSection.tsx` و`SuccessStoriesSection.tsx` و`anonymize.ts` (`unknownCategory`). **لا تعديل على المنطق ولا على الاختبارات.**

---

## الدروس المُلزِمة (تراكمية — تُطبَّق في كل مرحلة قادمة)

### الاختبارات (RNTL v14 + React 19)
- [x] `await render(...)` · `await fireEvent.xxx(...)` · `await view.unmount()` — كلها async.
- [x] **لا** تغليف `fireEvent` داخل `act` (التداخل يفسد `screen`).
- [x] `await act(() => {...})` (callback متزامن) لتحديث المتاجر مباشرة.
- [x] كل `it` يحتوي `await`必须是 `async`.
- [x] مجلد الاختبار **`__tests__`** دائماً (بشرطتين سفليتين).
- [x] mock للمكونات المعتمدة على `Modal`/`Select` في اختبارات الشاشات.
- [x] `setQueryData` مباشر على مفتاح معروف؛ `invalidateQueries` وحده غير كافٍ.
- [x] `waitFor` على الحالة النهائية (`busy=false` أو العنصر المتوقع) لا اللحظية.
- [x] `user.id` يُقرأ من الجلسة، لا قيمة ثابتة.
- [x] `jest.mock` **بعد** كل الـimports.

### React 19 / React Compiler
- [x] لا side effects أثناء render؛ الالتقاط من hooks داخل `useEffect`.
- [x] لا `useRef().current` أثناء render ⇒ `useMemo`/`useCallback`.
- [x] تعديل `SharedValue` مباشرة يسبقه `// eslint-disable-next-line react-hooks/immutability`.
- [x] `useWatch` بدل `watch` في React Hook Form.
- [x] `override` قبل `state`/`render` في أي Class Component.

### TypeScript / ESLint
- [x] `import { StyleSheet } from 'react-native'` صراحةً في كل ملف فيه `StyleSheet.create`.
- [x] فهرسة مصفوفة بمتغير `number` ⇒ `?? default` (`noUncheckedIndexedAccess`).
- [x] لا `as const Type[]` بعد `Object.freeze([...])`.
- [x] أي helper جديد يُضاف لسطر الاستيراد.
- [x] `tabBar` prop مباشر لـ`<Tabs>` لا داخل `screenOptions`.
- [x] `refreshing`/`onRefresh` props مباشرة على `FlatList`.

### الحزم والواجهات
- [x] لا افتراض لواجهة حزمة من الذاكرة — تحقّق من المثبت أو اعزل الاستدعاء في **وحدة حدودية** (ADR-0022).
- [x] `expo install --fix` يصلح `package.json` + `package-lock.json` معاً؛ لا `install.exclude`.
- [x] `manipulateAsync` (الكلاسيكية) لـimage-manipulator · `File`/`Paths` (الصنفية) لـfile-system.

### i18n والمحتوى (جديد في P07.2)
- [x] **تطابق صيغة مفاتيح i18n بين `locales/*.json` وملفات `ts/tsx` قبل الاختبار** — `kebab-case` مقابل `camelCase` كسر اختبارين. الفحص جزء من قائمة ما قبل الإرسال.
- [x] كل نص واجهة عبر `t()`؛ لا نصوص حرفية في المكونات.

### العملية
- [x] **عند تغيير سلوك شاشة، حدّث اختبارها في نفس الجزء** (درس انحراف فهرس الإعدادات).
- [x] لا تعديل على عقود الـRepositories؛ الاستهلاك فقط.
- [x] كل قرار معماري ⇒ ADR؛ كل قيمة سياسة غير معتمدة ⇒ وسم `PENDING_POLICY` ظاهر للمستخدم.

---

## مؤجلات P07 (في PROJECT_CONTEXT §8)
- [ ] مصدر HomeConfig من SettingsRepository ⇒ لاحقاً (#38).
- [ ] حقول موافقة النشر ⇒ P08/P15/P18 (#39) — تفتح قسمَي الدعم والقصص.
- [ ] تأكيد التبرعات/الصرف عبر العقد ⇒ P18 (#40) — يفتح الإحصاءات المؤكدة.
- [ ] إنشاء محتوى في المستودع ⇒ P15/P18 (#41).
- [ ] ربط حساب↔شريك ⇒ P11 (#42).
- [ ] مهام تطوع حقيقية ⇒ P13 (#43).
- [ ] عرض مبالغ البرامج ⇒ بعد اعتماد `PRODUCT_POLICIES #1` (#44).
- [ ] تحقق الأجهزة: Carousel RTL، الكسل، البارالاكس ⇒ P20/P21 (#45).
- [ ] اعتماد حد الإحصاءات ⇒ المالك (#8).
- [ ] تنفيذ القرار #33 (صفّا الأمان والحذف) ⇒ رقعة صغيرة مستقلة.
- [ ] حذف `SignInPlaceholder` مع اختباره (#34) · ضم الفاحص لـ`lint` (#24) · إعلان `zod` (#37).
- [ ] تصحيح `docs/DESIGN_SYSTEM.md` (#47).

---

## القرارات البشرية المفتوحة (Blockers)

| # | القرار | يحجب |
|---|--------|------|
| 1 | حدود الاستحقاق ونطاقات الدخل | **P08** + عرض مبالغ البرامج |
| 2 | أوزان التقييم الآلي | **P08** / P14 |
| 3 | مدة الاعتراض | **P08** |
| 4 | سياسة الانسحاب من العرس الجماعي | P10 |
| 5 | الاستثناء من مساعدة واحدة | **P08** |
| 6 | الفئة المستفيدة من خصومات الشركاء | P11 |
| 7 | مدة الاحتفاظ + فترة تأكيد الحذف | P19 / P23 + تنفيذ الحذف |
| 8 | الحد الأدنى لإخفاء الإحصاءات (10 مؤقت) | P15 / P17 + إظهار أرقام الرئيسية |
| 9 | مراجعة قانونية لنصوص Legal | الإطلاق |
| 10 | سياسة موافقة النشر (الحقول والنطاق) | P08 / P15 + قسمَا الدعم والقصص |
