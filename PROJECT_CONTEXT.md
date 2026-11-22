# PROJECT_CONTEXT — السياق الدائم لمشروع عازب | AZIB

> هذا الملف يُقرأ في بداية كل مرحلة. يُحدَّث في نهاية كل مرحلة قبل إعلانها Done.
> **عام المستودع:** لا أسرار، لا بيانات شخصية حقيقية.

آخر تحديث: **P08 — Assistance & Eligibility Engine (مغلقة رسمياً — 2026-11-16).**
CI أخضر بالكامل: **155/155 suites · 1020/1020 tests** · lint وtypecheck نظيفان (بتقرير المالك).

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
| **عقد الطلب** | **13 حالة + حقول اختيارية + `update`/`submit`** | **مُعتمد** | **ADR-0027** |
| **محرك الأهلية** | **دالة نقية + قواعد مُصدَّرة بنسخ + نقاط مخفية** | **مُعتمد** | **ADR-0028** |
| **مسار المساعدات** | **مجموعة `app/assistance/` مستقلة** | **مُعتمد** | **ADR-0029** |
| **المسودة** | **حالة عميل محفوظة ببصمات لا معرّفات** | **مُعتمد** | **ADR-0030** |
| **المستندات** | **وحدة حدودية + بصمة وصفية + PDF بلا معالجة** | **مُعتمد** | **ADR-0031** |
| **المراجعة** | **محاكي `(dev)` + خط زمني من التدقيق + كتالوج أسباب** | **مُعتمد** | **ADR-0032** |
| نموذج الأموال | Non-Custodial | مُعتمد | ADR-0005 |
| تقييم الأهلية | Advisory فقط + مراجعة بشرية | مُعتمد | ADR-0006 |
| أسلوب 3D | ثلاث طبقات | مُعتمد | ADR-0003 |
| الاختبارات | Jest + RNTL v14 (async) · Playwright · pgTAP | مُعتمد | ADR-0004 |
| CI | GitHub Actions + فاحص الأزرار الميتة | مُعتمد | ADR-0015 |
| الروابط العميقة | `azib://` بقائمة سماح + بادلات | مُعتمد | ADR-0014 |

---

## 2) إصدارات الأدوات

> المصدر `package.json` + تقارير المالك. **لا قيم TBD.** لا تبعيات جديدة بعد P08.

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
| expo-image-manipulator | ~58.0.16 | `package.json` (الواجهة الكلاسيكية `manipulateAsync`) | 2026-11-16 |
| expo-file-system | ~58.0.13 | `package.json` (الواجهة الصنفية `File`/`Paths`) | 2026-11-16 |
| expo-sharing | ~58.0.23 | `package.json` | 2026-11-16 |
| **expo-crypto** | **~58.0.8** | بتقرير المالك عند تثبيت P08 | 2026-11-16 |
| **expo-document-picker** | **~58.0.5** | بتقرير المالك عند تثبيت P08 | 2026-11-16 |
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

**حاشية `expo-file-system`:** تقرير P06.2 ذكر `58.0.14` بعد `--fix`، والملف المرسل يُظهر `~58.0.13`. **الملف هو المصدر المعتمد** وdoctor أخضر في CI.

---

## 3) بنية المجلدات (الفعلية بعد P08)

```
azib-mobile/
├─ app/                          # Routes ONLY — بلا منطق أعمال
│  ├─ _layout · index(Gate) · +not-found · maintenance
│  ├─ (onboarding)/ · (auth)/ 6 · (tabs)/ 5 · (features)/ 8 · (staff)/
│  ├─ (dev)/ index · integrations · auth · assistance · gallery
│  ├─ profile/ index · edit
│  ├─ settings/ 13 شاشة
│  ├─ legal/ [doc]
│  └─ assistance/                # جديد في P08 (ADR-0029)
│     ├─ _layout · index · conditions · pre-check · new · mine
│     └─ [id]/ index · info-request · decision · appeal
├─ src/
│  ├─ components/{ui,brand,shell}/
│  ├─ features/
│  │  ├─ shell/ · onboarding/ · auth/ · profile/ · settings/ · legal/ · home/
│  │  ├─ assistance/             # جديد في P08
│  │  │  ├─ engine/              # rules.types · rules.v1 · rules-source ·
│  │  │  │                       # gates · flags · bands · score-application
│  │  │  ├─ state-machine/       # workflow (11 حالة · 18 انتقالاً)
│  │  │  ├─ schemas/             # wizard (7 خطوات) · appeal
│  │  │  ├─ services/            # hash · dedup · audit-trail ·
│  │  │  │                       # workflow · document-pipeline · submission
│  │  │  ├─ hooks/               # rules/programs · document-upload ·
│  │  │  │                       # submit · applications · actions
│  │  │  ├─ components/          # NumericField · WizardProgress ·
│  │  │  │                       # WizardStepShell · DocumentUploader · StatusTimeline
│  │  │  ├─ wizard/              # AssistanceWizard + 6 steps + step-config
│  │  │  ├─ screens/             # 8 شاشات
│  │  │  └─ config/              # reason-catalog
│  │  └─ dev/                    # DevSettings · Integrations · DevAuth ·
│  │                             # DevAssistance · demo-seed
│  ├─ stores/                    # app-mode · onboarding · shell · language ·
│  │                             # auth · settings · assistance-draft
│  ├─ constants/routes.ts · locales/{ar,en}/ (15 ns)
│  ├─ schemas/                   # + application-payload
│  └─ hooks/ theme/ core/ config/ providers/ repositories/ i18n/
├─ mocks/seed/                   # + locations.ts · assistance.ts (مستقلان)
├─ scripts/ · tests/__tests__/scripts/
└─ docs/                         # + INTEGRATIONS.md · ELIGIBILITY_ENGINE.md
```

**قواعد ثابتة:** Routes in `app/` only · Features in `src/features/` · **`__tests__` دائماً** · واجهات Expo في وحدات حدودية · تطابق صيغة مفاتيح i18n · **كل Hook قبل أي `return` مبكر**.

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
| 61–64 | 4 أقسام (أعراس/عروض/سوق/وظائف) · كتل الأدوار · التخصيص · Pull-to-Refresh · أداة تعبئة Demo | P07.1 | — |
| 65–68 | بوابة الموافقة · التعقيم · إخفاء الأعداد والمبالغ · فصل Demo/Real · 4 أقسام حساسة · تسجيل الأقسام الثمانية | P07.2 | ADR-0024…0026. |
| 69 | **توسيع عقد Application**: 13 حالة (legacy محفوظ) + حقول اختيارية + `update` + `submit` | P08.1 | ADR-0027؛ صفر كسر لعقد P03. |
| 70 | **`application-payload` schema**: 7 مجموعات + سجلات التقييم/الاستكمال/القرار/الاعتراض/موافقة النشر | P08.1 | أعداد صحيحة بالريال. |
| 71 | **القواعد**: `rules.types` + `rules.v1` + `RulesSource` قابل للتبديل | P08.1 | ADR-0028. |
| 72 | **البوابات الأربع** + **الأعلام الخمسة** + **النطاقات الأربعة** | P08.1 | فشل بوابة ⇒ لا نقاط ولا قرار. |
| 73 | **`scoreApplication` نقية**: 6 مكوّنات، مجموع 100، `advisory:true`، `ruleVersion` | P08.1 | ثروة الأقارب والميراث مستبعدة. |
| 74 | **آلة الحالات**: 11 حالة · 18 انتقالاً · فحص الفاعل · legacy mapping | P08.1 | كل غير صالح مرفوض. |
| 75 | **الخدمات**: `hash` (SHA-256) · `DedupService` · `audit-trail` · `workflow-service` | P08.1 | الآلة تُفرَض في الخدمة. |
| 76 | **`mocks/seed/assistance.ts`** مستقل | P08.1 | لا يمسّ `SeedBundle` ولا اختباره. |
| 77 | **`document-pipeline`**: صور/PDF + حدود من القواعد + إعادة ترميز + فشل ⇒ لا رفع | P08.2 | ADR-0031. |
| 78 | **`assistance-draft.store`**: حفظ تلقائي + تعافٍ + **بصمات لا معرّفات خام** | P08.2 | ADR-0030. |
| 79 | **Wizard ثماني خطوات** + WizardProgress + DocumentUploader + NumericField | P08.2 | Zod لكل خطوة. |
| 80 | **`submission-service`**: dedup → score → create → attach → submit + audit | P08.2 | رقم مرجعي من المزوّد. |
| 81 | **نقل المسار** إلى `app/assistance/` + ROUTES + Allowlist + كل المستهلكين | P08.2 | ADR-0029. |
| 82 | **شاشات**: تعريف البرنامج · شروط الاستحقاق · اختبار أولي غير ملزم ولا يُخزَّن | P08.2 | القيم المؤقتة موسومة وظاهرة. |
| 83 | **طلباتي + التفاصيل + الخط الزمني** من سجل التدقيق + فحص الملكية | P08.3 | ADR-0032. |
| 84 | **الاستكمال**: عرض المطلوب + تعديل أرقام/مستندات/ملاحظة + إعادة إرسال تمسح الطلب | P08.3 | صياغة محترمة. |
| 85 | **شاشة القرار**: أسباب من الكتالوج، **بلا نقاط**، بلا اسم مراجع | P08.3 | `scoreVisibility='hidden'`. |
| 86 | **الاعتراض**: Zod + مرة واحدة + نافذة قابلة للضبط + مستندات إضافية | P08.3 | إحالة لمراجع مختلف في P17. |
| 87 | **محاكي المراجعة** في `(dev)/assistance` | P08.3 | demo فقط؛ لا قرار آلي للمستخدم. |
| 88 | **ربط قسم حالات الدعم** بموافقة النشر + المحافظة الحقيقية | P08.3 | يغلق §8 #39؛ البوابة fail-closed. |

> لا شيء آخر مكتمل. أي جدول آخر يبقى فارغاً حتى المرحلة المعنية.

---

## 5) غير المكتملة

- **P09 (Financial Architecture)** حتى **P24**.
- شاشات الميزات المتبقية Placeholders صادقة: عرسنا واحد P10، الشركاء P11، سوق خير P12، وظائف/متطوعون P13، الحاسبة/الدليل P14، توعية P15، الإشعارات/البحث P16، لوحة الفريق P17.
- **الإحصاءات محجوبة** بحجم البيانات التجريبي الحالي (< الحد) — سلوك مقصود.
- **قصص النجاح فارغة** حتى تُضاف موافقة لكل سجل محتوى (P15).
- P18 يستبدل mocks بـSupabase + قواعد على الخادم + انتقال ذرّي + بصمة محتوى + تنفيذ الحذف والصرف.

---

## 6) الخدمات المتصلة

> **لا شيء متصل.** لا مشروع Supabase، لا مزوّد دفع، لا تخزين سحابي، لا بريد، لا Push.
> وضع `backend` يعرض **Not Connected** بصدق مع إعادة محاولة عاملة، ويشمل ذلك كل شاشات المساعدات وأقسام الرئيسية.
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
| **طلب مساعدة تجريبي** | تدفق كامل عبر نفس العقود | شارة Demo على الطلب والبطاقات |
| **الرقم المرجعي** | `AZIB-DEMO-YYYY-NNNNN` من المزوّد | `assistance:reference.demoNote` |
| **بصمة المستند** | وصفية تجريبية | `assistance:wizard.documents.fingerprintNote` |
| **محاكي المراجعة** | `(dev)` فقط، انتقالان حقيقيان عبر الخدمة | شارة Demo + ملاحظة النطاق |
| عدّاد شارة الإشعارات | محلي (0 افتراضاً) | المصدر الحقيقي P16 |
| شجرة locations | بيانات demo | `profile:locations.pending` |

**الشرطان محققان:** وسم واضح + المرور عبر نفس `Provider`/`Repository` المستخدم في الإنتاج.

---

## 8) المشكلات المعروفة

| # | المشكلة | التأثير | الحالة | ملاحظات |
|---|---------|---------|--------|---------|
| 1 | حدود الاستحقاق ونطاقات الدخل غير معتمدة نهائياً | عتبات مؤقتة في P08 | Open | قيم P08 موسومة `PENDING_POLICY`. |
| 2 | أوزان التقييم | — | **Closed (P08)** | HRD حدّدها: 30/20/15/15/10/10. `PRODUCT_POLICIES #2` صُحّح. |
| 3 | مدة الاعتراض | 14 يوماً مؤقتة | Open | قرار بشري. |
| 4 | سياسة الانسحاب من العرس | تحجب P10 | Open | قرار بشري. |
| 5 | استثناء «مساعدة واحدة» | مغلق افتراضياً في P08 | Open | قرار بشري. |
| 6 | فئة خصومات الشركاء | تحجب P11 | Open | قرار بشري. |
| 7 | مدة الاحتفاظ + فترة تأكيد الحذف | تحجب P19/P23؛ 30 يوماً مؤقتة | Open | قرار بشري. |
| 8 | الحد الأدنى لإخفاء الإحصاءات | 10 مؤقت (P07) | Open | يحجب P15/P17. |
| 9 | `forceRTL` عند تبديل اللغة | — | **Closed (P05)** | ADR-0013. |
| 10 | أيقونات أصول التطبيق من قالب Expo | لا تعكس الهوية | Open | P22/P23. |
| 11 | لا تحقق آلي من وجود ملفات الحوكمة | يدوي | Open | `AGENT_RULES §6`. |
| 12 | ESLint مثبّت على 9.x | لا ميزات 10 | Accepted | ADR-0007. |
| 13 | `i18n-allow-arabic` في اختبار قديم | مقبول | Accepted | تنظيف P21. |
| 14 | `populateDemoSeed` لا يغطي content/notifications/search | لا محتوى/إشعارات demo | Open | أداة P07 تلتفّ بالنشر لا بالخلق. |
| 15 | backend mode يستخدم mocks للـ16 repo | بيانات demo في backend | Accepted | يُصحَّح P18. |
| 16 | `RingProgress` بلا animation | تجربة أقل نعومة | Accepted | لم يُنفَّذ في P05–P08. |
| 17 | `BottomSheet` single-snap | لا نقاط متعددة | Accepted | P20 إن لزم. |
| 18 | `Tabs` غير scrollable | ≤5 تبويبات | Accepted | P07 استخدم FlatList أفقياً. |
| 19 | اختبارات Reanimated mock ثابت | الحركة لا تُختبر آلياً | Accepted | ADR-0011. |
| 20 | شارة الإشعارات بلا مصدر حقيقي | عدّاد محلي | Open | P16. |
| 21 | شاشة Maintenance ثابتة | لا علم عن بُعد | Open | P18+. |
| 22 | الاتجاه الأصلي يكتمل بعد إعادة الفتح | لا مكتبة restart | Accepted | ملاحظة صادقة. |
| 23 | فاحص الأزرار regex-based | لا يغطي كل الأنماط | Accepted | ADR-0015. |
| 24 | الفاحص غير مضمّن في سكربت `lint` | خطوة CI مستقلة فقط | Open | يلزم `package.json` كامل. |
| 25 | أنماط اختبار React 19 / RNTL v14 | أخطاء متكررة إن تُجاهلت | Accepted | دروس ملزمة في `DEVELOPMENT_PROGRESS`. |
| 26 | **لم يُجرَ تحقق على الأجهزة (P05–P08)** | حركة/Blur/بصمة/EXIF/Carousel/رفع مستندات | Open | بقرار المالك؛ P20/P21. |
| 27 | رابط صورة Avatar غير دائم | يضيع بإعادة التشغيل | Open | P18. |
| 28 | إزالة EXIF غير متحققة على جهاز | ادعاء خصوصية غير مُثبت | Open | P20. |
| 29 | شجرة locations تجريبية | ليست مرجعاً رسمياً | Open | `pending-human-review`. |
| 30 | الحذف مجدول لا منفَّذ | لا مسح فعلي | Open | P18 + قرار بشري. |
| 31 | الجلسات تسميات محلية | لا إنهاء عن بُعد | Open | P18. |
| 32 | نصوص Legal قوالب مؤقتة | **تحجب الإطلاق** | Open | مراجعة قانونية. |
| 33 | **صفّا الأمان والحذف معطّلان في فهرس الإعدادات** | لا مدخل من الواجهة | **قرار معتمد — تنفيذ معلّق** | المالك اعتمد تحديث الاختبار وتفعيل الصفّين؛ لم يُنفَّذ. |
| 34 | `SignInPlaceholder.tsx` مُبقى بلا استخدام | كود ميت مؤقت | Open | يُحذف مع اختباره (يلزم إرسال الملف). |
| 35 | سحب الموافقات الأساسية = حذف الحساب | محجوب بـ#33 | Open | يُحل مع #33. |
| 36 | لا استعادة جلسة عند الإقلاع | يُعاد الدخول كل مرة | Open | P18. |
| 37 | `zod` غير مُعلن في `package.json` | اعتماد على hoisting | Open | يُعلن عند أول تعديل للحزم. |
| 38 | مصدر HomeConfig ما زال Mock | لا مزامنة عبر الأجهزة | Open | ADR-0023. |
| 39 | لا حقول موافقة نشر في العقود | — | **Closed (P08)** | `publicationConsent` على الطلب + التقاط عند الإرسال + ربط القسم. |
| 40 | `Donation`/`Disbursement` AppendOnly | لا تأكيد تبرع عبر العقد ⇒ إحصاءات محجوبة | Open | P18. |
| 41 | `ContentRepository` ReadOnly | مستودع القصص فارغ | Open | P15/P18. |
| 42 | لا ربط حساب↔شريك | ملخص الشريك بلا أرقام | Open | P11. |
| 43 | المتطوعون تسجيلات لا مهام | قسم المتطوع يعرض تسجيل المستخدم | Open | P13. |
| 44 | مبالغ البرامج غير معروضة | معلومات ناقصة في المبادرات | Open | حتى اعتماد #1. |
| 45 | Carousel RTL + fallback الكسل 700ms | سلوك بصري/أدائي غير متحقق | Open | أجهزة + P20/P21. |
| 46 | انحراف صيغة مفاتيح i18n | كسر اختبارين في P07.2 | Accepted | درس مُلزِم. |
| 47 | `DESIGN_SYSTEM.md` أسطر قديمة | — | **Closed (P07)** | صُحّح في رد منفصل. |
| 48 | **فئة الحاجة غير مجموعة في payload الطلب** | بطاقة الدعم تعرض تسمية عامة + المحافظة فقط | Open | إضافة الحقل تحتاج توسيع عقد؛ P15/P18. |
| 49 | **`AuditRepository` بلا فلتر `target`** | الخط الزمني يُرشَّح client-side (حد 200) | Open | P18. |
| 50 | **انتقالات سير العمل غير ذرّية** | فشل جزئي قد يفصل الحالة عن البيانات | Open | `submit` ذرّي؛ الباقي نداءان. P18. |
| 51 | **بصمة المستند وصفية** | إعادة التسمية تُفلت من كشف التكرار | Open | بصمة محتوى + HMAC في P18 (ADR-0031). |
| 52 | **PDF بلا معالجة** | بيانات وصفية قد تبقى في الملف | Accepted | معلن بصدق؛ لا ادعاء بإزالتها. |
| 53 | **الرقم المرجعي من المزوّد التجريبي** | ليس رقماً رسمياً | Open | موسوم `AZIB-DEMO-*`؛ الرسمي P18. |
| 54 | **الاستكمال يعدّل 4 أرقام + مستندات + ملاحظة** | حقول أخرى تُغطّى بالمستند/الملاحظة | Open | تحرير كامل في P17/P18. |
| 55 | **محاكي المراجعة بديل مؤقت** | لا صلاحيات ولا فصل مراجعين فعلي | Open | P17 + RLS P18. |
| 56 | **`Date.now()` في حساب نافذة الاعتراض** | يحتاج `eslint-disable react-hooks/purity` داخل `useMemo` | Accepted | نمط موثّق؛ بديل نقي في P20 إن لزم. |

---

## 9) الخطوة التالية

**P09 — Financial Architecture.** غير محجوبة بقرارات بشرية، لكنها **مقيّدة بـADR-0005**: لا محفظة، لا Escrow، لا تحويل داخلي، ولا نظام دفع تجريبي يُنتج إيصالاً حقيقياً.

**نطاق P09 المتوقع:** سجل نية التبرع (`PaymentProvider.recordPledge`) · التحقق من دفع خارجي (`verifyExternalPayment` — يعيد `null` بصدق حتى يوجد مزوّد) · سجلات التبرعات والصرف Append-only · ربط الصرف بالطلب المقبول · شفافية مالية بإحصاءات محجوبة · لا حركة أموال داخل التطبيق.

**قبل بدء P09 مطلوب من المالك:**
1. **إشارة البدء** — لم تبدأ P09.
2. تنفيذ **#33** (تفعيل صفّي الأمان والحذف + تحديث الاختبار) — رقعة صغيرة مستقلة.
3. `package.json` الكامل (لضم الفاحص لـ`lint` وإعلان `zod` وتأكيد إصداري P08).
4. `src/features/shell/__tests__/SignInPlaceholder.test.tsx` لحذف الكود الميت (#34).
5. تأكيد أن **#7 (مدة الاحتفاظ)** لا يحجب سجلات P09 المالية.

**عند بدء P09 سيُطلب بالاسم:** `src/providers/contracts/payment.ts` · `src/providers/mock/payment.ts` · `src/schemas/donation.ts` · `src/schemas/disbursement.ts` · `src/repositories/mock/donation.ts` · `src/repositories/mock/disbursement.ts` · `src/repositories/mock/crud-factory.ts` · `src/locales/{ar,en}/marketplace.json` · `src/features/settings/export-service.ts` (إن لزم ربط التصدير بالسجلات المالية).
