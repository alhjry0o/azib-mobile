# PROJECT_CONTEXT — السياق الدائم لمشروع عازب | AZIB

> هذا الملف يُقرأ في بداية كل مرحلة. يُحدَّث في نهاية كل مرحلة قبل إعلانها Done.
> **عام المستودع:** لا أسرار، لا بيانات شخصية حقيقية.

آخر تحديث: **P06 — Auth / Profile / Settings / Legal (مغلقة رسمياً — 2026-11-16).**
CI أخضر بالكامل: **110/110 suites · 780/780 tests** (بتقرير المالك).

---

## 1) القرارات التقنية

| القرار | القيمة المعتمدة | الحالة | المرجع |
|--------|------------------|--------|--------|
| مدير الحزم | npm | مُعتمد | ADR-0001 |
| إطار العمل | Expo + React Native + TypeScript (strict) + Expo Router | مُعتمد | HRD |
| حالة العميل | Zustand (6 stores) | مُعتمد | ADR-0002 |
| حالة الخادم | TanStack Query | مُعتمد ومُفعّل | ADR-0002 |
| النماذج والتحقق | React Hook Form + Zod (`useWatch` إلزامي) | مُعتمد ومُفعّل | HRD + درس P06.2 |
| الترجمة | i18next (`ar` افتراضية، RTL) + حفظ اللغة | مُعتمد | ADR-0013 |
| الحركة | Reanimated + Gesture Handler | مُعتمد | ADR-0011 |
| الخادم | Supabase خلف Provider Abstraction | مُعتمد (غير مربوط حتى P18) | HRD |
| المصادقة | عقد `AuthProvider` موسَّع (15 capability) | مُعتمد | **ADR-0016** |
| التوكنات | SecureStore على الجهاز · ذاكرة فقط على الويب | مُعتمد | **ADR-0017** |
| رمز التحقق | OTP تجريبي حتمي + challenge داخل الجلسة | مُعتمد | **ADR-0018** |
| الموقع الجغرافي | تسلسل مُشتق من شجرة، مخزَّن في `Profile.city` | مُعتمد | **ADR-0019** |
| صورة المستخدم | قص مركزي + إعادة ترميز + رابط في Query cache | مُعتمد | **ADR-0020** |
| الحذف والتصدير والقانوني | جدولة بفترة تأكيد + JSON + سجل نسخ | مُعتمد | **ADR-0021** |
| واجهات Expo الأصلية | معزولة في وحدات حدودية قابلة للاستبدال | مُعتمد | **ADR-0022** |
| الاختبارات | Jest + RNTL v14 (واجهات async) · Playwright · pgTAP | مُعتمد | ADR-0004 |
| CI | GitHub Actions + فاحص الأزرار الميتة | مُعتمد | ADR-0015 |
| التنقل | Expo Router + FloatingDock مخصص | مُعتمد | ADR-0012 |
| الروابط العميقة | `azib://` بقائمة سماح | مُعتمد | ADR-0014 |
| نموذج الأموال | Non-Custodial (لا محفظة، لا Escrow) | مُعتمد | ADR-0005 |
| تقييم الأهلية | Advisory فقط + مراجعة بشرية نهائية | مُعتمد | ADR-0006 |
| أسلوب 3D | ثلاث طبقات | مُعتمد | ADR-0003 |

---

## 2) إصدارات الأدوات

> المصدر `package.json` + تقرير `expo install --fix`. **لا قيم TBD متبقية.**

| الأداة | الإصدار | مصدر التحقق | تاريخ |
|--------|---------|--------------|-------|
| Node.js | v26.13.0 | `node -v` (بتقرير المالك) | 2026-11-08 |
| npm | 12.2.1 | `npm -v` (بتقرير المالك) | 2026-11-08 |
| Expo SDK | ~58.0.26 | `expo install --fix` (بتقرير المالك) | 2026-11-16 |
| React Native | 0.88.1 | `package.json` | 2026-11-08 |
| React | 19.3.0 | `package.json` | 2026-11-08 |
| React DOM | 19.3.0 | `package.json` | 2026-11-08 |
| expo-router | ~58.0.32 | `expo install --fix` | 2026-11-16 |
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
| expo-file-system | ~58.0.14 | `expo install --fix` (الواجهة الصنفية `File`/`Paths`) | 2026-11-16 |
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
| jest-expo | ~58.0.15 | `expo install --fix` | 2026-11-16 |
| @types/jest | ^30.0.0 | `package.json` | 2026-11-09 |
| @types/node | ^26.6.6 | `package.json` | 2026-11-09 |
| @testing-library/react-native | ^14.1.0 | `package.json` — **واجهات async** | 2026-11-16 |
| react-test-renderer | ^19.3.0 | `package.json` | 2026-11-16 |
| prettier | ^3.10.0 | `package.json` | 2026-11-16 |

**التحقق من التوافق:** `expo-doctor` → **20/20** ضمن CI الأخضر (بتقرير المالك).

---

## 3) بنية المجلدات (الفعلية بعد P06)

```
azib-mobile/
├─ app/                          # Routes ONLY — بلا منطق أعمال
│  ├─ _layout.tsx · index.tsx (Gate) · +not-found.tsx · maintenance.tsx
│  ├─ (onboarding)/ _layout + index
│  ├─ (auth)/ _layout + welcome + sign-in + sign-up + verify
│  │            + forgot-password + reset-password
│  ├─ (tabs)/ _layout + index + services + weddings + partners + account
│  ├─ (features)/ _layout + 9 شاشات ميزات (Placeholders صادقة)
│  ├─ (staff)/ _layout (حارس دور) + index
│  ├─ (dev)/ _layout (بوابة إنتاج) + index + integrations + auth + gallery
│  ├─ profile/ _layout (RequireAuth) + index + edit
│  ├─ settings/ _layout + index + account + language + appearance + numbers
│  │            + notifications + privacy + help + about
│  │            + security + devices + delete-account + export-data
│  └─ legal/ _layout + [doc].tsx
├─ src/
│  ├─ components/{ui,brand,shell}/
│  ├─ features/
│  │  ├─ shell/        # Gate, routing, deep-links, session, hosts, banners
│  │  ├─ onboarding/   # 5 خطوات
│  │  ├─ auth/         # auth-machine, token-vault, use-auth, use-otp,
│  │  │                # RequireAuth, consents, errors, 6 شاشات
│  │  ├─ profile/      # locations, use-profile, image-pipeline,
│  │  │                # use-avatar-upload, AvatarPicker, LocationCascade
│  │  ├─ settings/     # biometric, use-security, use-account-deletion,
│  │  │                # export-service, export-file, use-data-export,
│  │  │                # BiometricGate, SignOutButton, 13 شاشة
│  │  ├─ legal/        # legal-documents (سجل النسخ) + LegalDocScreen
│  │  └─ dev/          # DevSettingsScreen, IntegrationsScreen, DevAuthScreen
│  ├─ stores/          # app-mode · onboarding · shell · language · auth · settings
│  ├─ constants/routes.ts
│  ├─ locales/{ar,en}/ # 15 namespace
│  ├─ schemas/         # + auth.ts · security.ts · profile-form.ts
│  └─ hooks/ theme/ core/ config/ providers/ repositories/ i18n/
├─ mocks/seed/         # + locations.ts (بانتظار تحقق بشري)
├─ scripts/            # check-hardcoded-arabic · check-dead-buttons
├─ tests/__tests__/scripts/
└─ docs/               # + INTEGRATIONS.md (جديد في P06)
```

**قواعد ثابتة:** Routes in `app/` only · Features in `src/features/` · **مجلد الاختبار `__tests__` دائماً** · واجهات Expo الأصلية في وحدات حدودية (ADR-0022).

---

## 4) الوظائف المكتملة

| # | الوظيفة | المرحلة | ملاحظات |
|---|---------|---------|---------|
| 1–11 | الحوكمة · Expo SDK 58 · Core Platform · 12 Providers · 16 Repos · i18n · Seed | P01–P03 | كما هي، بلا تغيير عقود. |
| 12–19 | Theme + 42 مكوّناً + Gallery + `DESIGN_SYSTEM.md` | P04 | 565 اختباراً عند الإغلاق. |
| 20–29 | شجرة المسارات · Gate · FloatingDock · Hosts · Banners · ErrorBoundary · Deep Links · Splash · Onboarding · Dev Settings + Integrations + فاحص الأزرار | P05 | ADR-0012…0015. |
| 30 | **توسيع عقد Auth (5 دوال)**: signUp / requestVerification / verify / requestPasswordReset / resetPassword | P06.1 | إضافة فقط — ADR-0016. |
| 31 | **إكمال Mock Auth**: مستخدمون، تحديات، محاولات، backoff، أدوار، موافقات | P06.1 | لا كلمات مرور في السجلات أو النتائج. |
| 32 | **Auth State Machine** نقية: loading / unauthenticated / guest / authenticated / needs_verification | P06.1 | كل انتقال صالح وغير صالح مُختبَر. |
| 33 | **TokenVault**: SecureStore على الجهاز، ذاكرة على الويب، مسح عند الخروج | P06.1 | ADR-0017. |
| 34 | **6 شاشات مصادقة**: Welcome / SignIn / SignUp / Verify / Forgot / Reset (RHF + Zod) | P06.1 | أخطاء Inline بمفاتيح ترجمة. |
| 35 | **OTP**: 6 خانات، لصق، حد 5 محاولات، كولداون 30s، رمز تجريبي حتمي موسوم | P06.1 | ADR-0018. |
| 36 | **الضيف**: جلسة محلية بلا PII + تصفح عام + `RequireAuth` على المحمي | P06.1 | حارس واجهة فقط؛ RLS في P18. |
| 37 | **الأدوار من الجلسة** + حارس Staff بدور صريح + مبدّل أدوار في `(dev)/auth` | P06.1 | يغلق §8 #18. |
| 38 | **الملف الشخصي**: عرض/تعديل + حالات loading/empty/error/notConnected/demo | P06.2 | `ProfileRepository` بلا تعديل عقد. |
| 39 | **التسلسل الجغرافي**: محافظة ← مديرية ← منطقة من شجرة demo | P06.2 | ADR-0019؛ الوسم «بانتظار تحقق بشري». |
| 40 | **صورة Avatar**: اختيار → قص مركزي → إعادة ترميز → رفع عبر StorageProvider | P06.2 | ADR-0020؛ `manipulateAsync` (الواجهة المثبتة). |
| 41 | **`Avatar` يدعم `uri`** مع رجوع للأحرف الأولى | P06.2 | خاصية إضافية — يغلق §8 #14. |
| 42 | **Module 20 (الإعدادات)**: فهرس + حساب + لغة + مظهر + أرقام + إشعارات + خصوصية + مساعدة + حول | P06.2 | 9 شاشات عاملة. |
| 43 | **الموافقات**: عرض المسجّلة بنسخها + موافقة قصص النجاح قابلة للسحب | P06.2 | سحب الأساسية = حذف الحساب (§8 #34). |
| 44 | **تسجيل الخروج بتأكيد** عبر DialogHost + مسح الجلسة والبيانات المحلية | P06.2 | `SignOutButton` مشترك. |
| 45 | **توسيع عقد Auth (6 دوال أخرى)** → الإجمالي **15 capability** | P06.3 | `docs/INTEGRATIONS.md`. |
| 46 | **تغيير كلمة المرور** بإعادة مصادقة فعلية + رفض إعادة استخدام القديمة | P06.3 | شاشة مبنية ومختبَرة (§8 #32). |
| 47 | **الجلسات/الأجهزة**: عرض + تمييز الحالية + إنهاء جلسة بعينها | P06.3 | تسميات أجهزة تجريبية (§8 #30). |
| 48 | **القفل البيومتري** الاختياري + `BiometricGate` فعلي على شاشة الأمان | P06.3 | معطّل بسبب معلن عند عدم الدعم. |
| 49 | **حذف الحساب**: 3 خطوات + كلمة مرور + كلمة تأكيد + إقرار + جدولة وإلغاء | P06.3 | ADR-0021؛ المدة `PENDING_POLICY`. |
| 50 | **تصدير البيانات**: JSON عبر `File`/`Paths` + `Sharing`، وBlob على الويب | P06.3 | بلا توكنات أو كلمات مرور — مُختبَر. |
| 51 | **5 وثائق قانونية** بنسخ + وسم «يتطلب مراجعة قانونية» + حالة مجهول صادقة | P06.3 | `/legal/[doc]`. |
| 52 | **`docs/INTEGRATIONS.md`** | P06.3 | عقد المزوّد + خطة P18. |

> لا شيء آخر مكتمل. أي جدول آخر يبقى فارغاً حتى المرحلة المعنية.

---

## 5) غير المكتملة

- **P07 (Home)** حتى **P24 (Final Integration)**.
- شاشات الميزات ما زالت Placeholders صادقة: الرئيسية P07، المساعدات P08، عرسنا واحد P10، الشركاء P11، سوق خير P12، وظائف/متطوعون P13، الحاسبة/الدليل P14، توعية P15، الإشعارات/البحث P16، لوحة الفريق P17.
- P18 يستبدل mocks بـSupabase (Providers + Repositories + تنفيذ الحذف + استعادة الجلسة + حفظ الصورة).
- نصوص Legal قوالب مؤقتة تحجب الإطلاق حتى مراجعة قانونية بشرية.

---

## 6) الخدمات المتصلة

> **لا شيء متصل.** لا مشروع Supabase، لا مزوّد دفع، لا تخزين سحابي، لا بريد، لا Push.
> وضع `backend` يعرض **Not Connected** بصدق مع إعادة محاولة عاملة.
> عند ربط أي خدمة يُضاف صف: الخدمة، ما يتصل بها، البيئة، طريقة التحقق، التاريخ، **من تحقق**.

---

## 7) الخدمات التجريبية

| الخدمة | الحالة | الوسم في الواجهة |
|--------|--------|------------------|
| MockAuthProvider (15 capability) | يعمل عبر نفس عقد الإنتاج | DemoBanner عام + Badge «بيانات تجريبية» |
| 12 Mock Providers + 16 Mock Repos | تعمل في وضع demo | Registry يعرض `mock` |
| OTP تجريبي | رمز حتمي معروض بوسم Demo | `auth:verify.demoCode` |
| جلسات/أجهزة | سجلات محلية `demo-device-N` | `auth:devices.demoNote` |
| صورة Avatar | رفع حقيقي إلى MockStorage (ذاكرة) | `profile:avatar.sessionNote` |
| عدّاد شارة الإشعارات | محلي (0 افتراضاً) | أداة Dev؛ المصدر الحقيقي P16 |
| شجرة locations | بيانات demo | `profile:locations.pending` |

**الشرطان محققان:** وسم واضح + المرور عبر نفس `Provider` المستخدم في الإنتاج (لا مسار موازٍ).

---

## 8) المشكلات المعروفة

| # | المشكلة | التأثير | الحالة | ملاحظات |
|---|---------|---------|--------|---------|
| 1 | قرارات `PRODUCT_POLICIES` غير معتمدة | تحجب P08/P10/P11/P15 + مدة الحذف | Open | قرارات بشرية. |
| 2 | `forceRTL` عند تبديل اللغة | — | **Closed (P05)** | ADR-0013. |
| 3 | أيقونات أصول التطبيق من قالب Expo | لا تعكس الهوية | Open | تُستبدل في P22/P23. |
| 4 | لا تحقق آلي من وجود ملفات الحوكمة | يدوي | Open | قائمة في `AGENT_RULES §6`. |
| 5 | ESLint مثبّت على 9.x | لا ميزات 10 | Accepted | ADR-0007. |
| 6 | `i18n-allow-arabic` في اختبار قديم | مقبول | Accepted | تنظيف P21. |
| 7 | `tsconfig.types = ["jest","node"]` | يُحدَّث عند الحاجة | Accepted | إعداد داخلي. |
| 8 | `populateDemoSeed` لا يغطي content/notifications/search | تحتاج factory param | Open | مؤجل بقرار المالك. |
| 9 | backend mode يستخدم mocks للـ16 repo | بيانات demo في backend | Accepted | يُصحَّح P18. |
| 10 | لا Developer Settings UI | — | **Closed (P05.3)** | شاشتا Dev + Integrations. |
| 11 | `RingProgress` بلا animation | تجربة أقل نعومة | Accepted | لم يُنفَّذ في P05/P06. |
| 12 | `BottomSheet` single-snap | لا نقاط متعددة | Accepted | P20 إن لزم. |
| 13 | `Tabs` غير scrollable | ≤5 تبويبات | Accepted | P07+ إن لزم. |
| 14 | `Avatar` initials فقط | — | **Closed (P06.2)** | خاصية `uri` + رفع فعلي. |
| 15 | Gallery متاح في الإنتاج | — | **Closed (P05.1)** | بوابة `(dev)`. |
| 16 | Reanimated mock ثابت في Jest | الحركة لا تُختبر آلياً | Accepted | ADR-0011؛ أجهزة + P21. |
| 17 | شارة الإشعارات بلا مصدر حقيقي | عدّاد محلي | Open | P16. |
| 18 | لا أدوار في `AuthUser` | — | **Closed (P06.1)** | أدوار اختيارية + حارس صريح. |
| 19 | شاشة Maintenance ثابتة | لا علم عن بُعد | Open | P18+. |
| 20 | الاتجاه الأصلي يكتمل بعد إعادة الفتح | لا مكتبة restart | Accepted | ملاحظة صادقة معروضة. |
| 21 | المصادقة Placeholder | — | **Closed (P06)** | تدفقات كاملة عبر Mock؛ backend صادق. |
| 22 | فاحص الأزرار regex-based | لا يغطي كل الأنماط | Accepted | ADR-0015. |
| 23 | الفاحص غير مضمّن في سكربت `lint` | خطوة CI مستقلة فقط | Open | يلزم `package.json` كامل. |
| 24 | أنماط اختبار React 19 / RNTL v14 | أخطاء متكررة إن تُجاهلت | Accepted | **دروس ملزمة** في `DEVELOPMENT_PROGRESS`. |
| 25 | لم يُجرَ تحقق يدوي على الأجهزة (P05+P06) | حركة/Blur/بصمة/EXIF/رجوع Android | Open | بقرار المالك؛ P20/P21. |
| 26 | رابط صورة Avatar غير دائم | يضيع بإعادة التشغيل | Open | Query cache فقط؛ الحفظ الدائم P18 (ADR-0020). |
| 27 | إزالة EXIF غير متحققة على جهاز | ادعاء خصوصية غير مُثبت | Open | إعادة الترميز تُزيله نظرياً؛ تحقق P20. |
| 28 | شجرة locations تجريبية | لا تُستخدم كمرجع رسمي | Open | موسومة `pending-human-review`. |
| 29 | الحذف مجدول لا منفَّذ + المدة غير معتمدة | لا مسح فعلي من الخادم | Open | ADR-0021؛ التنفيذ P18 + قرار بشري. |
| 30 | الجلسات تسميات محلية لا أجهزة حقيقية | لا إنهاء عن بُعد فعلي | Open | P18. |
| 31 | نصوص Legal قوالب مؤقتة | **تحجب الإطلاق** | Open | وسم مراجعة قانونية ظاهر. |
| 32 | **صفّا الأمان وحذف الحساب معطّلان في فهرس الإعدادات** رغم بناء الشاشتين | لا مدخل من الواجهة | Open | **يحتاج قرار المالك**: تحديث اختبار P06.2 أم إبقاؤهما معطّلين. |
| 33 | `SignInPlaceholder.tsx` مُبقى بلا استخدام | كود ميت مؤقت | Open | يُحذف مع اختباره في P07 (يلزم إرسال الاختبار). |
| 34 | سحب الموافقات الأساسية = حذف الحساب | مسار الحذف معطّل حالياً (#32) | Open | يُحل مع #32. |
| 35 | لا استعادة جلسة من SecureStore عند الإقلاع | يُعاد الدخول بعد كل إقلاع | Open | المزوّد التجريبي في الذاكرة؛ P18. |
| 36 | `zod` غير مُعلن في `package.json` | اعتماد على hoisting هشّ | Open | يُعلن صراحةً عند أول تعديل للحزم. |

---

## 9) الخطوة التالية

**P07 — Home:** لوحة رئيسية حقيقية (ملخصات + بلاطات + إجراءات سريعة) تقرأ من Repositories عبر TanStack Query، وتحترم دور المستخدم وحالة الضيف، مع حالات loading/empty/error/offline/notConnected لكل قسم.

**قبل بدء P07 مطلوب من المالك:**
1. **إشارة البدء** — لم تبدأ P07.
2. **قرار §8 #32**: هل أُحدّث اختبار فهرس الإعدادات ليعكس تفعيل صفّي الأمان والحذف (الموصى به، لأن الشاشتين مبنيّتان ومختبَرتان)، أم يبقيان معطّلين؟
3. `package.json` الكامل (لضم الفاحص لسكربت `lint` وإعلان `zod`).
4. إرسال `src/features/shell/__tests__/SignInPlaceholder.test.tsx` لحذف الكود الميت (#33).
5. تأكيد أن قرارات `PRODUCT_POLICIES` لا تحجب بلاطات الرئيسية (الإحصاءات العامة محجوبة بقرار #8).

**عند بدء P07 سيُطلب بالاسم:** `src/features/shell/ServicesScreen.tsx` · `src/components/shell/RoutePlaceholder.tsx` · `src/repositories/contracts/{application,donation,wedding,program}.ts` · `src/repositories/types.ts` (موجود) · `src/i18n/formatters.ts` · `src/locales/{ar,en}/home.json` · `app/(tabs)/index.tsx`.
