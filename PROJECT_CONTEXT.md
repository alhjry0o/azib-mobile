# PROJECT_CONTEXT — السياق الدائم لمشروع عازب | AZIB

> هذا الملف يُقرأ في بداية كل مرحلة. يُحدَّث في نهاية كل مرحلة قبل إعلانها Done.
> **عام المستودع:** لا أسرار، لا بيانات شخصية حقيقية.

آخر تحديث: **P07 — Home Dashboard & Discovery (مغلقة رسمياً — 2026-11-16).**
CI أخضر بالكامل: **129/129 suites · 869/869 tests** · lint وtypecheck نظيفان (بتقرير المالك).

---

## 1) القرارات التقنية

| القرار | القيمة المعتمدة | الحالة | المرجع |
|--------|------------------|--------|--------|
| مدير الحزم | npm | مُعتمد | ADR-0001 |
| إطار العمل | Expo + React Native + TypeScript (strict) + Expo Router | مُعتمد | HRD |
| حالة العميل | Zustand (6 stores) | مُعتمد | ADR-0002 |
| حالة الخادم | TanStack Query — استعلام لكل قسم | مُعتمد ومُفعّل | ADR-0002 |
| النماذج والتحقق | React Hook Form + Zod (`useWatch` إلزامي) | مُعتمد | HRD + درس P06.2 |
| الترجمة | i18next (`ar` افتراضية، RTL) + حفظ اللغة | مُعتمد | ADR-0013 |
| الحركة | Reanimated + Gesture Handler | مُعتمد | ADR-0011 |
| الخادم | Supabase خلف Provider Abstraction | مُعتمد (غير مربوط حتى P18) | HRD |
| المصادقة | عقد `AuthProvider` موسَّع (15 capability) | مُعتمد | ADR-0016 |
| التوكنات | SecureStore على الجهاز · ذاكرة فقط على الويب | مُعتمد | ADR-0017 |
| رمز التحقق | OTP تجريبي حتمي + challenge داخل الجلسة | مُعتمد | ADR-0018 |
| الموقع الجغرافي | تسلسل مُشتق من شجرة، مخزَّن في `Profile.city` | مُعتمد | ADR-0019 |
| صورة المستخدم | قص مركزي + إعادة ترميز + رابط في Query cache | مُعتمد | ADR-0020 |
| الحذف والتصدير والقانوني | جدولة بفترة تأكيد + JSON + سجل نسخ | مُعتمد | ADR-0021 |
| واجهات Expo الأصلية | معزولة في وحدات حدودية | مُعتمد | ADR-0022 |
| **تكوين الرئيسية** | **HomeConfig قابل للتبديل + تخصيص محلي** | **مُعتمد** | **ADR-0023** |
| **نشر المحتوى الحساس** | **بوابة موافقة fail-closed + تعقيم** | **مُعتمد** | **ADR-0024** |
| **الإحصاءات** | **إخفاء الأعداد < الحد ومعها المبالغ** | **مُعتمد** | **ADR-0025** |
| **أصل البيانات** | **فصل Demo/Real صارم في الإحصاءات** | **مُعتمد** | **ADR-0026** |
| الاختبارات | Jest + RNTL v14 (واجهات async) · Playwright · pgTAP | مُعتمد | ADR-0004 |
| CI | GitHub Actions + فاحص الأزرار الميتة | مُعتمد | ADR-0015 |
| التنقل | Expo Router + FloatingDock مخصص | مُعتمد | ADR-0012 |
| الروابط العميقة | `azib://` بقائمة سماح | مُعتمد | ADR-0014 |
| نموذج الأموال | Non-Custodial | مُعتمد | ADR-0005 |
| تقييم الأهلية | Advisory فقط + مراجعة بشرية | مُعتمد | ADR-0006 |
| أسلوب 3D | ثلاث طبقات | مُعتمد | ADR-0003 |

---

## 2) إصدارات الأدوات

> المصدر `package.json` المرسل مع حزمة P07 + تقرير `expo install --fix`. **لا قيم TBD.**
> **لا تبعيات جديدة في P07.**

| الأداة | الإصدار | مصدر التحقق | تاريخ |
|--------|---------|--------------|-------|
| Node.js | v26.13.0 | `node -v` (بتقرير المالك) | 2026-11-08 |
| npm | 12.2.1 | `npm -v` (بتقرير المالك) | 2026-11-08 |
| Expo SDK | ~58.0.26 | `package.json` | 2026-11-16 |
| React Native | 0.88.1 | `package.json` | 2026-11-08 |
| React | 19.3.0 | `package.json` | 2026-11-08 |
| React DOM | 19.3.0 | `package.json` | 2026-11-08 |
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
| expo-file-system | ~58.0.13 | `package.json` (انظر الحاشية) | 2026-11-16 |
| expo-sharing | ~58.0.23 | `package.json` | 2026-11-16 |
| @react-native-community/netinfo | 12.0.1 | `package.json` | 2026-11-16 |
| @tanstack/react-query | ^5.107.1 | `package.json` | 2026-11-16 |
| react-hook-form | ^7.92.0 | `package.json` | 2026-11-16 |
| @hookform/resolvers | ^7.0.6 | `package.json` | 2026-11-16 |
| zod | ^3.23.8 | بتقرير المالك — **غير مُعلن في `package.json`** (§8 #36) | 2026-11-16 |
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

**حاشية `expo-file-system`:** تقرير P06.2 ذكر رفعه إلى `58.0.14` عبر `expo install --fix`، لكن `package.json` المرسل لاحقاً يُظهر `~58.0.13`. **الملف هو المصدر المعتمد**، و`expo-doctor` أخضر في CI. يُعاد التحقق عند أول تعديل للحزم.

---

## 3) بنية المجلدات (الفعلية بعد P07)

```
azib-mobile/
├─ app/                          # Routes ONLY — بلا منطق أعمال
│  ├─ _layout.tsx · index.tsx (Gate) · +not-found.tsx · maintenance.tsx
│  ├─ (onboarding)/ · (auth)/ 6 شاشات · (tabs)/ 5 تبويبات
│  ├─ (features)/ 9 Placeholders صادقة · (staff)/ · (dev)/ 4 شاشات
│  ├─ profile/ index + edit · settings/ 13 شاشة · legal/ [doc]
│  └─ (tabs)/index.tsx           → HomeScreen (P07)
├─ src/
│  ├─ components/{ui,brand,shell}/
│  ├─ features/
│  │  ├─ shell/ · onboarding/ · auth/ · profile/ · settings/ · legal/
│  │  ├─ home/                   # جديد في P07
│  │  │  ├─ config/              # types · default · source (قابل للتبديل)
│  │  │  ├─ hooks/               # use-home-config · use-home-section ·
│  │  │  │                       # use-home-greeting · use-home-formatters
│  │  │  ├─ components/          # HomeHeader · HomeHero · QuickActions ·
│  │  │  │                       # SectionShell · SectionErrorBoundary ·
│  │  │  │                       # LazySection · Stagger · HomeCustomizeSheet
│  │  │  ├─ sections/            # 8 أقسام + role/ (3 كتل) + registry
│  │  │  ├─ consent-gate.ts · anonymize.ts · stats-privacy.ts
│  │  │  ├─ success-stories.ts · HomeScreen.tsx · index.ts
│  │  └─ dev/                    # DevSettings · Integrations · DevAuth ·
│  │                             # demo-seed.ts · use-demo-seed.ts
│  ├─ stores/                    # app-mode · onboarding · shell · language ·
│  │                             # auth · settings (+ تفضيلات الرئيسية)
│  ├─ constants/routes.ts · locales/{ar,en}/ (15 ns) · schemas/
│  └─ hooks/ theme/ core/ config/ providers/ repositories/ i18n/
├─ mocks/seed/                   # + locations.ts (بانتظار تحقق بشري)
├─ scripts/ · tests/__tests__/scripts/ · docs/ · .github/workflows/
└─ app.config.ts · eslint.config.js · jest.config.js · jest.setup.ts · tsconfig.json
```

**قواعد ثابتة:** Routes in `app/` only · Features in `src/features/` · **مجلد الاختبار `__tests__` دائماً** · واجهات Expo في وحدات حدودية (ADR-0022) · **صيغة مفاتيح i18n موحّدة بين JSON والكود** (درس P07.2).

---

## 4) الوظائف المكتملة

| # | الوظيفة | المرحلة | ملاحظات |
|---|---------|---------|---------|
| 1–11 | الحوكمة · Expo SDK 58 · Core Platform · 12 Providers · 16 Repos · i18n · Seed | P01–P03 | بلا تغيير عقود. |
| 12–19 | Theme + 42 مكوّناً + Gallery + `DESIGN_SYSTEM.md` | P04 | 565 اختباراً عند الإغلاق. |
| 20–29 | المسارات · Gate · Dock · Hosts · Banners · ErrorBoundary · Deep Links · Splash · Onboarding · Dev + فاحص الأزرار | P05 | ADR-0012…0015. |
| 30–37 | عقد Auth (5 دوال) · Mock كامل · State Machine · TokenVault · 6 شاشات · OTP · الضيف · الأدوار | P06.1 | ADR-0016…0018. |
| 38–44 | الملف الشخصي · التسلسل الجغرافي · الصورة · Avatar `uri` · Module 20 · الموافقات · الخروج بتأكيد | P06.2 | ADR-0019/0020. |
| 45–52 | عقد Auth (6 دوال → 15) · تغيير كلمة المرور · الجلسات · البيومتري · الحذف · التصدير · Legal · `INTEGRATIONS.md` | P06.3 | ADR-0021/0022. |
| 53 | **HomeConfig**: أنواع + افتراضي + دوال تطبيع نقية (ترتيب/إخفاء/تحريك) | P07.1 | ADR-0023. |
| 54 | **مصدر تكوين قابل للتبديل** (`HomeConfigSource` + Mock + get/set/reset) | P07.1 | Settings لاحقاً. |
| 55 | **`useHomeConfig`**: دمج المصدر مع التخصيص المحفوظ + ترشيح الأقسام المسجّلة | P07.1 | تخصيص فعلي محفوظ. |
| 56 | **`useHomeSection`**: استعلام مستقل لكل قسم + `resolveSectionStatus` نقية | P07.1 | backend ⇒ NotConnected. |
| 57 | **HomeHeader**: تحية بالوقت + اسم العرض + جرس بعدّاد + بحث + تخصيص | P07.1 | وجهات حقيقية. |
| 58 | **HomeHero**: قمرية + Hero3D حسب Tier + بارالاكس بالتمرير + زرّان بحسب الدور | P07.1 | توهج واحد. |
| 59 | **QuickActions**: 7 إجراءات قابلة للتخصيص بشبكة RTL | P07.1 | كلها تنقل فعلي. |
| 60 | **SectionShell / SectionErrorBoundary / LazySection / Stagger(≤8)** | P07.1 | عزل الفشل + تحميل كسول. |
| 61 | **4 أقسام**: الأعراس (Carousel) · العروض الموثقة (join) · سوق الخير · الوظائف | P07.1 | فلاتر حالة صارمة. |
| 62 | **كتل الأدوار**: ملخص الشريك · مهام المتطوع · اختصار الفريق | P07.1 | ظهور مشروط بالدور. |
| 63 | **HomeCustomizeSheet** + Pull-to-Refresh + FlatList مضبوط | P07.1 | ترتيب/إظهار/استعادة. |
| 64 | **أداة تعبئة Demo**: إنشاء + نشر + توثيق شركاء + ربط عروض + تطبيع برامج | P07.1/P07.2 | عبر العقود فقط، بلا تعبئة تلقائية. |
| 65 | **بوابة الموافقة fail-closed** + **تعقيم بطاقة الدعم** | P07.2 | ADR-0024. |
| 66 | **إخفاء الأعداد والمبالغ** + **فصل Demo/Real** | P07.2 | ADR-0025/0026. |
| 67 | **4 أقسام**: حالات الدعم · الإحصاءات · المبادرات · قصص النجاح | P07.2 | حالات فارغة صادقة بسبب معلن. |
| 68 | **تسجيل الأقسام الثمانية** + تجميع HomeScreen + تحديث اختبارَي P07.1 | P07.2 | 129 suites / 869 tests. |

> لا شيء آخر مكتمل. أي جدول آخر يبقى فارغاً حتى المرحلة المعنية.

---

## 5) غير المكتملة

- **P08 (Assistance + Eligibility)** حتى **P24**. P08 **محجوب** بقرارات بشرية (`PRODUCT_POLICIES #1,#2,#3,#5`).
- شاشات الميزات ما زالت Placeholders صادقة: المساعدات P08، عرسنا واحد P10، الشركاء P11، سوق خير P12، وظائف/متطوعون P13، الحاسبة/الدليل P14، توعية P15، الإشعارات/البحث P16، لوحة الفريق P17.
- **قسمَا حالات الدعم وقصص النجاح فارغان دائماً** حتى تُضاف حقول موافقة النشر (P08/P15/P18) — ليس عطلاً بل سياسة (ADR-0024).
- **الإحصاءات محجوبة بالكامل** بحجم البيانات التجريبي الحالي (< الحد) — سلوك مقصود (ADR-0025).
- P18 يستبدل mocks بـSupabase + ينفّذ الحذف + يحفظ الصورة + يستعيد الجلسة.

---

## 6) الخدمات المتصلة

> **لا شيء متصل.** لا مشروع Supabase، لا مزوّد دفع، لا تخزين سحابي، لا بريد، لا Push.
> وضع `backend` يعرض **Not Connected** بصدق مع إعادة محاولة عاملة، ويشمل ذلك كل أقسام الرئيسية.
> عند ربط أي خدمة يُضاف صف: الخدمة، ما يتصل بها، البيئة، طريقة التحقق، التاريخ، **من تحقق**.

---

## 7) الخدمات التجريبية

| الخدمة | الحالة | الوسم في الواجهة |
|--------|--------|------------------|
| MockAuthProvider (15 capability) | يعمل عبر نفس عقد الإنتاج | DemoBanner + Badge «بيانات تجريبية» |
| 12 Mock Providers + 16 Mock Repos | تعمل في وضع demo | Registry يعرض `mock` |
| OTP تجريبي | رمز حتمي معروض بوسم Demo | `auth:verify.demoCode` |
| جلسات/أجهزة | سجلات محلية `demo-device-N` | `auth:devices.demoNote` |
| صورة Avatar | رفع إلى MockStorage (ذاكرة) | `profile:avatar.sessionNote` |
| **أداة تعبئة الرئيسية** | تنشر وتربط عبر العقود، يدوياً من `(dev)` | `home:dev.*` + شارة Demo في كل بطاقة |
| **إحصاءات الرئيسية** | دلو demo فقط، والأعداد محجوبة دون الحد | `home:sections.community-stats.demoOnly` |
| عدّاد شارة الإشعارات | محلي (0 افتراضاً) | المصدر الحقيقي P16 |
| شجرة locations | بيانات demo | `profile:locations.pending` |

**الشرطان محققان:** وسم واضح + المرور عبر نفس `Provider`/`Repository` المستخدم في الإنتاج.

---

## 8) المشكلات المعروفة

| # | المشكلة | التأثير | الحالة | ملاحظات |
|---|---------|---------|--------|---------|
| 1 | حدود الاستحقاق ونطاقات الدخل غير معتمدة | تحجب P08؛ منعت عرض مبالغ البرامج في P07 | Open | قرار بشري. |
| 2 | أوزان التقييم الآلي | تحجب P08/P14 | Open | قرار بشري. |
| 3 | مدة الاعتراض | تحجب P08 | Open | قرار بشري. |
| 4 | سياسة الانسحاب من العرس | تحجب P10 | Open | قرار بشري. |
| 5 | استثناء «مساعدة واحدة» | تحجب P08 | Open | قرار بشري. |
| 6 | فئة خصومات الشركاء | تحجب P11 | Open | قرار بشري. |
| 7 | مدة الاحتفاظ + فترة تأكيد الحذف | تحجب P19/P23؛ فترة 30 يوماً مؤقتة في P06.3 | Open | قرار بشري. |
| 8 | **الحد الأدنى لإخفاء الإحصاءات** | **استُخدم 10 مؤقتاً في P07**؛ يحجب P15/P17 | Open | ADR-0025 + `PRODUCT_POLICIES §8`. |
| 9 | `forceRTL` عند تبديل اللغة | — | **Closed (P05)** | ADR-0013. |
| 10 | أيقونات أصول التطبيق من قالب Expo | لا تعكس الهوية | Open | P22/P23. |
| 11 | لا تحقق آلي من وجود ملفات الحوكمة | يدوي | Open | `AGENT_RULES §6`. |
| 12 | ESLint مثبّت على 9.x | لا ميزات 10 | Accepted | ADR-0007. |
| 13 | `i18n-allow-arabic` في اختبار قديم | مقبول | Accepted | تنظيف P21. |
| 14 | `populateDemoSeed` لا يغطي content/notifications/search | لا محتوى/إشعارات demo | Open | أداة P07 تلتفّ بالنشر عبر العقود، لا تخلق محتوى. |
| 15 | backend mode يستخدم mocks للـ16 repo | بيانات demo في backend | Accepted | يُصحَّح P18؛ أقسام الرئيسية تعرض NotConnected. |
| 16 | `RingProgress` بلا animation | تجربة أقل نعومة | Accepted | لم يُنفَّذ في P05–P07. |
| 17 | `BottomSheet` single-snap | لا نقاط متعددة | Accepted | P20 إن لزم. |
| 18 | `Tabs` غير scrollable | ≤5 تبويبات | Accepted | P07 استخدم FlatList أفقياً؛ لا تعديل على المكوّن. |
| 19 | اختبارات Reanimated mock ثابت | الحركة لا تُختبر آلياً | Accepted | ADR-0011؛ أجهزة + P21. |
| 20 | شارة الإشعارات بلا مصدر حقيقي | عدّاد محلي | Open | P16؛ الجرس في الرئيسية يقرأ نفس المخزن. |
| 21 | شاشة Maintenance ثابتة | لا علم عن بُعد | Open | P18+. |
| 22 | الاتجاه الأصلي يكتمل بعد إعادة الفتح | لا مكتبة restart | Accepted | ملاحظة صادقة معروضة. |
| 23 | فاحص الأزرار regex-based | لا يغطي كل الأنماط | Accepted | ADR-0015. |
| 24 | الفاحص غير مضمّن في سكربت `lint` | خطوة CI مستقلة فقط | Open | يلزم `package.json` كامل. |
| 25 | أنماط اختبار React 19 / RNTL v14 | أخطاء متكررة إن تُجاهلت | Accepted | دروس ملزمة في `DEVELOPMENT_PROGRESS`. |
| 26 | **لم يُجرَ تحقق على الأجهزة (P05–P07)** | حركة/Blur/بصمة/EXIF/Carousel RTL/الكسل | Open | بقرار المالك؛ P20/P21. |
| 27 | رابط صورة Avatar غير دائم | يضيع بإعادة التشغيل | Open | P18 (ADR-0020). |
| 28 | إزالة EXIF غير متحققة على جهاز | ادعاء خصوصية غير مُثبت | Open | P20. |
| 29 | شجرة locations تجريبية | ليست مرجعاً رسمياً | Open | `pending-human-review`. |
| 30 | الحذف مجدول لا منفَّذ + المدة غير معتمدة | لا مسح فعلي | Open | P18 + قرار بشري. |
| 31 | الجلسات تسميات محلية | لا إنهاء عن بُعد فعلي | Open | P18. |
| 32 | نصوص Legal قوالب مؤقتة | **تحجب الإطلاق** | Open | مراجعة قانونية. |
| 33 | **صفّا الأمان والحذف معطّلان في فهرس الإعدادات** | لا مدخل من الواجهة | **قرار معتمد — تنفيذ معلّق** | المالك اعتمد الخيار (أ): تحديث الاختبار وتفعيل الصفّين. لم يُنفَّذ بعد. |
| 34 | `SignInPlaceholder.tsx` مُبقى بلا استخدام | كود ميت مؤقت | Open | يُحذف مع اختباره (يلزم إرسال الملف). |
| 35 | سحب الموافقات الأساسية = حذف الحساب | محجوب بـ#33 | Open | يُحل مع #33. |
| 36 | لا استعادة جلسة عند الإقلاع | يُعاد الدخول كل مرة | Open | P18. |
| 37 | `zod` غير مُعلن في `package.json` | اعتماد على hoisting | Open | يُعلن عند أول تعديل للحزم. |
| 38 | **مصدر HomeConfig ما زال Mock** | لا مزامنة عبر الأجهزة | Open | ADR-0023؛ الربط بـSettingsRepository لاحقاً. |
| 39 | **لا حقول موافقة نشر في `Application`/`ContentRecord`** | قسمَا الدعم والقصص فارغان دائماً | Open | ADR-0024؛ P08/P15/P18. |
| 40 | **`Donation`/`Disbursement` AppendOnly (بلا update)** | لا يمكن تأكيد تبرع عبر العقد ⇒ الإحصاءات المؤكدة 0 | Open | يُحل بعقد/مزوّد P18. |
| 41 | **`ContentRepository` ReadOnly (بلا create)** | مستودع القصص فارغ في demo | Open | P15/P18. |
| 42 | **لا ربط حساب↔شريك** | ملخص الشريك بلا أرقام | Open | P11. |
| 43 | **المتطوعون تسجيلات لا مهام** | قسم المتطوع يعرض تسجيل المستخدم فقط | Open | P13. |
| 44 | **مبالغ البرامج غير معروضة** | معلومات ناقصة في المبادرات | Open | مقصود حتى اعتماد #1. |
| 45 | **Carousel RTL (`inverted`) + fallback الكسل 700ms** | سلوك بصري/أدائي غير متحقق | Open | أجهزة + P20/P21. |
| 46 | **انحراف صيغة مفاتيح i18n (kebab vs camel)** | كسر اختبارين في P07.2 | Accepted | **درس مُلزِم**: تطابق الصيغة قبل الاختبار. |
| 47 | `docs/DESIGN_SYSTEM.md` يحوي 3 أسطر قديمة | وثيقة غير دقيقة جزئياً | Open | بانتظار موافقة المالك على التعديل. |

---

## 9) الخطوة التالية

**P08 — Assistance + Eligibility.** **محجوبة** حتى اعتماد القرارات البشرية:
`PRODUCT_POLICIES #1` (حدود الاستحقاق والدخل) · `#2` (أوزان التقييم) · `#3` (مدة الاعتراض) · `#5` (استثناء مساعدة واحدة).

**نطاق P08 المتوقع بعد رفع الحجب:** تقديم طلب مساعدة عبر `ApplicationRepository` + مراجعة أهلية بشرية + تقييم `AiProvider` **Advisory فقط** (ADR-0006) + حالات الطلب الست + اعتراض + **حقول موافقة النشر** التي تفتح قسم حالات الدعم في الرئيسية (ADR-0024).

**قبل بدء P08 مطلوب من المالك:**
1. **رفع الحجب**: اعتماد القرارات الأربعة أعلاه (أو تفويض قيم مؤقتة موسومة كما في #8).
2. **إشارة البدء** — لم تبدأ P08.
3. تنفيذ القرار #33 (تفعيل صفّي الأمان والحذف + تحديث الاختبار) — رقعة صغيرة مستقلة.
4. `package.json` الكامل (لضم الفاحص لـ`lint` وإعلان `zod`).
5. `src/features/shell/__tests__/SignInPlaceholder.test.tsx` لحذف الكود الميت (#34).
6. موافقة على تصحيح `docs/DESIGN_SYSTEM.md` (#47).

**عند بدء P08 سيُطلب بالاسم:** `src/schemas/application.ts` · `src/schemas/program.ts` · `src/repositories/mock/program.ts` · `src/providers/contracts/ai.ts` · `src/providers/mock/ai.ts` · `src/locales/{ar,en}/assistance.json` · `src/components/ui/form/Textarea.tsx` · `docs/THREAT_MODEL.md` · `src/features/home/sections/SupportCasesSection.tsx` (لربط الموافقات الجديدة).
