# PROJECT_CONTEXT — السياق الدائم لمشروع عازب | AZIB

> هذا الملف يُقرأ في بداية كل مرحلة. يُحدَّث في نهاية كل مرحلة قبل إعلانها Done.
> **عام المستودع:** لا أسرار، لا بيانات شخصية حقيقية.

آخر تحديث: **P09 — Financial Assistance Architecture (مغلقة رسمياً — 2026-11-16).**
CI أخضر بالكامل: **178/178 suites · 1138/1138 tests** · lint وtypecheck نظيفان (بتقرير المالك).

---

## 1) القرارات التقنية

| القرار | القيمة المعتمدة | الحالة | المرجع |
|--------|------------------|--------|--------|
| مدير الحزم | npm | مُعتمد | ADR-0001 |
| إطار العمل | Expo + RN + TypeScript (strict) + Expo Router | مُعتمد | HRD |
| حالة العميل | Zustand (7 stores) | مُعتمد | ADR-0002 |
| حالة الخادم | TanStack Query — استعلام لكل قسم/شاشة | مُعتمد | ADR-0002 |
| النماذج والتحقق | React Hook Form + Zod (`useWatch` إلزامي) | مُعتمد | HRD |
| الترجمة | i18next (`ar`, RTL) + حفظ اللغة | مُعتمد | ADR-0013 |
| الحركة | Reanimated + Gesture Handler | مُعتمد | ADR-0011 |
| الخادم | Supabase خلف Provider Abstraction | مُعتمد (غير مربوط حتى P18) | HRD |
| المصادقة | عقد `AuthProvider` (15 capability) | مُعتمد | ADR-0016 |
| التوكنات | SecureStore · ذاكرة على الويب | مُعتمد | ADR-0017 |
| الموقع الجغرافي | تسلسل مُشتق، مخزَّن في `Profile.city` | مُعتمد | ADR-0019 |
| صورة المستخدم | قص مركزي + رابط في Query cache | مُعتمد | ADR-0020 |
| الحذف والتصدير والقانوني | جدولة + JSON + سجل نسخ | مُعتمد | ADR-0021 |
| واجهات Expo الأصلية | وحدات حدودية | مُعتمد | ADR-0022 |
| تكوين الرئيسية | HomeConfig قابل للتبديل + تخصيص محلي | مُعتمد | ADR-0023 |
| نشر المحتوى الحساس | بوابة موافقة fail-closed + تعقيم | مُعتمد | ADR-0024 |
| الإحصاءات | إخفاء الأعداد والمبالغ + فصل Demo/Real | مُعتمد | ADR-0025/0026 |
| عقد الطلب | 13 حالة + `update`/`submit` | مُعتمد | ADR-0027 |
| محرك الأهلية | دالة نقية + قواعد بنسخ + نقاط مخفية | مُعتمد | ADR-0028 |
| مسار المساعدات | مجموعة `app/assistance/` | مُعتمد | ADR-0029 |
| المسودة | حالة عميل ببصمات لا معرّفات | مُعتمد | ADR-0030 |
| المستندات | وحدة حدودية + بصمة وصفية + PDF بلا معالجة | مُعتمد | ADR-0031 |
| المراجعة | محاكي `(dev)` + خط زمني + كتالوج أسباب | مُعتمد | ADR-0032 |
| **عقدا التمويل** | **تمديد إضافي + `advance` (سلامة AppendOnly)** | **مُعتمد** | **ADR-0033** |
| **الفصل الرباعي** | **Intent / Provider / Verified / Disbursement + إيصال مشتق** | **مُعتمد** | **ADR-0034** |
| **مزوّد Demo Payment** | **`providers/mock/` + لا تأكيد مُختَرع** | **مُعتمد** | **ADR-0035** |
| **أنواع البرامج** | **`Program.kind?` + كتالوج 5 + قرض حسن إحالة فقط** | **مُعتمد** | **ADR-0036** |
| **Idempotency** | **مفتاح حتمي مشتق من المدخلات** | **مُعتمد** | **ADR-0037** |
| **الضبط المزدوج للصرف** | **Maker≠Checker + حد تراكمي + إثبات + تأكيد المستفيد** | **مُعتمد** | **ADR-0038** |
| **تقرير الأثر** | **real+verified فقط + حجب الأعداد والمبالغ** | **مُعتمد** | **ADR-0039** |
| نموذج الأموال | Non-Custodial | مُعتمد | ADR-0005 |
| تقييم الأهلية | Advisory فقط + مراجعة بشرية | مُعتمد | ADR-0006 |
| أسلوب 3D | ثلاث طبقات | مُعتمد | ADR-0003 |
| الاختبارات | Jest + RNTL v14 (async) · Playwright · pgTAP | مُعتمد | ADR-0004 |
| CI | GitHub Actions + فاحص الأزرار الميتة | مُعتمد | ADR-0015 |
| الروابط العميقة | `azib://` بقائمة سماح + بادلات | مُعتمد | ADR-0014 |

---

## 2) إصدارات الأدوات

> المصدر `package.json` + تقارير المالك. **لا قيم TBD.** لا تبعيات جديدة بعد P09.

| الأداة | الإصدار | مصدر التحقق | تاريخ |
|--------|---------|--------------|-------|
| Node.js | v26.13.0 | `node -v` (بتقرير المالك) | 2026-11-08 |
| npm | 12.2.1 | `npm -v` (بتقرير المالك) | 2026-11-08 |
| Expo SDK | ~58.0.26 | `package.json` | 2026-11-16 |
| React Native | 0.88.1 | `package.json` | 2026-11-08 |
| React / React DOM | 19.3.0 | `package.json` | 2026-11-08 |
| expo-router | ~58.0.32 | `package.json` | 2026-11-16 |
| expo-constants | ~58.0.15 | `package.json` | 2026-11-08 |
| expo-linking | ~58.0.17 | `package.json` | 2026-11-16 |
| expo-status-bar | ~58.0.5 | `package.json` | 2026-11-16 |
| expo-font | ~58.0.12 | `package.json` | 2026-11-16 |
| expo-blur | ~58.0.6 | `package.json` | 2026-11-16 |
| expo-haptics | ~58.0.8 | `package.json` | 2026-11-16 |
| expo-localization | ~58.0.5 | `package.json` | 2026-11-16 |
| expo-splash-screen | ~58.0.14 | `package.json` | 2026-11-16 |
| expo-secure-store | ~58.0.3 | `package.json` | 2026-11-16 |
| expo-local-authentication | ~58.0.3 | `package.json` | 2026-11-16 |
| expo-image-picker | ~58.0.10 | `package.json` | 2026-11-16 |
| expo-image-manipulator | ~58.0.16 | `package.json` (`manipulateAsync`) | 2026-11-16 |
| expo-file-system | ~58.0.13 | `package.json` (`File`/`Paths`) | 2026-11-16 |
| expo-sharing | ~58.0.23 | `package.json` | 2026-11-16 |
| expo-crypto | ~58.0.8 | بتقرير المالك عند تثبيت P08 | 2026-11-16 |
| expo-document-picker | ~58.0.5 | بتقرير المالك عند تثبيت P08 | 2026-11-16 |
| @react-native-community/netinfo | 12.0.1 | `package.json` | 2026-11-16 |
| @tanstack/react-query | ^5.107.1 | `package.json` | 2026-11-16 |
| react-hook-form | ^7.92.0 | `package.json` | 2026-11-16 |
| @hookform/resolvers | ^7.0.6 | `package.json` | 2026-11-16 |
| zod | ^3.23.8 | بتقرير المالك — **غير مُعلن في `package.json`** (§8 #37) | 2026-11-16 |
| react-native-reanimated | 4.7.1 | `package.json` | 2026-11-08 |
| react-native-gesture-handler | ~3.3.0 | `package.json` | 2026-11-08 |
| react-native-safe-area-context | ~5.11.1 | `package.json` | 2026-11-08 |
| react-native-screens | ~4.30.1 | `package.json` | 2026-11-08 |
| react-native-web | ~0.21.4 | `package.json` | 2026-11-08 |
| react-native-worklets | 0.13.0 | `package.json` | 2026-11-08 |
| react-native-svg | 15.16.0 | `package.json` | 2026-11-16 |
| @react-native-async-storage/async-storage | 2.2.0 | `package.json` | 2026-11-16 |
| zustand | ^5.1.0 | `package.json` | 2026-11-16 |
| i18next | ^27.1.0 | `package.json` | 2026-11-16 |
| react-i18next | ^18.0.1 | `package.json` | 2026-11-16 |
| lucide-react-native | ^1.72.0 | `package.json` | 2026-11-16 |
| @expo-google-fonts/cairo | ^0.4.2 | `package.json` | 2026-11-16 |
| @expo-google-fonts/ibm-plex-sans-arabic | ^0.4.2 | `package.json` | 2026-11-16 |
| TypeScript | ~6.0.3 | `package.json` | 2026-11-08 |
| @types/react | ~19.3.0 | `package.json` | 2026-11-08 |
| ESLint | ^9.0.0 | `package.json` (ADR-0007) | 2026-11-09 |
| eslint-config-expo | ^58.0.4 | `package.json` | 2026-11-09 |
| eslint-import-resolver-typescript | ^4.4.5 | `package.json` | 2026-11-09 |
| eslint-plugin-import | ^2.32.0 | `package.json` | 2026-11-09 |
| Jest | ^30.5.2 | `package.json` | 2026-11-09 |
| jest-expo | ~58.0.15 | `package.json` | 2026-11-16 |
| @types/jest | ^30.0.0 | `package.json` | 2026-11-09 |
| @types/node | ^26.6.6 | `package.json` | 2026-11-09 |
| @testing-library/react-native | ^14.1.0 | `package.json` — **واجهات async** | 2026-11-16 |
| react-test-renderer | ^19.3.0 | `package.json` | 2026-11-16 |
| prettier | ^3.10.0 | `package.json` | 2026-11-16 |

---

## 3) بنية المجلدات (الفعلية بعد P09)

```
azib-mobile/
├─ app/                          # Routes ONLY — بلا منطق أعمال
│  ├─ _layout · index(Gate) · +not-found · maintenance
│  ├─ (onboarding)/ · (auth)/ 6 · (tabs)/ 5 · (features)/ 8 · (staff)/
│  ├─ (dev)/ index · integrations · auth · assistance · finance · gallery
│  ├─ profile/ index · edit
│  ├─ settings/ 13 شاشة
│  ├─ legal/ [doc]
│  ├─ assistance/ index · conditions · pre-check · new · mine · [id]/4
│  └─ programs/                  # جديد في P09
│     ├─ index · [id] · kind/[kind] · donate/[id]
│     ├─ donations · receipts · disbursements · impact
│     └─ provider-requirements
├─ src/
│  ├─ components/{ui,brand,shell}/
│  ├─ features/
│  │  ├─ shell/ · onboarding/ · auth/ · profile/ · settings/ · legal/ · home/
│  │  ├─ assistance/  # engine · state-machine · schemas · services · hooks ·
│  │  │               # components · wizard · screens · config
│  │  ├─ finance/     # جديد في P09
│  │  │  ├─ state-machines/   # donation · disbursement · guards
│  │  │  ├─ services/         # donation-intent · disbursement · receipt ·
│  │  │  │                    # impact · finance-audit · idempotency
│  │  │  ├─ catalog/          # program-kinds
│  │  │  ├─ hooks/            # program-catalog · donation-intent · donor ·
│  │  │  │                    # beneficiary-disbursements · disbursement-actions · impact
│  │  │  ├─ components/       # CertaintyBadge · DisbursementStatusBadge ·
│  │  │  │                    # DisbursementCard · AmountField · FinanceScaffold
│  │  │  └─ screens/          # 9 شاشات
│  │  └─ dev/         # DevSettings · Integrations · DevAuth · DevAssistance ·
│  │                  # DevFinance · demo-seed
│  ├─ stores/         # 7 stores (app-mode · onboarding · shell · language ·
│  │                  # auth · settings · assistance-draft)
│  ├─ constants/routes.ts · locales/{ar,en}/ (15 ns)
│  ├─ schemas/        # + application-payload · finance extensions
│  └─ hooks/ theme/ core/ config/ providers/ repositories/ i18n/
├─ mocks/seed/        # + locations.ts · assistance.ts (مستقلان)
├─ scripts/ · tests/__tests__/scripts/
└─ docs/              # + INTEGRATIONS · ELIGIBILITY_ENGINE · FINANCE_ARCHITECTURE
```

**قواعد ثابتة:** Routes in `app/` only · Features in `src/features/` · **`__tests__` دائماً** · واجهات Expo في وحدات حدودية · تطابق صيغة مفاتيح i18n · **كل Hook قبل أي `return` مبكر** · **`rerender` بعد تحديث متغيّر خارجي في الاختبارات**.

---

## 4) الوظائف المكتملة

| # | الوظيفة | المرحلة | ملاحظات |
|---|---------|---------|---------|
| 1–11 | الحوكمة · Expo SDK 58 · Core Platform · 12 Providers · 16 Repos · i18n · Seed | P01–P03 | بلا تغيير عقود. |
| 12–19 | Theme + 42 مكوّناً + Gallery + `DESIGN_SYSTEM.md` | P04 | 565 اختباراً. |
| 20–29 | المسارات · Gate · Dock · Hosts · Banners · ErrorBoundary · Deep Links · Splash · Onboarding · Dev + فاحص الأزرار | P05 | ADR-0012…0015. |
| 30–37 | عقد Auth (5 دوال) · Mock كامل · State Machine · TokenVault · 6 شاشات · OTP · الضيف · الأدوار | P06.1 | ADR-0016…0018. |
| 38–44 | الملف الشخصي · التسلسل الجغرافي · الصورة · Avatar `uri` · Module 20 · الموافقات · الخروج بتأكيد | P06.2 | ADR-0019/0020. |
| 45–52 | عقد Auth (→15) · تغيير كلمة المرور · الجلسات · البيومتري · الحذف · التصدير · Legal · `INTEGRATIONS.md` | P06.3 | ADR-0021/0022. |
| 53–60 | HomeConfig · مصدر قابل للتبديل · useHomeConfig · useHomeSection · Header · Hero · QuickActions · SectionShell/Boundary/Lazy/Stagger | P07.1 | ADR-0023. |
| 61–64 | 4 أقسام · كتل الأدوار · التخصيص · Pull-to-Refresh · أداة تعبئة Demo | P07.1 | — |
| 65–68 | بوابة الموافقة · التعقيم · إخفاء الأعداد والمبالغ · فصل Demo/Real · 4 أقسام حساسة · تسجيل الأقسام الثمانية | P07.2 | ADR-0024…0026. |
| 69–76 | عقد Application (13 حالة) · payload schema · القواعد · البوابات/الأعلام/النطاقات · المحرك النقي · آلة الحالات · الخدمات · seed مستقل | P08.1 | ADR-0027/0028. |
| 77–82 | document-pipeline · مسودة · Wizard 8 خطوات · submission-service · نقل المسار · 3 شاشات | P08.2 | ADR-0029…0031. |
| 83–88 | طلباتي · التفاصيل/الخط الزمني · الاستكمال · القرار · الاعتراض · محاكي المراجعة · ربط قسم الدعم | P08.3 | ADR-0032. |
| 89 | **تمديد عقدي التمويل إضافةً**: 8 حالات لكل منهما + حقول اختيارية + `advance` | P09.1 | ADR-0033؛ `append-only.contract` لم يُمسّ. |
| 90 | **مخططات التمويل**: مبالغ أعداد صحيحة + حقول النية/الإيصال/Maker/Checker/الإثبات | P09.1 | — |
| 91 | **آلتا حالة نقيتان**: 6+6 حالات · 6+6 انتقالات · فحص الفاعل · legacy mapping | P09.1 | كل غير صالح مرفوض استقصائياً. |
| 92 | **الحراس النقية**: Maker≠Checker · إثبات · حد تراكمي · حالة الطلب · `committedTotal` | P09.1 | ADR-0038. |
| 93 | **Demo Payment Provider** في `providers/mock/` + `verifyExternalPayment` صادق | P09.1 | ADR-0035؛ لا دالة محرّمة. |
| 94 | **Idempotency حتمية** + منع التكرار في المزوّد | P09.1 | ADR-0037. |
| 95 | **`receipt-service`**: إيصال مشتق بعد `verified` فقط + رقم موسوم | P09.1 | ADR-0034. |
| 96 | **`impact-service`**: real+verified فقط + حجب الأعداد والمبالغ + تعريف كل رقم | P09.1 | ADR-0039. |
| 97 | **`finance-audit`**: Append-only بميتاداتا محدودة (بلا مبالغ/هويات) | P09.1 | — |
| 98 | **`donation-intent-service`**: إنشاء/إلغاء/تسليم/محاكاة/تحقق | P09.1 | حدّ كتابة العميل مفروض. |
| 99 | **`disbursement-service`**: اقتراح/قرار/تسجيل دفع/رد مستفيد | P09.1 | ملكية المستفيد مفروضة. |
| 100 | **كتالوج أنواع البرامج (5)** + `Program.kind?` اختيارية | P09.2 | ADR-0036؛ قرض حسن إحالة فقط. |
| 101 | **شاشات الكتالوج/التفاصيل/النوع** + متطلبات الجهة المرخّصة | P09.2 | Not Connected صادق. |
| 102 | **تدفق نية التبرع** + `CertaintyBadge` + `AmountField` + `FinanceScaffold` | P09.2 | يقين بأيقونة+نص+لون. |
| 103 | **تبرعاتي + الإيصالات** | P09.2 | لا إيصال قبل التحقق. |
| 104 | **سجل صرف المستفيد + تأكيد/اعتراض** | P09.3 | الملكية + سبب الاعتراض إلزامي. |
| 105 | **تقرير الأثر** | P09.3 | فارغ صادق في Demo. |
| 106 | **محاكي Maker/Checker** في `(dev)/finance` | P09.3 | حقول قابلة للتعديل لاختبار الفصل. |
| 107 | **مسارات `app/programs/**`** + Allowlist + مداخل الحساب/الكتالوج/المطور | P09.2/3 | — |

> لا شيء آخر مكتمل. أي جدول آخر يبقى فارغاً حتى المرحلة المعنية.

---

## 5) غير المكتملة

- **P10 (Group Weddings)** حتى **P24**. P10 **محجوبة** بقرار بشري (`PRODUCT_POLICIES #4` سياسة الانسحاب).
- شاشات الميزات المتبقية Placeholders صادقة: عرسنا واحد P10، الشركاء P11، سوق خير P12، وظائف/متطوعون P13، الحاسبة/الدليل P14، توعية P15، الإشعارات/البحث P16، لوحة الفريق P17.
- **لا تبرع حقيقي ولا إيصال رسمي** قبل ربط جهة مرخّصة + Webhook خادمي (P18).
- **تقرير الأثر فارغ دائماً في Demo** — سلوك مقصود (لا بيانات real).
- **إحصاءات الرئيسية** ما زالت تقرأ `confirmed` القديمة ⇒ تحتاج توحيداً مع `verified`.
- P18 يستبدل mocks بـSupabase + انتقال ذرّي + تنفيذ الحذف والصرف الرسمي.

---

## 6) الخدمات المتصلة

> **لا شيء متصل.** لا مشروع Supabase، **لا مزوّد دفع مرخّص**، لا تخزين سحابي، لا بريد، لا Push.
> وضع `backend` يعرض **Not Connected** بصدق، وشاشة متطلبات الجهة المرخّصة تسرد ما ينقص.
> عند ربط أي خدمة يُضاف صف: الخدمة، ما يتصل بها، البيئة، طريقة التحقق، التاريخ، **من تحقق**.

---

## 7) الخدمات التجريبية

| الخدمة | الحالة | الوسم في الواجهة |
|--------|--------|------------------|
| MockAuthProvider (15 capability) | يعمل عبر نفس عقد الإنتاج | DemoBanner + Badge |
| 12 Mock Providers + 16 Mock Repos | تعمل في وضع demo | Registry يعرض `mock` |
| OTP تجريبي | رمز حتمي معروض بوسم Demo | `auth:verify.demoCode` |
| جلسات/أجهزة | سجلات محلية `demo-device-N` | `auth:devices.demoNote` |
| صورة Avatar | رفع إلى MockStorage (ذاكرة) | `profile:avatar.sessionNote` |
| أداة تعبئة الرئيسية | تنشر وتربط عبر العقود، يدوياً | `home:dev.*` |
| إحصاءات الرئيسية | دلو demo فقط، محجوب دون الحد | `home:sections.community-stats.demoOnly` |
| طلب مساعدة تجريبي | تدفق كامل عبر نفس العقود | شارة Demo |
| الرقم المرجعي للطلب | `AZIB-DEMO-YYYY-NNNNN` | `assistance:reference.demoNote` |
| بصمة المستند | وصفية تجريبية | `assistance:wizard.documents.fingerprintNote` |
| محاكي مراجعة الطلبات | `(dev)` فقط | شارة Demo |
| **Demo Payment Provider** | دورة حياة النية بلا حركة أموال | شارة Demo + «نية غير مؤكدة» |
| **نية تبرع تجريبية** | لا تُحتسب مستلماً ولا تدخل الأثر | `CertaintyBadge` |
| **إيصال تجريبي** | بعد `verified` فقط، غير رسمي | `assistance:finance.receipts.demoNote` |
| **صرف تجريبي** | Maker/Checker عبر نفس الخدمة | شارة Demo على كل عملية |
| **محاكي Maker/Checker** | `(dev)/finance` فقط | شارة Demo + ملاحظة النطاق |
| عدّاد شارة الإشعارات | محلي (0 افتراضاً) | المصدر الحقيقي P16 |
| شجرة locations | بيانات demo | `profile:locations.pending` |

**الشرطان محققان:** وسم واضح + المرور عبر نفس `Provider`/`Repository` المستخدم في الإنتاج.

---

## 8) المشكلات المعروفة

| # | المشكلة | التأثير | الحالة | ملاحظات |
|---|---------|---------|--------|---------|
| 1 | حدود الاستحقاق ونطاقات الدخل غير معتمدة نهائياً | عتبات مؤقتة | Open | قيم P08 موسومة. |
| 2 | أوزان التقييم | — | **Closed (P08)** | HRD حدّدها. |
| 3 | مدة الاعتراض | 14 يوماً مؤقتة | Open | قرار بشري. |
| 4 | **سياسة الانسحاب من العرس** | **تحجب P10** | Open | قرار بشري مطلوب قبل البدء. |
| 5 | استثناء «مساعدة واحدة» | مغلق مؤقتاً | Open | قرار بشري. |
| 6 | فئة خصومات الشركاء | تحجب P11 | Open | قرار بشري. |
| 7 | مدة الاحتفاظ + فترة تأكيد الحذف | تحجب P19/P23؛ 30 يوماً مؤقتة | Open | تشمل السجلات المالية. |
| 8 | الحد الأدنى لإخفاء الإحصاءات | 10 مؤقت (P07+P09) | Open | يحجب P15/P17. |
| 9 | `forceRTL` عند تبديل اللغة | — | **Closed (P05)** | ADR-0013. |
| 10 | أيقونات أصول التطبيق من قالب Expo | لا تعكس الهوية | Open | P22/P23. |
| 11 | لا تحقق آلي من وجود ملفات الحوكمة | يدوي | Open | `AGENT_RULES §6`. |
| 12 | ESLint مثبّت على 9.x | لا ميزات 10 | Accepted | ADR-0007. |
| 13 | `i18n-allow-arabic` في اختبار قديم | مقبول | Accepted | تنظيف P21. |
| 14 | `populateDemoSeed` لا يغطي content/notifications/search | لا محتوى/إشعارات demo | Open | أداة P07 تلتفّ بالنشر. |
| 15 | backend mode يستخدم mocks للـ16 repo | بيانات demo في backend | Accepted | يُصحَّح P18. |
| 16 | `RingProgress` بلا animation | تجربة أقل نعومة | Accepted | لم يُنفَّذ في P05–P09. |
| 17 | `BottomSheet` single-snap | لا نقاط متعددة | Accepted | P20 إن لزم. |
| 18 | `Tabs` غير scrollable | ≤5 تبويبات | Accepted | P07 استخدم FlatList أفقياً. |
| 19 | اختبارات Reanimated mock ثابت | الحركة لا تُختبر آلياً | Accepted | ADR-0011. |
| 20 | شارة الإشعارات بلا مصدر حقيقي | عدّاد محلي | Open | P16. |
| 21 | شاشة Maintenance ثابتة | لا علم عن بُعد | Open | P18+. |
| 22 | الاتجاه الأصلي يكتمل بعد إعادة الفتح | لا مكتبة restart | Accepted | ملاحظة صادقة. |
| 23 | فاحص الأزرار regex-based | لا يغطي كل الأنماط | Accepted | ADR-0015. |
| 24 | الفاحص غير مضمّن في سكربت `lint` | خطوة CI مستقلة فقط | Open | يلزم `package.json` كامل. |
| 25 | أنماط اختبار React 19 / RNTL v14 | أخطاء متكررة إن تُجاهلت | Accepted | دروس ملزمة. |
| 26 | **لم يُجرَ تحقق على الأجهزة (P05–P09)** | حركة/Blur/بصمة/EXIF/Carousel/رفع/تدفق مالي | Open | بقرار المالك؛ P20/P21. |
| 27 | رابط صورة Avatar غير دائم | يضيع بإعادة التشغيل | Open | P18. |
| 28 | إزالة EXIF غير متحققة على جهاز | ادعاء خصوصية غير مُثبت | Open | P20. |
| 29 | شجرة locations تجريبية | ليست مرجعاً رسمياً | Open | `pending-human-review`. |
| 30 | الحذف مجدول لا منفَّذ | لا مسح فعلي | Open | P18 + قرار بشري. |
| 31 | الجلسات تسميات محلية | لا إنهاء عن بُعد | Open | P18. |
| 32 | نصوص Legal قوالب مؤقتة | **تحجب الإطلاق** | Open | مراجعة قانونية. |
| 33 | **صفّا الأمان والحذف معطّلان في فهرس الإعدادات** | لا مدخل من الواجهة | **قرار معتمد — تنفيذ معلّق** | الخيار (أ) معتمد؛ لم يُنفَّذ. |
| 34 | `SignInPlaceholder.tsx` مُبقى بلا استخدام | كود ميت مؤقت | Open | يُحذف مع اختباره. |
| 35 | سحب الموافقات الأساسية = حذف الحساب | محجوب بـ#33 | Open | يُحل مع #33. |
| 36 | لا استعادة جلسة عند الإقلاع | يُعاد الدخول كل مرة | Open | P18. |
| 37 | `zod` غير مُعلن في `package.json` | اعتماد على hoisting | Open | يُعلن عند أول تعديل للحزم. |
| 38 | مصدر HomeConfig ما زال Mock | لا مزامنة عبر الأجهزة | Open | ADR-0023. |
| 39 | لا حقول موافقة نشر في العقود | — | **Closed (P08)** | `publicationConsent` + ربط القسم. |
| 40 | `Donation`/`Disbursement` AppendOnly بلا انتقال | — | **Closed (P09)** | `advance` أُضيف؛ عقد AppendOnly لم يُمسّ. |
| 41 | `ContentRepository` ReadOnly | مستودع القصص فارغ | Open | P15/P18. |
| 42 | لا ربط حساب↔شريك | ملخص الشريك بلا أرقام | Open | P11. |
| 43 | المتطوعون تسجيلات لا مهام | قسم المتطوع محدود | Open | P13. |
| 44 | مبالغ البرامج غير معروضة في المبادرات | معلومات ناقصة | Open | حتى اعتماد #1. |
| 45 | Carousel RTL + fallback الكسل | سلوك غير متحقق | Open | أجهزة + P20/P21. |
| 46 | انحراف صيغة مفاتيح i18n | كسر اختبارين في P07.2 | Accepted | درس مُلزِم. |
| 47 | `DESIGN_SYSTEM.md` أسطر قديمة | — | **Closed (P07)** | صُحّح في رد منفصل. |
| 48 | فئة الحاجة غير مجموعة في payload | بطاقة الدعم بتسمية عامة | Open | P15/P18. |
| 49 | `AuditRepository` بلا فلتر `target` | الخط الزمني client-side | Open | P18. |
| 50 | **انتقالات سير العمل غير ذرّية** | فشل جزئي يفصل الحالة عن البيانات | Open | يشمل الطلب والصرف؛ P18. |
| 51 | بصمة المستند وصفية | إعادة التسمية تُفلت | Open | محتوى + HMAC في P18. |
| 52 | PDF بلا معالجة | بيانات وصفية قد تبقى | Accepted | معلن بصدق. |
| 53 | الرقم المرجعي من المزوّد التجريبي | ليس رسمياً | Open | P18. |
| 54 | الاستكمال يعدّل 4 أرقام + مستندات + ملاحظة | تحرير محدود | Open | P17/P18. |
| 55 | محاكي مراجعة الطلبات بديل مؤقت | لا صلاحيات فعلية | Open | P17 + RLS P18. |
| 56 | `Date.now()` في نافذة الاعتراض | يحتاج `eslint-disable purity` | Accepted | نمط موثّق. |
| 57 | **لا مزوّد دفع مرخّص ولا Webhook** | **`verified` غير قابل للوصول في وضع الخادم** | Open | شاشة المتطلبات صادقة؛ P18. |
| 58 | **إحصاءات الرئيسية تقرأ `confirmed` القديمة** | لا تتحدّث مع `verified` الجديد | Open | توحيد في P15/P18. |
| 59 | **محاكي Maker/Checker بديل مؤقت** | لا فصل مراجعين بصلاحيات | Open | P17. |
| 60 | **`Program.kind` غائب في الـseed** | كل البرامج تُصنّف `grant` افتراضاً | Open | تصنيف حقيقي في P18. |
| 61 | **القرض الحسن بلا جهة إحالة مربوطة** | معلومات فقط، لا إحالة فعلية | Open | يعتمد على #11. |
| 62 | **تقرير الأثر فارغ في Demo** | لا أرقام للمستخدم | **Accepted** | مقصود (ADR-0039)؛ ليس عطلاً. |
| 63 | **الإيصال تجريبي غير رسمي** | لا يصلح مستنداً مالياً | Open | رقم رسمي في P18. |

---

## 9) الخطوة التالية

**P10 — Group Weddings.** **محجوبة** حتى اعتماد `PRODUCT_POLICIES #4` (سياسة الانسحاب من العرس الجماعي).

**نطاق P10 المتوقع بعد رفع الحجب:** كتالوج الأعراس الجماعية · التسجيل والشروط · السعة والمقاعد · حالة التسجيل · الانسحاب ضمن النافذة المعتمدة · ربط الدعم المرتبط بالطلب · لا تحصيل رسوم (Non-Custodial).

**قبل بدء P10 مطلوب من المالك:**
1. **رفع الحجب:** اعتماد سياسة الانسحاب (نافذة، تبعات، مصير الدعم المرتبط، ما بعد الموعد).
2. **إشارة البدء** — لم تبدأ P10.
3. تنفيذ **#33** (تفعيل صفّي الأمان والحذف + تحديث الاختبار).
4. `package.json` الكامل (لضم الفاحص لـ`lint` وإعلان `zod`).
5. `src/features/shell/__tests__/SignInPlaceholder.test.tsx` لحذف الكود الميت (#34).
6. قرار بشأن **#58** (توحيد إحصاءات الرئيسية مع `verified`) — الآن أو في P15.

**عند بدء P10 سيُطلب بالاسم:** `src/schemas/wedding.ts` · `src/locales/{ar,en}/weddings.json` · `src/components/ui/form/DatePicker.tsx` · `src/components/ui/Tabs.tsx` · `src/features/assistance/hooks/use-assistance-applications.ts` (للربط) · `docs/GLOSSARY.md` (مصطلحات العرس).
