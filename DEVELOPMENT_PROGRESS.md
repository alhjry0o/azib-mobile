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
| P08 | Assistance & Eligibility Engine | Done | 2026-11-16 | 3 أجزاء · 1020 اختباراً / 155 suites · ADR-0027…0032. |
| P09 | **Financial Assistance Architecture** | **Done** | **2026-11-16** | 3 أجزاء · **178/178 suites · 1138/1138 tests** · lint/typecheck نظيفان · CI أخضر (بتقرير المالك) · ADR-0033…0039 + `docs/FINANCE_ARCHITECTURE.md`. |
| P10 | Group Weddings | **Blocked** | — | **محجوب** حتى `PRODUCT_POLICIES #4` (سياسة الانسحاب). |
| P11 | Partners + Ambassadors | Not Started | — | **محجوب** حتى فئة الخصومات؛ يضيف ربط حساب↔شريك. |
| P12 | Souk | Not Started | — | عيني فقط؛ يخدم نوع `in_kind`. |
| P13 | Jobs + Volunteers | Not Started | — | يضيف مهام التطوع الحقيقية. |
| P14 | Calculator + Guide | Not Started | — | إرشادي فقط. |
| P15 | Education + Charter + Impact | Not Started | — | **محجوب** حتى حد الإحصاءات؛ يوحّد الأثر مع الرئيسية. |
| P16 | Notifications + Search | Not Started | — | يربط مصدر شارة Dock وجرس الرئيسية. |
| P17 | Staff Console | Not Started | — | لوحة Maker/Checker ومراجع حقيقية بصلاحيات. |
| P18 | Supabase | Not Started | — | مزوّد مرخّص + Webhook + انتقال ذرّي + إيصال رسمي. |
| P19 | Security | Not Started | — | يستهلك `THREAT_MODEL.md` (محدَّث بـP09). |
| P20 | Offline / Perf / A11y | Not Started | — | يشمل تحقق الأجهزة المؤجل (P05–P09). |
| P21 | Testing | Not Started | — | Playwright + pgTAP. |
| P22 | GitHub Actions | Not Started | — | الفاحص أُضيف مبكراً في P05. |
| P23 | Docs | Not Started | — | يُستكمل README. |
| P24 | Final Integration | Not Started | — | مسار كامل حقيقي. |

---

## قوائم التحقق السابقة (مختصرة)

### P01
- [x] `AGENT_RULES` (HRD + 22 قاعدة) · `PROJECT_CONTEXT` (9 أقسام) · `DEVELOPMENT_PROGRESS` (24 مرحلة).
- [x] `DECISIONS` · `PRODUCT_POLICIES` · `GLOSSARY` · `ASSET_LICENSES` · `THREAT_MODEL` · `README`.
- [x] لا كود تطبيق. تأكيد المالك بأوامر التحقق.

### P02
- [x] Expo SDK 58 · TS strict + `noUncheckedIndexedAccess` + alias `@/*`.
- [x] ESLint flat + Prettier + سكربتات · Jest + اختبارات حقيقية · فاحص العربية مربوط بـ`lint`.
- [x] `app.config.ts` (allowBackup=false, supportsRTL, scheme) · CI أخضر.

### P03
- [x] `Result` · `AppError` (8 kinds) · `logger` مع redaction · `env` بـZod.
- [x] i18next + 14 namespace + formatters + RTL + plurals عربية.
- [x] 12 contracts + 12 mocks + 12 NotConnected + Registry + Container.
- [x] 16 repository contracts + mocks + Contract tests · 15 مجموعة seed + populator (13/16).

### P04
- [x] Tokens + ThemeProvider + 4 hooks + 17 زوج WCAG AA.
- [x] 42 مكوّناً + Gallery + `DESIGN_SYSTEM.md` + ADR-0009/0010/0011.

### P05
- [x] P05.1 الهيكل · P05.2 Splash + Onboarding + حفظ اللغة · P05.3 Dev + Integrations + فاحص الأزرار.
- [x] 623 اختباراً، CI أخضر.

### P06
- [x] P06.1 نواة المصادقة · P06.2 الملف/الإعدادات/الصورة · P06.3 الأمان/الجلسات/الحذف/التصدير/Legal.
- [x] 780 اختباراً / 110 suites · `docs/INTEGRATIONS.md`.

### P07
- [x] P07.1 HomeConfig + Header/Hero/QuickActions + 4 أقسام + التخصيص + أداة Demo.
- [x] P07.2 بوابة الموافقة + التعقيم + إخفاء الأعداد والمبالغ + فصل Demo/Real + 4 أقسام حساسة.
- [x] 869 اختباراً / 129 suites · `DESIGN_SYSTEM.md` صُحّح.

### P08
- [x] P08.1 العقود/المحرك/الآلة/الخدمات · P08.2 المستندات/المسودة/Wizard/الشاشات · P08.3 المتابعة/الاستكمال/القرار/الاعتراض/المحاكي.
- [x] 1020 اختباراً / 155 suites · `docs/ELIGIBILITY_ENGINE.md`.

---

## قائمة تحقق P09 (تفصيل)

### P09.1 — النواة النقية
- [x] قراءة `append-only.contract.ts` أولاً: يفحص `getById`/`create`/`list` فقط، **ولا يمنع إضافة دوال** ⇒ `advance` آمن (شرط د-4).
- [x] `DonationStatus` → 8 قيم (legacy `pending`/`confirmed` محفوظة) + حقول: `programId` · `anonymous` · `idempotencyKey` · `providerReference` · `receiptNumber` · `verifiedAt` · `verifiedBy`.
- [x] `DisbursementStatus` → 8 قيم + حقول: `makerId` · `checkerId` · `approvedAt` · `paidAt` · `beneficiaryConfirmedAt` · `rejectionReasonKey` · `disputeNote`.
- [x] `advance(id, event, actor)` على كليهما — **تطبيق فقط**؛ التحقق في الخدمة (نمط ADR-0027).
- [x] الحالة الابتدائية بصدق: `donations.create → intent_created` · `disbursements.create → proposed` (لا اختبار قائم يؤكد القديمة).
- [x] مخططات: مبالغ `int().positive()` + حقول اختيارية؛ `Program.kind?` اختيارية.
- [x] `donation-machine`: 6 حالات · 6 انتقالات · `CLIENT_WRITABLE_DONATION_STATUSES` · `assertClientDonationWrite` (Forbidden).
- [x] `disbursement-machine`: 6 حالات · 6 انتقالات · فحص الفاعل · legacy mapping.
- [x] `guards`: Maker≠Checker (ومفقود Maker مرفوض) · إثبات · مبلغ صحيح · حد تراكمي · حالة الطلب · `committedTotal` يستثني rejected.
- [x] `demo-payment.ts` في `providers/mock/`: عقد كما هو + `__confirmPledge`/`__declinePledge`/`__pledges` · `verifyExternalPayment` لا يخترع تأكيداً · `PLEDGE_ALREADY_SETTLED`.
- [x] الحاوية تستخدم Demo Payment في وضع demo فقط.
- [x] `idempotency.ts`: مفتاح حتمي مشتق (بلا `Date.now()`).
- [x] `receipt-service`: مشتق بعد `verified` + رقم `AZIB-DEMO-RCP-*` حتمي · لا هويات في العرض.
- [x] `impact-service`: real+verified فقط · إعادة استخدام `SMALL_NUMBER_THRESHOLD`/`buildStatCell` · تعريف كل مقياس.
- [x] `finance-audit`: Append-only بميتاداتا `from`/`to` فقط.
- [x] `donation-intent-service`: إنشاء/إلغاء (ملكية)/تسليم/محاكاة demo/تحقق مالي.
- [x] `disbursement-service`: اقتراح (حالة الطلب + الحد)/قرار (فصل)/تسجيل دفع (إثبات)/رد مستفيد (ملكية).
- [x] اختبارات: آلتان استقصائياً · الحراس · المزوّد · Idempotency · الإيصال · الأثر · الخدمات · المخططات · مستودعات advance.
- [x] **النتيجة: 166 suites / 1093 tests، أخضر من أول تشغيل** (بتقرير المالك).

### P09.2 — الكتالوج والنية والشاشات
- [x] `catalog/program-kinds.ts`: 5 أنواع بأعلام `donatable`/`referralOnly`/`inKind` + `programKindOf` (افتراض grant).
- [x] `use-program-catalog` (كتالوج + تفاصيل) · `use-donor` (تبرعاتي + إيصالات + أسماء البرامج) · `use-donation-intent`.
- [x] `CertaintyBadge` (أيقونة+نص+لون) · `AmountField` (أعداد صحيحة) · `FinanceScaffold` (بوابة backend + شارة demo).
- [x] شاشات: الكتالوج · التفاصيل · النوع · نية التبرع · تبرعاتي · الإيصالات · متطلبات الجهة المرخّصة.
- [x] منع التبرع لغير القابل/غير المفتوح مع سبب معروض؛ القرض الحسن ⇒ إحالة فقط؛ العيني ⇒ سوق الخير.
- [x] فصل صريح: إنشاء النية → تسليم للمزوّد → محاكاة تأكيد موسومة؛ **لا `verified` من شاشة المستخدم**.
- [x] `ROUTES.programs` + Allowlist + بادلة `/programs/` + مداخل الحساب.
- [x] نصوص `assistance:finance.*` (ar/en) كاملة.
- [x] اختبارات: idempotency · الكتالوج · التفاصيل · النوع · النية · تبرعاتي · الإيصالات · المتطلبات.
- [x] **النتيجة: 174 suites / 1120 tests، CI أخضر** (بتقرير المالك).

### P09.3 — الصرف والأثر والمحاكي
- [x] `DisbursementStatusBadge` (6 مستويات يقين) · `DisbursementCard` (إثبات + إجراءات مشروطة).
- [x] `use-beneficiary-disbursements` (طلبات المستخدم فقط) · `use-disbursement-actions` · `use-impact-report`.
- [x] `BeneficiaryDisbursementsScreen`: تأكيد الاستلام / اعتراض بسبب إلزامي · أزرار فقط عند `paid_recorded`.
- [x] `ImpactReportScreen`: فارغ صادق في Demo + ملاحظة الحد + تعريف كل رقم + نص استبعاد demo.
- [x] `DevFinanceScreen`: إنشاء طلب معتمد + اقتراح + اعتماد/رفض + تسجيل دفع، بحقول Maker/Checker/Proof قابلة للتعديل.
- [x] مسارات `programs/disbursements` · `programs/impact` · `(dev)/finance` + رابط من إعدادات المطور.
- [x] اختبارات: تعيين اليقين · سجل المستفيد (فارغ/بيانات/تأكيد/اعتراض/backend) · الأثر · المحاكي (فصل Maker/Checker من الواجهة).
- [x] **النتيجة النهائية: 178/178 suites · 1138/1138 tests · lint وtypecheck نظيفان · CI أخضر بالكامل** (بتقرير المالك).

### إصلاحات P09
- [x] **P09.1: لا أخطاء** — أخضر من أول تشغيل.
- [x] **P09.2: مجموعة واحدة** — `render` في RNTL v14 تُرجع Promise، وتحديث متغيّر خارجي (`mockId`) بعد الـrender لا يعيد الرسم تلقائياً ⇒ `await render` + تفكيك `rerender` + `await rerender(...)` بعد التحديث وقبل `waitFor`.
- [x] **P09.3: لا أخطاء** — أخضر من أول تشغيل؛ نقطة خطر `React.ReactNode` أُغلقت بتقرير المالك.

---

## الدروس المُلزِمة (تراكمية — تُطبَّق في كل مرحلة قادمة)

### الاختبارات (RNTL v14 + Query)
- [ ] `await render(...)` · `await fireEvent.xxx(...)` · `await view.unmount()`.
- [ ] **`rerender` إلزامي** بعد تحديث متغيّر خارجي تقرأه الواجهة (`useLocalSearchParams`/`useAuth` محاكاة) — تحديث المتغيّر وحده لا يعيد الرسم.
- [ ] **لا** تغليف `fireEvent` داخل `act`.
- [ ] `await act(() => {...})` (callback متزامن) لتحديث المتاجر.
- [ ] كل `it` فيه `await` هو `async`.
- [ ] مجلد الاختبار **`__tests__`** دائماً.
- [ ] **`invalidateQueries({ queryKey: ['<feature>'] })` دائماً** — بلا `queryKey` يمسح الجلسة وكل الكاش.
- [ ] `setQueryData(sessionQueryKey(mode), ...)` **قبل** `render`.
- [ ] `setQueryData` مباشر على مفتاح معروف بدل الاعتماد على `invalidateQueries` وحده.
- [ ] mock للمكونات المعتمدة على `Modal`/`Select` في اختبارات الشاشات.
- [ ] `waitFor` على الحالة النهائية (`busy=false` أو العنصر المتوقع).
- [ ] `user.id` يُقرأ من الجلسة، لا قيمة ثابتة.
- [ ] `jest.mock` **بعد** كل الـimports.

### React 19 / React Compiler
- [ ] لا `useRef().current` أثناء render ⇒ `useMemo`/`useCallback`.
- [ ] لا `Date.now()` أثناء render ⇒ `useMemo` + `eslint-disable-next-line react-hooks/purity` فوق السطر.
- [ ] **كل Hook قبل أي `return` مبكر** — بلا استثناء.
- [ ] لا `setState` مباشر داخل `useEffect` ⇒ `useQuery`.
- [ ] الكائنات المُمرَّرة كـ dependency تُغلَّف بـ`useMemo` (مثل `deps`).
- [ ] `useWatch` بدل `watch` في React Hook Form.
- [ ] `override` قبل `state`/`render` في أي Class Component.
- [ ] تعديل `SharedValue` يسبقه `eslint-disable-next-line react-hooks/immutability`.

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
- [ ] لا تعديل على عقود الـRepositories إلا إضافةً وبموافقة (ADR)؛ ولا مساس بـContract Tests.
- [ ] كل قرار معماري ⇒ ADR؛ كل قيمة سياسة غير معتمدة ⇒ وسم `PENDING_POLICY` ظاهر للمستخدم.
- [ ] **لا ادعاء مالي:** نية ≠ تأكيد مزوّد ≠ تحقق مالي ≠ صرف مؤكَّد من المستفيد.

---

## مؤجلات P09 (في PROJECT_CONTEXT §8)
- [ ] مزوّد مرخّص + Webhook بتوقيع + كتابة `verified` خادمياً ⇒ P18 (#57).
- [ ] توحيد إحصاءات الرئيسية مع `verified` ⇒ P15/P18 (#58).
- [ ] لوحة Maker/Checker بصلاحيات وفصل مراجعين ⇒ P17 (#59).
- [ ] تصنيف حقيقي للبرامج (`kind` في الـseed/الخادم) ⇒ P18 (#60).
- [ ] جهة إحالة للقرض الحسن ⇒ بعد اعتماد #11 (#61).
- [ ] إيصال رسمي غير تجريبي ⇒ P18 (#63).
- [ ] انتقال ذرّي على الخادم ⇒ P18 (#50).
- [ ] تحقق الأجهزة للتدفق المالي ⇒ P20/P21 (#26).
- [ ] تنفيذ #33 + حذف `SignInPlaceholder` (#34) + ضم الفاحص لـ`lint` (#24) + إعلان `zod` (#37).

---

## القرارات البشرية المفتوحة (Blockers)

| # | القرار | يحجب |
|---|--------|------|
| 1 | حدود الاستحقاق ونطاقات الدخل | P15 · اعتماد المحرك نهائياً |
| 2 | سلّم النطاقات (الأوزان محسومة) | اعتماد المحرك نهائياً |
| 3 | مدة الاعتراض (14 يوماً مؤقتة) | P17 |
| 4 | **سياسة الانسحاب من العرس الجماعي** | **P10** |
| 5 | الاستثناء من مساعدة واحدة | P17 |
| 6 | الفئة المستفيدة من خصومات الشركاء | P11 |
| 7 | مدة الاحتفاظ + فترة تأكيد الحذف | P19 / P23 |
| 8 | الحد الأدنى لإخفاء الإحصاءات (10 مؤقت) | P15 / P17 |
| 9 | مراجعة قانونية لنصوص Legal | الإطلاق |
| 10 | سياسة عرض النقاط وموافقة النشر | P15 / P17 |
| 11 | **سياسة المزوّد المرخّص (الجهة/الاتفاقية/الرسوم)** | **P18 · أي تبرع حقيقي** |
