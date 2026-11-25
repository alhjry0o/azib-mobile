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
| P06 | Auth / Profile / Settings / Legal | Done | 2026-11-16 | 3 أجزاء · 780 / 110 · ADR-0016…0022. |
| P07 | Home Dashboard & Discovery | Done | 2026-11-16 | جزءان · 869 / 129 · ADR-0023…0026. |
| P08 | Assistance & Eligibility Engine | Done | 2026-11-16 | 3 أجزاء · 1020 / 155 · ADR-0027…0032. |
| P09 | Financial Assistance Architecture | Done | 2026-11-16 | 3 أجزاء · 1138 / 178 · ADR-0033…0039. |
| P10 | Group Weddings | Done | 2026-11-16 | 3 أجزاء · 1270 / 207 · ADR-0040…0050. |
| P11 | **Partner Marketplace, Contribution System & Ambassadors** | **Done** | **2026-11-26** | 3 أجزاء · **231/231 suites · 1396/1396 tests** · lint/typecheck نظيفان · CI أخضر (بتقرير المالك) · ADR-0051…0060. |
| P12 | Souk | Not Started | — | عيني فقط؛ يخدم `in_kind`؛ لا دفع ولا تتبّع. |
| P13 | Jobs + Volunteers | Not Started | — | مهام تطوع حقيقية. |
| P14 | Calculator + Guide | Not Started | — | إرشادي فقط. |
| P15 | Education + Charter + Impact | Not Started | — | **محجوب** حتى حد الإحصاءات؛ يوحّد الأثر وعرض الخصم. |
| P16 | Notifications + Search | Not Started | — | مصدر شارة Dock وجرس الرئيسية. |
| P17 | Staff Console | Not Started | — | لوحة مراجعة الشركاء/العروض + Maker/Checker + إدارة مجموعات. |
| P18 | Supabase | Not Started | — | RLS لمستندات التحقق/البلاغات/مهام السفير + تخزين دائم. |
| P19 | Security | Not Started | — | يستهلك `THREAT_MODEL.md` (محدَّث بـP11). |
| P20 | Offline / Perf / A11y | Not Started | — | تحقق الأجهزة المؤجل (P05–P11). |
| P21 | Testing | Not Started | — | Playwright + pgTAP. |
| P22 | GitHub Actions | Not Started | — | الفاحص أُضيف مبكراً في P05. |
| P23 | Docs | Not Started | — | يُستكمل README. |
| P24 | Final Integration | Not Started | — | مسار كامل حقيقي. |

---

## قوائم التحقق السابقة (مختصرة)

### P01
- [x] `AGENT_RULES` (HRD + 22 قاعدة) · `PROJECT_CONTEXT` (9 أقسام) · `DEVELOPMENT_PROGRESS` (24 مرحلة).
- [x] `DECISIONS` · `PRODUCT_POLICIES` · `GLOSSARY` · `ASSET_LICENSES` · `THREAT_MODEL` · `README`.

### P02
- [x] Expo SDK 58 · TS strict + `noUncheckedIndexedAccess` + alias `@/*`.
- [x] ESLint flat + Prettier + سكربتات · Jest + فاحص العربية مربوط بـ`lint` · CI أخضر.

### P03
- [x] `Result` · `AppError` · `logger` مع redaction · `env` بـZod.
- [x] i18next + 14 namespace · 12 contracts/mocks/NotConnected · 16 repos + Contract tests · seed.

### P04
- [x] Tokens + ThemeProvider + 4 hooks + 17 زوج WCAG AA · 42 مكوّناً + Gallery + `DESIGN_SYSTEM.md`.

### P05
- [x] الهيكل · Splash + Onboarding + حفظ اللغة · Dev + Integrations + فاحص الأزرار · 623 اختباراً.

### P06
- [x] نواة المصادقة · الملف/الإعدادات/الصورة · الأمان/الجلسات/الحذف/التصدير/Legal · 780 / 110.

### P07
- [x] HomeConfig + 8 أقسام + بوابة الموافقة + إخفاء الأعداد والمبالغ + فصل Demo/Real · 869 / 129.

### P08
- [x] العقود/المحرك/الآلة · المستندات/المسودة/Wizard · المتابعة/الاعتراض/المحاكي · 1020 / 155.

### P09
- [x] عقدا التمويل/الآلتان/الحراس · الكتالوج/النية/الإيصالات · الصرف/الأثر/المحاكي · 1138 / 178.

### P10
- [x] تمديد Wedding + 4 مستودعات · المحرك/الآلة/التصويت/الموافقات/الدردشة · الميزانية/الاتفاق/الاحتفال · 1270 / 207.

---

## قائمة تحقق P11 (تفصيل)

### P11.1 — النواة النقية (10 suites · +74 اختباراً)
- [x] قراءة `crud.contract.ts` أولاً: لا يمنع حقولاً أو دوال إضافية ⇒ التمديد آمن.
- [x] `PartnerStatus` → 6 قيم (legacy محفوظ) + `ownerId`/وصف/محافظة/مديرية/مدينة/هاتف/واتساب/صور/`termsAcceptedAt` + `verificationId`/`verifiedAt`/`reverifyAfter`/أسباب + إحداثيات.
- [x] `OfferStatus` → 7 قيم + `DiscountType` (percent/fixed/gift/service) + `OfferAudience` + `title`/`discountValue`/`discountPlaceholder`/منتجات/شروط/`validFrom`/`validUntil`/صور/فئة/منطقة/أسباب/`publishedAt`/`reviewRequestedAt`.
- [x] **4 مستودعات جديدة**: `PartnerVerificationRepository` (submit/decide/getLatest) · `OfferReportRepository` · `PartnerEngagementRepository` (save/unsave/listSaved/recordView/getViews/getViewsForOffers) · `AmbassadorRepository` (apply/decide/createTask/listTasks/listTasksByRegion/updateTask) ⇒ **24**.
- [x] `state/partner-machine.ts`: 6 حالات · **10 انتقالات** · فاعل لكل انتقال · لا حالة نهائية (كلها قابلة للاستعادة).
- [x] `state/offer-machine.ts`: 7 حالات · **8 انتقالات** · `cancelled` نهائية · `isClientWritableOfferStatus` يرفض `expired`.
- [x] `state/verification.ts`: `isVerified(verification, now)` **لا يقرأ `Partner.status` إطلاقاً** · `isVerificationActive` · `needsReverification` · `reverifyDeadline`.
- [x] `state/expiry.ts`: `isExpired` · `hasStarted` · `offerVisibility` (live/scheduled/expired/not_published) · `daysRemaining`.
- [x] `state/permissions.ts`: 9 أدوار × 25 صلاحية · `AMBASSADOR_FORBIDDEN` صريحة · `canEditOwnPartner/Offer` تشترط الملكية.
- [x] `lib/phone.ts`: تنظيف يمني (5 صيغ) · رفض غير الصحيح · إنتاج e164/digits/national.
- [x] `lib/external-links.ts`: قائمة سماح (tel:/wa.me/geo:/maps:/maps.google.com) · builders · `requiresConfirmation` (واتساب/خرائط فقط).
- [x] `lib/categories.ts`: **14 فئة** + `categoryLabelKey`.
- [x] `lib/stats.ts`: `computeOfferStats` tái يستخدم `SMALL_NUMBER_THRESHOLD`/`suppressSmallNumber` · `totalViews`.
- [x] `lib/filters.ts`: `filterPartners` (نص/فئة/منطقة/موثّق) · `filterOffers`.
- [x] `config/limits.ts`: `system_settings` · إعادة تحقق 365 (30..1825) · `AUDIENCE_OPTIONS` بـ`beneficiaries` فقط مفعّل.
- [x] seed: تمديد partners/offers (بلا هواتف في الحزمة) + `partner-marketplace.ts` مستقل بأرقام مُختلقة بوضوح.
- [x] اختبارات: الآلتان استقصائياً · الشارة · الانتهاء · التنظيف · الروابط · الفلاتر · الإحصاءات · الصلاحيات · الحدود · المخططات · المستودعات الأربعة.

### P11.2 — المتصفح والتفاصيل والتفاعل (6 suites · +23 اختباراً)
- [x] `services/external-actions.ts`: **وحدة حدودية** لـ`expo-linking` + `Share`؛ قائمة السماح تُفرض **قبل** الفتح.
- [x] `services/engagement-service.ts`: save/unsave/report/recordView + تدقيق للبلاغ.
- [x] hooks: browser (فلاتر + تاج من السجل) · profile · offer-detail (مشاهدات/محفوظ/صلاحية) · offer-actions · saved.
- [x] components: `PartnerScaffold` · `VerifiedCrown` · `DiscountValue` (وسم placeholder) · `ValidityCountdown` · `PartnerCard` · `OfferCard` · `ReportOfferForm`.
- [x] screens: Browser (التبويب) · Profile · OfferList · OfferDetail · SavedOffers.
- [x] تفاصيل العرض: قيمة الخصم · المنتجات · الشروط · عدّاد صلاحية · طريقة الاستفادة · ملاحظة الفئة المؤقتة.
- [x] اتصال `tel:` مباشر · واتساب/خرائط **بتأكيد قبل المغادرة** · مشاركة برابط `azib://` حقيقي · أزرار معطّلة بسبب عند غياب الرقم.
- [x] `ROUTES.partners` + Allowlist + بلا `app/partners/index.tsx`.
- [x] نصوص `marketplace:*` (ar/en) كاملة.

### P11.3 — التسجيل واللوحة والعروض والسفراء (8 suites · +29 اختباراً)
- [x] `config/limits.ts` + `PARTNER_MEDIA_LIMITS` (5MB صور / 10MB PDF) + حدود عدد الوسائط.
- [x] `schemas/registration.ts`: تسجيل الشريك (شروط + مستند واحد على الأقل) · طلب السفير · تسليم المهمة.
- [x] `services/media-service.ts`: **إعادة استخدام** `pickImageDocument`/`pickPdfDocument`/`prepareDocument` من P08 بحدود السوق (القاعدة 7).
- [x] `services/registration-service.ts`: `registerPartner` ⇒ `pending_verification` + سجل · `resubmitVerification` عبر الآلة.
- [x] `services/verification-service.ts`: `decideVerification` · `requestReverification` · `expirePartner` (system) · `suspendPartner` · `reinstatePartner`.
- [x] `services/offer-lifecycle-service.ts`: draft → in_review → approved/rejected → active → expired/cancelled → renew؛ **النشر يشترط سجل تحقق ساري**.
- [x] `services/ambassador-service.ts`: طلب/موافقة/مهام؛ **التبعيات لا تحوي مستودعات المستفيدين أصلاً**؛ المهمة مقيّدة بالمنطقة المعتمدة.
- [x] hooks: registration · my-partner (لوحة + إحصاءات) · offer-composer · ambassador.
- [x] components: `VerificationStatusBadge` · `OfferStatusBadge` · `MediaUploadField`.
- [x] screens: Register · Dashboard · OfferComposer · Ambassador.
- [x] `features/dev/DevPartnersScreen.tsx` + `app/(dev)/partners.tsx` + رابط من إعدادات المطور.
- [x] ربط الأعراس: اقتراحات عروض في `GroupBudgetScreen` **قراءة فقط** بوسم placeholder.
- [x] 6 مسارات جديدة + Allowlist + نصوص الترجمة.

### النتيجة النهائية
- [x] **231/231 test suites · 1396/1396 tests · lint وtypecheck نظيفان · CI أخضر بالكامل** (بتقرير المالك 2026-11-26).
- [x] صفر انحدار في P03–P11.2 (1367 اختباراً).
- [x] **الإجمالي التراكمي لـP11: +24 suite · +126 اختباراً.**

### تسلسل P11.3 بصدق
- [x] الملفات **الأصلية** بُنيت **خضراء قبل** تعديلات المراجعة.
- [x] التعديلات الأربعة كانت **وقائية** (صحة وقت تشغيل ونطاق) — لم تكن مرئية في CI.
- [x] الخطأ الوحيد الذي ظهر في CI نتج عن **تعليمة استيراد غير دقيقة من المالك**، لا عن كود النموذج.

### إصلاحات P11 (5 مجموعات)
- [x] **P11.1: لا أخطاء** — أخضر من أول تشغيل.
- [x] **P11.2 (CI):** موكات معرّفة بلا معاملات في `OfferDetailScreen.test` · نقص `activityType` في موك `Share`.
- [x] **P11.3 وقائي 1:** خطأ مُصنّع `{kind:'NotFound'} as never` بلا `meta` ينهار في `authErrorKey` ⇒ `AppError.notFound({code:'VERIFICATION_NOT_FOUND'})`.
- [x] **P11.3 وقائي 2:** `dev-reject-partner` يُرجع `ok:true/value:null` عند غياب السجل ⇒ **نجاح كاذب**؛ استُبدل بنفس خطأ NotFound.
- [x] **P11.3 وقائي 3:** زر «إعادة تقديم المستندات» ميت دائماً (لا رافع في اللوحة) ⇒ أُضيف `MediaUploadField` مربوط بالـhook ومشروط بـ`canResubmit`.
- [x] **P11.3 وقائي 4:** `decideVerification` يحسم السجل **قبل** فحص الآلة ⇒ حالة متناقضة (سجل verified وشريك suspended)؛ نُقل الفحص قبل الكتابة.
- [x] **P11.3 CI:** `TS2305` + `TS7006`×2 — `MediaUploadField` أُضيف إلى كتلة `@/components/ui` بدل مساره النسبي؛ الخطآن الثانيان **نتيجة** لجهل نوع الـprops.

---

## الدروس المُلزِمة (تراكمية — تُطبَّق في كل مرحلة قادمة)

### الاختبارات (RNTL v14 + Query + الساعة)
- [ ] `await render(...)` · `await fireEvent.xxx(...)` · `await view.unmount()`.
- [ ] **`rerender` إلزامي** بعد تحديث متغيّر خارجي تقرأه الواجهة.
- [ ] **الموكات تُعرَّف بمعاملات صريحة** مطابقة للاستدعاء، وإلا فشل typecheck.
- [ ] موك `Share.share` يعيد `activityType` (ولو `undefined`) — تعريفات RN تتطلبه.
- [ ] **الساعة المحقونة توافق ساعة التخزين**؛ اشتقّها من البيانات المخزَّنة لا من تاريخ ماضٍ ثابت.
- [ ] لا `act` حول `fireEvent` · `await act(() => {...})` للمتاجر · كل `it` فيه `await` هو `async`.
- [ ] **`invalidateQueries({ queryKey: ['<feature>'] })` دائماً** · `setQueryData` للجلسة قبل render.
- [ ] mock للمكونات المعتمدة على `Modal`/`Select`/`DatePicker` · `jest.mock` بعد الـimports.

### React 19 / React Compiler
- [ ] لا `useRef().current` ولا `Date.now()` أثناء render.
- [ ] **كل Hook قبل أي `return` مبكر** · لا `setState` مباشر في `useEffect`.
- [ ] الكائنات المُمرَّرة كـ dependency تُغلَّف بـ`useMemo` · لا `[]`/`{}` خارج `useMemo`.
- [ ] `useWatch` بدل `watch` · `override` في Class Component · `eslint-disable react-hooks/immutability` لتعديل `SharedValue`.

### TypeScript / ESLint / الاستيرادات
- [ ] **مكوّنات الميزة تُستورد بمسارها النسبي** (`../components/X`) **لا من برميل `@/components/ui`**.
- [ ] **كل تعليمة «أضف استيراداً» تحمل المسار الكامل** — وإلا نتج `TS2305` ومعه `TS7006` تابعة.
- [ ] التضييق لا يصمد داخل callback ⇒ `const snapshot = x.value` بعد الحارس.
- [ ] كل الاستيرادات أعلى الملف · لا استيراد مكرر من نفس المسار.
- [ ] **فشل حلّ نفس المسار من عدة مستهلكين = ملف غائب/مُسمّى خطأً**.
- [ ] `StyleSheet` صريح · `!`/`?? default` للفهرسة · لا `as const Type[]` بعد `Object.freeze`.

### صحة وقت التشغيل والنطاق
- [ ] **لا تُصنّع كائن خطأ يدوياً** (`{kind:'X'} as never`) — استخدم `AppError.*` دائماً؛ المستهلك يقرأ `meta`.
- [ ] **لا تُرجع `ok:true/value:null` عند غياب مورد مطلوب** — هذا نجاح كاذب في الواجهة؛ أعِد `NotFound`.
- [ ] **كل زر يحتاج مدخلاته موجودة في نفس الشاشة** — زر يقرأ حقول نموذج فارغ دائماً = زر ميت.
- [ ] **الآلة قبل الكتابة في كل خدمة**: افحص الانتقال ثم اكتب السجل/الحالة، وإلا نتجت حالة بيانات متناقضة.
- [ ] الخدمة تسلك المسار المعلن ولا تقفز حالتين؛ ولا تُوسَّع الآلة للالتفاف على ترتيبها.
- [ ] كل مسار بلا `RequireAuth` يُسقط إسقاطاً عاماً — والحلقات مع التاريخ.

### العملية والتحرير
- [ ] عند تكرار سطر الحارس في عدة دوال، حدّد **مرساة فريدة** قبل طلب الاستبدال.
- [ ] عند تغيير أسماء حقول مخطط ميزة، حدّث اختبار تلك الميزة في نفس الجزء.
- [ ] **فاحص العربية:** `app/` + `src/` فقط، `.ts/.tsx`، عدا `src/locales/`؛ التعليقات تُستثنى؛ العلامة **لكل سطر**؛ **`locales/*.json` خارج الفحص ⇒ مراجعة بشرية إلزامية**.
- [ ] **إعادة الاستخدام تُثبت بالبناء**: إن كان البناء أخضر فلا تطلب ملفين مُستهلكَين ولا تعِد كتابتهما (القاعدة 7).
- [ ] لا تعديل على عقود المستودعات إلا إضافةً وبموافقة (ADR)؛ ولا مساس بـContract Tests.
- [ ] كل قرار معماري ⇒ ADR · كل قيمة سياسة غير معتمدة ⇒ وسم `PENDING_POLICY` ظاهر.
- [ ] **لا ادعاء مالي** · **لا شارة توثيق من حقل يكتبه العميل**.

---

## مؤجلات P11 (في PROJECT_CONTEXT §8)
- [ ] توحيد عرض الخصم غير النسبي في الرئيسية والاقتراحات ⇒ P12/P15 (#71).
- [ ] تخزين دائم + RLS لصور الشركاء ومستندات التحقق ⇒ P18 (#72).
- [ ] مزامنة الحفظ والمشاهدات ⇒ P18 (#73).
- [ ] لوحة مراجعة الشركاء/العروض بصلاحيات ⇒ P17 (#74).
- [ ] اعتماد مدة إعادة التحقق ⇒ المالك (#75).
- [ ] خرائط i18n لأكواد أخطاء السوق ⇒ P17 (#76).
- [ ] تغطية أوسع لمحاكي الشركاء ⇒ P17/P21 (#77).
- [ ] ربط `populateDemoSeed` بمستودعات P10/P11 ⇒ P16 (#14).
- [ ] تحقق الأجهزة (tel:/wa.me/الخرائط/رفع الوسائط) ⇒ P20/P21 (#26, #28).
- [ ] تنفيذ #33 · حذف `SignInPlaceholder` (#34) · #58 · #64 · #65 · #66 · #67 · #24 · #37.

---

## القرارات البشرية المفتوحة (Blockers)

| # | القرار | يحجب |
|---|--------|------|
| 1 | حدود الاستحقاق ونطاقات الدخل | P15 · اعتماد المحرك |
| 2 | سلّم النطاقات (الأوزان محسومة) | اعتماد المحرك |
| 3 | مدة الاعتراض | P17 |
| 4 | سياسة الانسحاب (30 يوماً مؤقتة) | الاعتماد النهائي |
| 5 | الاستثناء من مساعدة واحدة | P17 |
| 6 | **فئة خصومات الشركاء** (`beneficiaries` مؤقتة) | الاعتماد النهائي · P15 |
| 7 | مدة الاحتفاظ + الحذف + الدردشة + مستندات التحقق | P19 / P23 |
| 8 | الحد الأدنى لإخفاء الإحصاءات | P15 / P17 |
| 9 | مراجعة قانونية لنصوص Legal | الإطلاق |
| 10 | سياسة عرض النقاط وموافقة النشر | P15 / P17 |
| 11 | سياسة المزوّد المرخّص | P18 · تبرع حقيقي |
| 12 | إعادة توزيع الحصص المخصصة بعد الانسحاب | إتمام `custom` |
| 13 | **مدة إعادة التحقق الدورية للشركاء (365 يوماً مؤقتة)** | الاعتماد النهائي |
