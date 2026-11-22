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
| P06 | Auth / Profile / Settings / Legal | Done | 2026-11-16 | 3 أجزاء · 780 اختباراً / 110 suites · ADR-0016…0022. |
| P07 | Home Dashboard & Discovery | Done | 2026-11-16 | جزءان · 869 اختباراً / 129 suites · ADR-0023…0026. |
| P08 | **Assistance & Eligibility Engine** | **Done** | **2026-11-16** | 3 أجزاء · **155/155 suites · 1020/1020 tests** · lint/typecheck نظيفان · CI أخضر (بتقرير المالك) · ADR-0027…0032 + `docs/ELIGIBILITY_ENGINE.md`. |
| P09 | Financial Architecture | Not Started | — | Non-Custodial (ADR-0005)؛ لا دفع تجريبي بإيصال حقيقي. |
| P10 | Group Weddings | Not Started | — | **محجوب** حتى سياسة الانسحاب. |
| P11 | Partners + Ambassadors | Not Started | — | **محجوب** حتى فئة الخصومات؛ يضيف ربط حساب↔شريك. |
| P12 | Souk | Not Started | — | عيني فقط. |
| P13 | Jobs + Volunteers | Not Started | — | يضيف مهام التطوع الحقيقية. |
| P14 | Calculator + Guide | Not Started | — | إرشادي فقط. |
| P15 | Education + Charter + Impact | Not Started | — | **محجوب** حتى حد الإحصاءات؛ يضيف نشر القصص بموافقة. |
| P16 | Notifications + Search | Not Started | — | يربط مصدر شارة Dock وجرس الرئيسية. |
| P17 | Staff Console | Not Started | — | يستهلك `evaluation` وكتالوج الأسباب ويفصل مراجع الاعتراض. |
| P18 | Supabase | Not Started | — | قواعد على الخادم · انتقال ذرّي · بصمة محتوى · تنفيذ الحذف والصرف. |
| P19 | Security | Not Started | — | يستهلك `THREAT_MODEL.md` (محدَّث بـP08). |
| P20 | Offline / Perf / A11y | Not Started | — | يشمل تحقق الأجهزة المؤجل (P05–P08). |
| P21 | Testing | Not Started | — | Playwright + pgTAP. |
| P22 | GitHub Actions | Not Started | — | الفاحص أُضيف مبكراً في P05. |
| P23 | Docs | Not Started | — | يُستكمل README. |
| P24 | Final Integration | Not Started | — | مسار كامل حقيقي. |

---

## قوائم التحقق السابقة (مختصرة)

### P01
- [x] `AGENT_RULES` (HRD + 22 قاعدة) · `PROJECT_CONTEXT` (9 أقسام) · `DEVELOPMENT_PROGRESS` (24 مرحلة).
- [x] `DECISIONS` (قالب + 6 قرارات) · `PRODUCT_POLICIES` (8 قرارات بشرية) · `GLOSSARY` · `ASSET_LICENSES` · `THREAT_MODEL` · `README`.
- [x] لا كود تطبيق. تأكيد المالك بأوامر التحقق.

### P02
- [x] Expo SDK 58 · TS strict + `noUncheckedIndexedAccess` + alias `@/*`.
- [x] ESLint flat + Prettier + سكربتات lint/format/typecheck/test/web:export/doctor.
- [x] Jest + اختبارات حقيقية · `.env.example` + `.gitignore` · فاحص العربية مربوط بـ`lint`.
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
- [x] P06.1 نواة المصادقة · P06.2 الملف/الإعدادات/الصورة · P06.3 الأمان/الجلسات/الحذف/التصدير/Legal.
- [x] 780 اختباراً / 110 suites، CI أخضر · `docs/INTEGRATIONS.md`.

### P07
- [x] P07.1 HomeConfig + Header/Hero/QuickActions + 4 أقسام + كتل الأدوار + التخصيص + أداة Demo.
- [x] P07.2 بوابة الموافقة + التعقيم + إخفاء الأعداد والمبالغ + فصل Demo/Real + 4 أقسام حساسة.
- [x] 869 اختباراً / 129 suites، CI أخضر · `DESIGN_SYSTEM.md` صُحّح في رد منفصل.

---

## قائمة تحقق P08 (تفصيل)

### P08.1 — النواة النقية
- [x] توسيع `ApplicationStatus` إلى 13 قيمة-additive؛ `reviewing`/`disbursed` باقيتان (شرط د-3 تحقّق بقراءة `application.contract.ts` — لا يَعُدّ القيم).
- [x] `Application` + حقول اختيارية: `referenceNumber` · `submittedAt` · `payload` · `evaluation` · `infoRequest` · `decision` · `appeal` · `publicationConsent`.
- [x] `update(id, input)` (بلا status) + `submit(id)` ذرّي (حالة + رقم مرجعي مرة واحدة + تاريخ + مسح الاستكمال + التقاط موافقة النشر).
- [x] `schemas/application-payload.ts`: 7 مجموعات + سجلات سير العمل؛ المال أعداد صحيحة غير سالبة؛ بصمات ≥16 حرفاً.
- [x] `engine/rules.types.ts` + `rules.v1.ts` (`eligibility-v1`, `pending-human-approval`) + `rules-source.ts` قابل للتبديل.
- [x] `gates.ts`: 4 بوابات، تُبلّغ كل الفاشلة؛ الأصول عند الحد ⇒ فشل؛ الأقارب/الميراث لا يدخلان.
- [x] `flags.ts`: 5 أعلام؛ لا تأثير على النقاط؛ لا علم عند دخل صفر.
- [x] `bands.ts`: 4 نطاقات من القواعد + `gates_failed` + تقريب قبل التحديد.
- [x] `score-application.ts`: 6 مكوّنات مطبّعة، مجموع 100، `advisory:true`، `ruleVersion`، بلا حقل قرار.
- [x] `state-machine/workflow.ts`: 11 حالة · 18 انتقالاً · فحص الفاعل · `isTerminal` · `toWorkflowStatus` للقيم legacy.
- [x] `services/hash.ts`: SHA-256 عبر `expo-crypto` (وحدة حدودية) + بصمة متجاهلة للمسافات/الشرطة/الحالة.
- [x] `services/dedup-service.ts`: واجهة + Mock؛ كشف بصمة هوية/هاتف/مستند + عدّاد نافذة الإرسال.
- [x] `services/audit-trail.ts`: Append-only بميتاداتا محدودة (بلا payload/مستندات/معرّفات خام).
- [x] `services/workflow-service.ts`: يفرض الآلة + يحرس الاعتراض (مرة/نافذة) + يكتب التدقيق.
- [x] `mocks/seed/assistance.ts` مستقل — لا يمسّ `SeedBundle` ولا `seed.test.ts`.
- [x] اختبارات: rules · gates · bands · flags · score (جداول حدّية + عدالة) · workflow (استقصائي) · dedup · workflow-service · payload schema · application-workflow repo · i18n.

### P08.2 — الرحلة والرفع
- [x] `services/document-pipeline.ts`: picker صور/PDF + فحص نوع/حجم **من القواعد** + `manipulateAsync` (تصغير 1600 + JPEG) + **PDF بلا معالجة** + **فشل ⇒ لا رفع** + بصمة وصفية حتمية.
- [x] `stores/assistance-draft.store.ts`: 7 مجموعات + خطوة + مستندات + إقرارات + مبلغ/ملاحظات؛ **بصمات فقط**؛ `clearFingerprints` · `reset` · قص الخطوة 0..7.
- [x] `schemas/wizard.ts`: 7 مخططات خطوات + `collectFieldErrors` + `buildPayload`.
- [x] `components/NumericField` (أعداد صحيحة فقط) · `WizardProgress` (Double Ring + شريط) · `WizardStepShell` (لماذا نطلب) · `DocumentUploader` (نوع/رفع/حذف/معاينة/تقدم غير محدد).
- [x] `wizard/step-config.ts` + 6 مكوّنات خطوة (Applicant · Numeric×3 · Engagement · Documents · Review · Submit).
- [x] `AssistanceWizard`: تحقق لكل خطوة + أخطاء Inline + رجوع + نتيجة بالرقم المرجعي.
- [x] `services/submission-service.ts`: dedup → score → create → attach evaluation → submit + audit.
- [x] نقل المسار (د-1): حذف `app/(features)/assistance.tsx` + `app/assistance/` + `ROUTES.assistance` + Allowlist + ServicesScreen/QuickActions/HomeHero/SupportCasesSection.
- [x] شاشات: `ProgramIntroScreen` · `EligibilityConditionsScreen` (قواعد/أوزان/نطاقات/حدود + وسم مؤقت) · `PreCheckScreen` (غير ملزم، لا يُخزَّن).
- [x] اختبارات: wizard schemas · document-pipeline · draft store · submission-service · 3 شاشات · Wizard.

### P08.3 — المتابعة والمراجعة
- [x] `hooks/use-assistance-applications.ts`: طلباتي · التفاصيل (مع فحص الملكية) · الخط الزمني من التدقيق.
- [x] `hooks/use-assistance-actions.ts`: إعادة الإرسال · الاعتراض · الإلغاء (مع `useMemo` للـdeps).
- [x] `components/StatusTimeline.tsx`: عقدة الإنشاء + عقد التدقيق، RTL.
- [x] `MyApplicationsScreen` · `ApplicationDetailScreen` (ملكية + إلغاء بتأكيد عبر DialogHost).
- [x] `InfoRequestScreen`: المطلوب بصياغة محترمة + 4 أرقام + مستندات + ملاحظة + إعادة إرسال تمسح الطلب.
- [x] `DecisionScreen`: نتيجة + أسباب من الكتالوج + **لا نقاط** + CTA اعتراض مشروط.
- [x] `AppealScreen`: Zod (20–2000) + مستندات + نافذة + مرة واحدة + حالة رفض صادقة.
- [x] `config/reason-catalog.ts` + `schemas/appeal.ts`.
- [x] `DevAssistanceScreen`: إنشاء طلب تجريبي كامل + انتقالات مراجع/مالي عبر الخدمة + منتقي أسباب/حقول + demo فقط.
- [x] ربط `SupportCasesSection` بموافقة النشر الحقيقية + المحافظة من payload (بوابة fail-closed).
- [x] مسارات `assistance/mine` و`assistance/[id]/{index,info-request,decision,appeal}` + `(dev)/assistance` + رابط من إعدادات المطور.
- [x] اختبارات: reason-catalog/appeal schema · MyApplications · Detail (ملكية/إلغاء) · InfoRequest · Decision · Appeal · DevAssistance.

### النتيجة النهائية
- [x] **155/155 test suites · 1020/1020 tests · lint وtypecheck نظيفان · CI أخضر بالكامل** (بتقرير المالك 2026-11-16).
- [x] لا انحدار في P03–P07 (عقد Application وProgram وAudit واختباراتها خضراء كما هي).

### إصلاحات P08.1 (مجموعة واحدة)
- [x] `noUncheckedIndexedAccess`: فهرسة `seedAssistancePayloads[0]` في الاختبار تحتاج `!` أو `?? default`.

### إصلاحات P08.2
- [x] لا أخطاء مُبلَّغة — الجزء أخضر من أول تشغيل (بتقرير المالك).

### إصلاحات P08.3 (6 مجموعات)
- [x] **exhaustive-deps:** كائن `deps` يُنشأ كل render ⇒ `useMemo(() => ({...}), [container])`.
- [x] **purity:** `Date.now()` أثناء render في 3 شاشات ⇒ حساب داخل `useMemo` + `// eslint-disable-next-line react-hooks/purity` مباشرة فوق السطر.
- [x] **rules-of-hooks:** `useMemo` بعد `return` مبكر ⇒ نقل كل الحسابات إلى **أعلى الدالة** قبل أي `return`، مع `?.` للتعامل مع `null`.
- [x] **set-state-in-effect:** `void refresh()` داخل `useEffect` ⇒ تحويل إلى `useQuery` بمفتاح `['dev','applications',mode]` و`enabled: mode === 'demo'`.
- [x] **unused import:** حذف `Application` غير المستخدم بعد التحويل.
- [x] **Query scope:** `invalidateQueries()` بلا `queryKey` مسح بيانات الجلسة المحقونة ⇒ تقييد بـ`{ queryKey: ['assistance'] }` في 4 ملفات اختبار.

---

## الدروس المُلزِمة (تراكمية — تُطبَّق في كل مرحلة قادمة)

### React 19 / React Compiler
- [ ] **لا `useRef().current` أثناء render** ⇒ `useMemo`/`useCallback`.
- [ ] **لا `Date.now()` أثناء render** ⇒ حساب داخل `useMemo` + `eslint-disable-next-line react-hooks/purity` فوق السطر مباشرة.
- [ ] **كل Hook (وخصوصاً `useMemo`) قبل أي `return` مبكر** — بلا استثناء.
- [ ] **لا `setState` مباشر داخل `useEffect`** ⇒ `useQuery` (أو اشتقاق من الحالة).
- [ ] **الكائنات المُمرَّرة كـ dependency تُغلَّف بـ`useMemo`** (مثل `deps`).
- [ ] `useWatch` بدل `watch` في React Hook Form.
- [ ] `override` قبل `state`/`render` في أي Class Component.
- [ ] تعديل `SharedValue` يسبقه `eslint-disable-next-line react-hooks/immutability`.
- [ ] لا side effects أثناء render؛ الالتقاط من hooks داخل `useEffect`.

### الاختبارات (RNTL v14 + Query)
- [ ] `await render(...)` · `await fireEvent.xxx(...)` · `await view.unmount()`.
- [ ] **لا** تغليف `fireEvent` داخل `act`.
- [ ] `await act(() => {...})` (callback متزامن) لتحديث المتاجر.
- [ ] كل `it` فيه `await` هو `async`.
- [ ] مجلد الاختبار **`__tests__`** دائماً.
- [ ] **`invalidateQueries({ queryKey: ['<feature>'] })` دائماً** — بلا `queryKey` يمسح الجلسة وكل الكاش.
- [ ] `setQueryData(sessionQueryKey('demo'), ...)` **قبل** `render`.
- [ ] `setQueryData` مباشر على مفتاح معروف بدل الاعتماد على `invalidateQueries` وحده.
- [ ] mock للمكونات المعتمدة على `Modal`/`Select` في اختبارات الشاشات.
- [ ] `waitFor` على الحالة النهائية (`busy=false` أو العنصر المتوقع).
- [ ] `user.id` يُقرأ من الجلسة، لا قيمة ثابتة.
- [ ] `jest.mock` **بعد** كل الـimports.

### TypeScript / ESLint
- [ ] `import { StyleSheet } from 'react-native'` صراحةً في كل ملف فيه `StyleSheet.create`.
- [ ] فهرسة مصفوفة بمتغير `number` ⇒ `!` أو `?? default`.
- [ ] لا `as const Type[]` بعد `Object.freeze([...])`.
- [ ] أي helper/نوع جديد يُضاف لسطر الاستيراد؛ ويُحذف غير المستخدم.
- [ ] `tabBar` prop مباشر لـ`<Tabs>` · `refreshing`/`onRefresh` props مباشرة على `FlatList`.

### الحزم والواجهات
- [ ] لا افتراض لواجهة حزمة من الذاكرة — تحقّق من المثبت أو اعزل الاستدعاء في **وحدة حدودية** (ADR-0022).
- [ ] `manipulateAsync` (الكلاسيكية) لـimage-manipulator · `File`/`Paths` (الصنفية) لـfile-system.
- [ ] `expo install --fix` يصلح `package.json` + `package-lock.json` معاً.

### i18n والمحتوى
- [ ] **تطابق صيغة مفاتيح i18n بين JSON و`ts/tsx` قبل الاختبار.**
- [ ] كل نص واجهة عبر `t()`؛ لا نصوص حرفية في المكونات.

### العملية
- [ ] **عند تغيير سلوك شاشة، حدّث اختبارها في نفس الجزء.**
- [ ] لا تعديل على عقود الـRepositories إلا إضافةً وبموافقة (ADR).
- [ ] كل قرار معماري ⇒ ADR؛ كل قيمة سياسة غير معتمدة ⇒ وسم `PENDING_POLICY` ظاهر للمستخدم.

---

## مؤجلات P08 (في PROJECT_CONTEXT §8)
- [ ] فئة الحاجة في payload ⇒ P15/P18 (#48).
- [ ] فلتر تدقيق بـ`target` ⇒ P18 (#49).
- [ ] انتقال ذرّي على الخادم ⇒ P18 (#50).
- [ ] بصمة محتوى + HMAC ⇒ P18 (#51).
- [ ] رقم مرجعي رسمي ⇒ P18 (#53).
- [ ] تحرير كامل لحقول الاستكمال ⇒ P17/P18 (#54).
- [ ] لوحة مراجع حقيقية بصلاحيات وفصل مراجعين ⇒ P17 (#55).
- [ ] تحقق الأجهزة لرفع المستندات ومعالجتها ⇒ P20/P21 (#26, #28).
- [ ] اعتماد العتبات والنطاقات والنافذة والاحتفاظ ⇒ المالك (#1, #3, #5, #7).
- [ ] تنفيذ #33 (صفّا الأمان والحذف) + حذف `SignInPlaceholder` (#34) + ضم الفاحص لـ`lint` (#24) + إعلان `zod` (#37).

---

## القرارات البشرية المفتوحة (Blockers)

| # | القرار | يحجب |
|---|--------|------|
| 1 | حدود الاستحقاق ونطاقات الدخل (عتبات P08 مؤقتة) | P15 / اعتماد نهائي للمحرك |
| 2 | سلّم التقييم والنطاقات (الأوزان محسومة من HRD) | اعتماد نهائي للمحرك |
| 3 | مدة الاعتراض (14 يوماً مؤقتة) | اعتماد نهائي |
| 4 | سياسة الانسحاب من العرس الجماعي | P10 |
| 5 | الاستثناء من مساعدة واحدة (مغلق مؤقتاً) | P17 |
| 6 | الفئة المستفيدة من خصومات الشركاء | P11 |
| 7 | مدة الاحتفاظ + فترة تأكيد الحذف | P09 (سجلات) / P19 / P23 |
| 8 | الحد الأدنى لإخفاء الإحصاءات (10 مؤقت) | P15 / P17 |
| 9 | مراجعة قانونية لنصوص Legal | الإطلاق |
| 10 | سياسة عرض النقاط وموافقة النشر (مخفية/لكل سجل مؤقتاً) | P15 / P17 |
