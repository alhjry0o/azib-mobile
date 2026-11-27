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
| P11 | Partners + Ambassadors | Done | 2026-11-26 | 3 أجزاء · 1396 / 231 · ADR-0051…0060. |
| P12 | **Souk Al Khair** | **Done** | **2026-11-26** | 3 أجزاء · **252/252 suites · 1503/1503 tests** · lint/typecheck نظيفان · doctor 20/20 · CI أخضر (بتقرير المالك) · ADR-0061…0073. |
| P13 | Jobs + Volunteers | Not Started | — | مهام تطوع حقيقية؛ لا بيانات تواصل عامة. |
| P14 | Calculator + Guide | Not Started | — | إرشادي فقط. |
| P15 | Education + Charter + Impact | Not Started | — | **محجوب** حتى حد الإحصاءات؛ يوحّد الأثر وعرض الخصم. |
| P16 | Notifications + Search | Not Started | — | مصدر شارة Dock وجرس الرئيسية **وإشعارات سوق خير**. |
| P17 | Staff Console | Not Started | — | طابور إشراف سوق خير + لوحة الشركاء + Maker/Checker. |
| P18 | Supabase | Not Started | — | RLS للطلبات/الدردشة/البلاغات + تخزين دائم + رمز رسمي. |
| P19 | Security | Not Started | — | يستهلك `THREAT_MODEL.md` (محدَّث بـP12). |
| P20 | Offline / Perf / A11y | Not Started | — | تحقق الأجهزة المؤجل (P05–P12). |
| P21 | Testing | Not Started | — | Playwright + pgTAP. |
| P22 | GitHub Actions | Not Started | — | الفاحص أُضيف مبكراً في P05؛ Doctor ثُبّت في P12. |
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

### P11
- [x] تمديد Partner/Offer + 4 مستودعات · الشارة من السجل · الروابط الخارجية · التسجيل/اللوحة/العروض · السفراء · 1396 / 231.

---

## قائمة تحقق P12 (تفصيل)

### P12.1 — النواة النقية (10 suites · +79 اختباراً)
- [x] قراءة `crud.contract.ts` و`souk.test.ts` أولاً: لا يمنع حقولاً إضافية، و`validUpdate:{status:'reserved'}` يبقى صالحاً.
- [x] `SoukStatus` → 9 قيم (legacy `available`/`reserved`/`claimed` محفوظة، و`claimed` **للقراءة فقط** تُ映射 إلى `handed_over`).
- [x] حقول إضافية: `donorId` · `title` · `description` · `condition` · `governorateId`/`districtId` · `deliveryMethod` · `imageFileIds`/`imageFingerprints` · `estimatedValue` · `noResaleConsentAt` · `reservedForRequestId` · `expiresAt` · `rejectionReasonKey` · `duplicateFlag` · `saleWordFlag`.
- [x] **لا `price`/`amountPaid`/`currency` في أي كيان أو شاشة** (ADR-0063).
- [x] **3 مستودعات جديدة**: `SoukRequestRepository` (طلبات/موافقات كشف/تأكيدان/تقييم) · `SoukReportRepository` · `SoukChatRepository` (رسائل/بلاغ/حذف/`subscribe`) ⇒ **27**.
- [x] `state/item-machine.ts`: 8 حالات · **10 انتقالات** · فحص الفاعل · `isClientWritableItemStatus` يرفض `reserved`/`handed_over`/`expired`.
- [x] `state/request-machine.ts`: 5 حالات · **9 انتقالات** · `handed_over` للنظام فقط · النهائية مغلقة.
- [x] `state/contact-disclosure.ts`: `not_a_party` / `not_accepted` / `awaiting_consents` / `ready` · لا كشف بموافقة طرف واحد · لا كشف للطرفين معاً في بيانات منحطة.
- [x] `state/handover.ts`: رمز `AZIB-DEMO-HO-*` حتمي · `assertCanConfirmHandover` · `isHandoverComplete` · `validateRating` (1..5 + ملاحظة ≤300).
- [x] `state/sale-lexicon.ts`: معجم عربي/إنجليزي **بسطر واحد + `// i18n-allow-arabic`** · تحذير لا حجب · `hasNoResaleConsent`.
- [x] `state/duplicate.ts`: بصمة صورة أو عنوان+منطقة+متبرع · **قيد إعادة التسمية معلن**.
- [x] `state/stats.ts`: تقدير غير موثق · **حجب المبلغ مع عدد المساهمين** (إصلاح المالك).
- [x] `state/limits.ts`: `system_settings` + افتراضات موسومة + `SOUK_MEDIA_LIMITS` مستقل.
- [x] `state/filters.ts` (11 تصنيفاً) · `state/public-view.ts` · `state/permissions.ts` · `state/error-keys.ts`.
- [x] `services/*`: item · request · coordination · handover · report · media (إعادة استخدام خط P08).
- [x] seed: تمديد `souk.ts` + `souk-marketplace.ts` مستقل.
- [x] اختبارات: الآلتان استقصائياً · الكشف · الرمز · المعجم · التكرار · الإحصاء · الحدود · المخططات · المستودعات الثلاثة.

### P12.2 — التصفح والتفاصيل والإضافة والطلب (6 suites · +16 اختباراً)
- [x] hooks: limits · browser · item · composer · mine.
- [x] components: `SoukScaffold` · `SoukBadges` (4 شارات) · `GiftEmptyState` (3D هدية) · `SoukImageGallery` · `SoukItemCard`.
- [x] screens: Browser · ItemDetail · ItemComposer · Request · MyItems · MyRequests.
- [x] **الإسقاط العام إلزامي:** لا `donorId` ولا `estimatedValue` ولا عنوان دقيق في أي سطح عام.
- [x] إضافة عنصر: ضغط/EXIF عبر خط P08 · حد الصور من الإعدادات · شرط عدم إعادة البيع · **رفض رقم تواصل في الوصف**.
- [x] طلب الاستفادة: سبب ≥10 · حد نشط · منع تكرار · لا طلب على عنصر خود.
- [x] **اختبارا رفض المعدل** بساعة توافق ساعة التخزين (3 عناصر ثم الرابع · 5 طلبات ثم السادس).
- [x] **حذف `app/(features)/souk.tsx`** + `app/souk/` كاملة بـ`index.tsx` + `ROUTES.features.souk='/souk'`.
- [x] تحديث اختبارين قديمين يثبّتان المسار نصياً (`HomeScreen.test` · `ProgramKindScreen.test`).
- [x] نصوص `marketplace:souk.*` (ar/en) + المسارات + Allowlist.

### P12.3 — التنسيق والتسليم والبلاغ والمحاكي (5 suites · +12 اختباراً)
- [x] hooks: inbox · coordination · handover · report.
- [x] components: `SafeMeetingNote` · `ContactDisclosureCard` · `HandoverCodeCard`.
- [x] screens: **SoukInboxScreen** (قبول/رفض بسبب/فتح التنسيق) · Coordination · Handover · Report.
- [x] دردشة بعد القبول فقط · فلتر P10 · معدل · `subscribe` يكتب في Query cache (لا `setState` في effect).
- [x] كشف الرقم من `Profile.phone` عند `accepted` + موافقتين + طرفية.
- [x] **الرمز للمتبرع فقط** — تصغير عند حدود الـhook في `use-souk-coordination` و`use-souk-handover` (إصلاح المالك).
- [x] `handed_over` للطلب **والعنصر** بعد التأكيدَين · رمز خاطئ مرفوض.
- [x] تقييم 1..5 بعد الاكتمال · خاص بالفريق · لا يظهر في `toPartyRequestView`.
- [x] البلاغ بسبب وتفصيل ≥10 + تدقيق + هوية المبلّغ لا تُعرض لصاحب العنصر.
- [x] `features/dev/DevSoukScreen.tsx` + `app/(dev)/souk.tsx` + رابط من إعدادات المطور.
- [x] 5 مسارات جديدة + Allowlist + نصوص الترجمة.

### النتيجة النهائية
- [x] **252/252 test suites · 1503/1503 tests · lint وtypecheck نظيفان · expo-doctor 20/20 · CI أخضر** (بتقرير المالك 2026-11-26).
- [x] صفر انحدار في P03–P12.2 (1491 اختباراً).
- [x] **الإجمالي التراكمي لـP12: +21 suite · +107 اختبارات.**

### إصلاحات P12
- [x] **P12.1 (مراجعة قبل CI):** حجب التقدير بمقداره لا مع العدد ⇒ بوابة على عدد المساهمين · استيرادان مكرران في `public-view` · **الوصف لا يُفحص ضد الهواتف** ⇒ إعادة استخدام فلتر P10 باستثناء قاعدة الطول · **نافذة نشر قبل المراجعة** ⇒ `status?: SoukStatus` اختياري في العقد/المخطط و`input.status ?? 'available'` في المصنع و`status:'draft'` من الخدمة.
- [x] **P12.1 (CI):** `TS2339` ×2 فكّ تغليف مزدوج في `handover-service` ⇒ `const snapshot = request` · fixture البحث النصي لا يميّز ⇒ عنوان مختلف لـ`i2`.
- [x] **P12.2 (مراجعة قبل CI):** زوجان مكرران في `SoukBrowserScreen` · `GiftEmptyState` يمرّر `illustration` غير الموجود ⇒ الهدية كشقيق مع الحفاظ على testID.
- [x] **P12.2 (Doctor):** انحراف تبعيات خارجي — `expo-doctor` غير مثبّت فنشرت Expo خط 58.1.x بين التشغيلين. **الحل:** تثبيت الأداة + `expo install --fix` + إضافة `expo-sharing` يدوياً إلى `plugins` (CLI لا يكتب تكويناً ديناميكياً). **التزام صيانة منفصل**، و`ci.yml` لم يُمسّ.
- [x] **P12.2 (CI):** اختباران قديمان يثبّتان `/(features)/souk` نصياً ⇒ حُدّثا إلى `/souk`.
- [x] **P12.3 (مراجعة قبل CI):** **الرمز يصل للطرفين** ⇒ تصغير عند حدود الـhook · تسرّب `traole` في `souk.handover.codeHelp` ⇒ صُحّح · ملفا الترجمة أُخرجا ككتل (خرق قاعدة 3) ⇒ دُمجا يدوياً.

---

## التزام الصيانة المنفصل (2026-11-26)

- [x] تثبيت `expo-doctor@1.21.9` في `devDependencies` — حتى لا تتحرك توقعات الأداة تحت المشروع (ADR-0073).
- [x] `npx expo install --fix` لمحاذاة حزم SDK (خرج بـ1 ومعناه «لا أستطيع كتابة تكوين ديناميكي» لا «فشل التثبيت»).
- [x] إضافة `'expo-sharing'` إلى `plugins` في `app.config.ts` يدوياً.
- [x] `npx expo-doctor` ⇒ **20/20** · `npm run typecheck` نظيف.
- [x] دفع `package.json` + `package-lock.json` + `app.config.ts` في التزام **بلا أي ملف ميزة**.
- [x] **لا `continue-on-error`** ولا أي إضعاف لبوابة CI.
- [ ] تحديث `PROJECT_CONTEXT §2` من `package.json` الفعلي (#86).

---

## الدروس المُلزِمة (تراكمية — تُطبَّق في كل مرحلة قادمة)

### تصغير البيانات والخصوصية
- [ ] **صغّر البيانات عند حدود الـhook لا في الواجهة.** أي حقل يصل للعميل قابل للاستخراج حتى لو أخفته الشاشة. النمط: `isDonor ? view : { ...view, secret: null }`.
- [ ] **التأكيد المزدوج يفقد معناه إن رأى الطرفان الرمز** ⇒ يُعرض لطرف ويُدخل من الآخر.
- [ ] كل مسار بلا `RequireAuth` يُسقط إسقاطاً عاماً — والحلقات مع التاريخ.
- [ ] **حجب المبلغ مع العدد لا بمقداره.** ابنِ بوابة على عدد المساهمين ثم أعِد استخدام نفس كائن `StatValue`.
- [ ] لا تُمرّر مبلغاً إلى `suppressSmallNumber` مع حدّ أعداد.

### الاختبارات (RNTL v14 + Query + الساعة)
- [ ] `await render(...)` · `await fireEvent.xxx(...)` · `await view.unmount()` · **`rerender`** بعد متغيّر خارجي.
- [ ] **الساعة المحقونة توافق ساعة التخزين**؛ اشتقّها من البيانات المخزَّنة لا من تاريخ ماضٍ ثابت.
- [ ] **fixture البحث النصي يجب أن يميّز:** عنوان مختلف صراحةً لكل صف.
- [ ] موكات بمعاملات صريحة · موك `Share` يعيد `activityType` · `fireEvent(el,'valueChange',v)` يعمل على `Switch` المخصص.
- [ ] **عند نقل مسار، ابحث عن نصّه الحرفي في كل الاختبارات قبل الدفع.**
- [ ] `invalidateQueries({queryKey:[feature]})` مقيّد · `setQueryData` للجلسة قبل render.

### TypeScript / ESLint / الاستيرادات
- [ ] **لا فكّ تغليف مزدوج:** بعد `if (!found.value) return …` يكون `found.value` هو الكيان.
- [ ] التضييق لا يصمد داخل callback ⇒ `const snapshot = x.value` بعد الحارس.
- [ ] **لا استيراد مكرر من نفس المسار** — راجع كل كتل الملف لا الأولى فقط.
- [ ] مكوّنات الميزة بمسارها النسبي · كل تعليمة استيراد بمسار كامل · كل الاستيرادات أعلى الملف.
- [ ] **فشل حلّ نفس المسار من عدة مستهلكين = ملف غائب/مُسمّى خطأً**.

### صحة وقت التشغيل والنطاق
- [ ] **الآلة قبل الكتابة** في كل خدمة · الخدمة تسلك المسار المعلن ولا تقفز حالتين.
- [ ] لا خطأ مُصنّع (`AppError.*` فقط) · لا `ok:true/value:null` لمورد غائب.
- [ ] **كل زر مدخلاته في نفس الشاشة** · **قبول الطلب إجراء مستخدم** فيجب أن يوجد في مساره لا في المحاكي وحده.
- [ ] `EmptyState` يقبل `icon/title/description/action/testID` — أي رسم تزييني يُرسم كشقيق.
- [ ] الحالة الابتدائية تُمرَّر كمعامل اختياري لا بتغيير افتراض المصنع.

### العملية والتحرير
- [ ] **أخرِج الملف كاملاً دائماً** (قاعدة 3) حتى لو طال — دمج JSON يدوياً عرضة لأخطاء الفواصل.
- [ ] **`locales/*.json` خارج فاحص العربية** ⇒ مراجعة بشرية إلزامية لكل قيمة.
- [ ] **أداة CI غير مثبّتة تحرّك معيارها تحتك** ⇒ ثبّتها؛ ومحاذاة التبعيات **التزام منفصل**.
- [ ] **لا تُضعف بوابة CI لتحصل على الأخضر** — أصلح السبب الجذري.
- [ ] **CI أخضر ≠ سلوك صحيح.** الإصلاحان الجوهريان في P12 لم يكونا ليظهرا في أي بوابة.
- [ ] عند تكرار سطر الحارس في عدة دوال، حدّد **مرساة فريدة**.
- [ ] لا تعديل على عقود المستودعات إلا إضافةً وبموافقة (ADR)؛ ولا مساس بـContract Tests.
- [ ] **لا ادعاء مالي** · **لا شارة من حقل** · **لا سعر في سوق خير**.

---

## مؤجلات P12 (في PROJECT_CONTEXT §8)
- [ ] إشعارات سوق خير ⇒ P16 أو رقعة صغيرة (#84).
- [ ] توجيه الطلب (متبرع/فريق) بمفتاح إعداد ⇒ P13/P17 (#85).
- [ ] احتفاظ دردشة السوق ⇒ مع اعتماد #7 (#78).
- [ ] رمز تسليم رسمي على الخادم ⇒ P18 (#79).
- [ ] تخزين دائم + RLS للطلبات/الدردشة/البلاغات + عرض الصور ⇒ P18 (#81, #82).
- [ ] طابور إشراف حقيقي ⇒ P17 (#74, ADR-0072).
- [ ] تغطية أوسع لمحاكي سوق خير ⇒ P17/P21 (#80).
- [ ] اعتماد قيم سوق خير التشغيلية ⇒ المالك (#83, #14).
- [ ] تحديث §2 من `package.json` بعد الصيانة (#86).
- [ ] تحقق الأجهزة (رفع الصور/EXIF/RTL) ⇒ P20/P21 (#26, #28).
- [ ] تنفيذ #33 · حذف `SignInPlaceholder` (#34) · #58 · #64 · #65 · #66 · #67 · #68 · #71 · #24 · #37.

---

## القرارات البشرية المفتوحة (Blockers)

| # | القرار | يحجب |
|---|--------|------|
| 1 | حدود الاستحقاق ونطاقات الدخل | P15 · اعتماد المحرك |
| 2 | سلّم النطاقات (الأوزان محسومة) | اعتماد المحرك |
| 3 | مدة الاعتراض | P17 |
| 4 | سياسة الانسحاب (30 يوماً مؤقتة) | الاعتماد النهائي |
| 5 | الاستثناء من مساعدة واحدة | P17 |
| 6 | فئة خصومات الشركاء (`beneficiaries` مؤقتة) | الاعتماد النهائي · P15 |
| 7 | مدة الاحتفاظ + الحذف + الدردشة + مستندات الشركاء + **دردشة سوق خير** | P19 / P23 |
| 8 | الحد الأدنى لإخفاء الإحصاءات | P15 / P17 |
| 9 | مراجعة قانونية لنصوص Legal | الإطلاق |
| 10 | سياسة عرض النقاط وموافقة النشر | P15 / P17 |
| 11 | سياسة المزوّد المرخّص | P18 · تبرع حقيقي |
| 12 | إعادة توزيع الحصص المخصصة بعد الانسحاب | إتمام `custom` |
| 13 | مدة إعادة التحقق الدورية للشركاء (365 يوماً مؤقتة) | الاعتماد النهائي |
| 14 | **القيم التشغيلية لسوق خير** (طلبات/صور/مراجعة/انتهاء/معدلات/تقييم) | الاعتماد النهائي |
