# PROJECT_CONTEXT — السياق الدائم لمشروع عازب | AZIB

> هذا الملف يُقرأ في بداية كل مرحلة. يُحدَّث في نهاية كل مرحلة قبل إعلانها Done.
> **عام المستودع:** لا أسرار، لا بيانات شخصية حقيقية.

آخر تحديث: **P11 — Partner Marketplace, Contribution System & Ambassadors (مغلقة رسمياً — 2026-11-26).**
CI أخضر بالكامل: **231/231 suites · 1396/1396 tests** · lint وtypecheck نظيفان (بتقرير المالك).

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
| عقدا التمويل | تمديد إضافي + `advance` | مُعتمد | ADR-0033 |
| الفصل الرباعي | Intent / Provider / Verified / Disbursement | مُعتمد | ADR-0034 |
| مزوّد Demo Payment | `providers/mock/` + لا تأكيد مُختَرع | مُعتمد | ADR-0035 |
| أنواع البرامج | `Program.kind?` + قرض حسن إحالة فقط | مُعتمد | ADR-0036 |
| Idempotency | مفتاح حتمي مشتق | مُعتمد | ADR-0037 |
| الضبط المزدوج للصرف | Maker≠Checker + حد تراكمي + إثبات | مُعتمد | ADR-0038 |
| تقرير الأثر | real+verified فقط + حجب | مُعتمد | ADR-0039 |
| مستودعات المجموعة | تمديد Wedding + 4 مستودعات ⇒ 20 | مُعتمد | ADR-0040 |
| البث اللحظي | `subscribe` محلي في المستودع | مُعتمد | ADR-0041 |
| مسار الأعراس | التبويب Discovery · بلا `index.tsx` | مُعتمد | ADR-0042 |
| تقسيم التكاليف | محرك نقي + Largest Remainder | مُعتمد | ADR-0043 |
| سقف المجموعة | من `system_settings` + افتراض مؤقت | مُعتمد | ADR-0044 |
| التصويت | نصاب صحيح + كسر تعادل معلن | مُعتمد | ADR-0045 |
| الدردشة | فرض في الخدمة + احتفاظ محدود | مُعتمد | ADR-0046 |
| طلبات الخدمة | عروض كاقتراحات · بلا دفع ولا تتبّع | مُعتمد | ADR-0047 |
| Confetti | داخلي · للإنجاز فقط | مُعتمد | ADR-0048 |
| مسار الاعتماد | open→planning→agreed كاملاً | مُعتمد | ADR-0049 |
| الإسقاط العام | شهر لا يوم · ولا حلقات لغير الأعضاء | مُعتمد | ADR-0050 |
| **مستودعات السوق** | **تمديد Partner/Offer + 4 مستودعات ⇒ 24** | **مُعتمد** | **ADR-0051** |
| **شارة التوثيق** | **من سجل التحقق فقط + النشر مشروط بسجل ساري** | **مُعتمد** | **ADR-0052** |
| **مسار السوق** | **التبويب Browser · بلا `index.tsx`** | **مُعتمد** | **ADR-0053** |
| **الروابط الخارجية** | **قائمة سماح + تأكيد قبل المغادرة + وحدة حدودية** | **مُعتمد** | **ADR-0054** |
| **الانتهاء وإعادة التحقق** | **من `validUntil`/`system_settings` · العميل لا يكتب** | **مُعتمد** | **ADR-0055** |
| **إحصاءات السوق** | **تجميعية بلا هويات + إعادة استخدام الحجب** | **مُعتمد** | **ADR-0056** |
| **صلاحيات السفير** | **deny-list صريحة + غياب القدرة في التبعيات** | **مُعتمد** | **ADR-0057** |
| **الفئة المستفيدة** | **`beneficiaries` مؤقتاً · غير المعتمد مرفوض** | **مُعتمد** | **ADR-0058** |
| **رفع وسائط السوق** | **إعادة استخدام خط P08 + حدود مستقلة** | **مُعتمد** | **ADR-0059** |
| **ترتيب الآلة** | **الفحص قبل الكتابة في كل خدمات السوق** | **مُعتمد** | **ADR-0060** |
| نموذج الأموال | Non-Custodial | مُعتمد | ADR-0005 |
| تقييم الأهلية | Advisory فقط + مراجعة بشرية | مُعتمد | ADR-0006 |
| أسلوب 3D | ثلاث طبقات | مُعتمد | ADR-0003 |
| الاختبارات | Jest + RNTL v14 (async) · Playwright · pgTAP | مُعتمد | ADR-0004 |
| CI | GitHub Actions + فاحص الأزرار الميتة | مُعتمد | ADR-0015 |
| الروابط العميقة | `azib://` بقائمة سماح + بادلات | مُعتمد | ADR-0014 |

---

## 2) إصدارات الأدوات

> المصدر `package.json` + تقارير المالك. **لا قيم TBD.** **لا تبعيات جديدة في P11** (`expo-linking` موجود؛ `Image`/`Share` من react-native).

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

## 3) بنية المجلدات (الفعلية بعد P11)

```
azib-mobile/
├─ app/                          # Routes ONLY — بلا منطق أعمال
│  ├─ _layout · index(Gate) · +not-found · maintenance
│  ├─ (onboarding)/ · (auth)/ 6 · (tabs)/ 5 · (features)/ 8 · (staff)/
│  ├─ (dev)/ index · integrations · auth · assistance · finance · partners · gallery
│  ├─ profile/ index · edit
│  ├─ settings/ 13 شاشة
│  ├─ legal/ [doc]
│  ├─ assistance/ index · conditions · pre-check · new · mine · [id]/4
│  ├─ programs/ index · [id] · kind/[kind] · donate/[id] · donations ·
│  │            receipts · disbursements · impact · provider-requirements
│  ├─ weddings/ new · [id]/9
│  └─ partners/                  # جديد في P11 — بلا index.tsx (ADR-0053)
│     ├─ register · dashboard · ambassador · saved
│     ├─ offers/ new · [offerId] · edit/[offerId]
│     └─ [id]/ index · offers
├─ src/
│  ├─ components/{ui,brand,shell}/
│  ├─ features/
│  │  ├─ shell/ · onboarding/ · auth/ · profile/ · settings/ · legal/
│  │  ├─ home/ · assistance/ · finance/ · weddings/
│  │  ├─ partners/               # جديد في P11
│  │  │  ├─ state/               # partner-machine · offer-machine ·
│  │  │  │                       # verification · expiry · permissions
│  │  │  ├─ lib/                 # phone · external-links · categories ·
│  │  │  │                       # stats · filters
│  │  │  ├─ config/              # limits (audience + reverification + media)
│  │  │  ├─ schemas/             # offer · registration
│  │  │  ├─ services/            # external-actions · engagement · media ·
│  │  │  │                       # registration · verification ·
│  │  │  │                       # offer-lifecycle · ambassador
│  │  │  ├─ hooks/               # browser · profile · offer-detail ·
│  │  │  │                       # offer-actions · saved · registration ·
│  │  │  │                       # my-partner · offer-composer · ambassador
│  │  │  ├─ components/          # PartnerScaffold · VerifiedCrown ·
│  │  │  │                       # DiscountValue · ValidityCountdown ·
│  │  │  │                       # PartnerCard · OfferCard · ReportOfferForm ·
│  │  │  │                       # VerificationStatusBadge · OfferStatusBadge ·
│  │  │  │                       # MediaUploadField
│  │  │  └─ screens/             # 9 شاشات
│  │  └─ dev/                    # DevSettings · Integrations · DevAuth ·
│  │                             # DevAssistance · DevFinance · DevPartners · demo-seed
│  ├─ repositories/              # 24 مستودعاً (16 + 4 للمجموعة + 4 للسوق)
│  ├─ stores/                    # 7 stores
│  ├─ constants/routes.ts · locales/{ar,en}/ (15 ns)
│  ├─ schemas/                   # + notification · partner/offer موسّعة
│  └─ hooks/ theme/ core/ config/ providers/ i18n/
├─ mocks/seed/                   # + locations · assistance · wedding-planning ·
│                                #   partner-marketplace (مستقلة)
├─ scripts/ · tests/__tests__/scripts/
└─ docs/                         # + INTEGRATIONS · ELIGIBILITY_ENGINE ·
                                 #   FINANCE_ARCHITECTURE · COST_SHARING
```

**قواعد ثابتة:** Routes in `app/` only · Features in `src/features/` · **`__tests__` دائماً** · واجهات Expo في وحدات حدودية · **مكوّنات الميزة تُستورد بمسارها النسبي لا من برميل `components/ui`** · كل Hook قبل أي `return` مبكر · **الآلة قبل الكتابة**.

---

## 4) الوظائف المكتملة

| # | الوظيفة | المرحلة | ملاحظات |
|---|---------|---------|---------|
| 1–11 | الحوكمة · Expo SDK 58 · Core Platform · Providers · Repos · i18n · Seed | P01–P03 | بلا تغيير عقود. |
| 12–19 | Theme + 42 مكوّناً + Gallery + `DESIGN_SYSTEM.md` | P04 | 565 اختباراً. |
| 20–29 | المسارات · Gate · Dock · Hosts · Banners · ErrorBoundary · Deep Links · Splash · Onboarding · Dev + فاحص الأزرار | P05 | ADR-0012…0015. |
| 30–37 | عقد Auth (5 دوال) · Mock · State Machine · TokenVault · 6 شاشات · OTP · الضيف · الأدوار | P06.1 | ADR-0016…0018. |
| 38–44 | الملف الشخصي · التسلسل الجغرافي · الصورة · Avatar `uri` · Module 20 · الموافقات · الخروج | P06.2 | ADR-0019/0020. |
| 45–52 | عقد Auth (→15) · كلمة المرور · الجلسات · البيومتري · الحذف · التصدير · Legal · `INTEGRATIONS.md` | P06.3 | ADR-0021/0022. |
| 53–64 | HomeConfig · Header/Hero/QuickActions · 4 أقسام · كتل الأدوار · التخصيص · أداة تعبئة Demo | P07.1 | ADR-0023. |
| 65–68 | بوابة الموافقة · التعقيم · إخفاء الأعداد والمبالغ · فصل Demo/Real · 4 أقسام حساسة | P07.2 | ADR-0024…0026. |
| 69–76 | عقد Application (13 حالة) · payload · القواعد · المحرك النقي · آلة الحالات · الخدمات · seed | P08.1 | ADR-0027/0028. |
| 77–82 | document-pipeline · مسودة · Wizard 8 خطوات · submission · نقل المسار · 3 شاشات | P08.2 | ADR-0029…0031. |
| 83–88 | طلباتي · الخط الزمني · الاستكمال · القرار · الاعتراض · محاكي المراجعة · ربط قسم الدعم | P08.3 | ADR-0032. |
| 89–99 | عقدا التمويل · مخططات · آلتان · حراس · Demo Payment · Idempotency · إيصال · أثر · تدقيق · خدمتان | P09.1 | ADR-0033…0039. |
| 100–103 | كتالوج الأنواع · الكتالوج/التفاصيل/النوع/المتطلبات · نية التبرع · تبرعاتي/الإيصالات | P09.2 | — |
| 104–107 | سجل صرف المستفيد · تقرير الأثر · محاكي Maker/Checker · مسارات `programs/**` | P09.3 | — |
| 108–118 | تمديد Wedding · 4 مستودعات · Notification.create · المحرك · Largest Remainder · أثر الانسحاب · الآلة · التصويت · الموافقات · الدردشة · seed | P10.1 | ADR-0040…0046. |
| 119–122 | Discovery · Wizard الإنشاء · الأعضاء/الطلبات/الدعوات · واجهة التصويت | P10.2 | ADR-0042/0044. |
| 123–128 | الميزانية بنسخ · الموافقات/الاعتماد/الاتفاق · طلبات الخدمة · الدردشة المفروضة · العد التنازلي/الإتمام · الإشعارات/المسارات | P10.3 | ADR-0047…0050. |
| 129 | **تمديد `Partner` إضافةً**: 6 حالات + `ownerId`/منطقة/جهات اتصال/صور/شروط + مؤشرات التحقق | P11.1 | ADR-0051؛ `crud.contract` لم يُمسّ. |
| 130 | **تمديد `Offer` إضافةً**: 7 حالات + `discountType`/`discountValue`/`audience`/منتجات/شروط/صلاحية/صور | P11.1 | `discountPercent` محفوظ للمستهلكين القدامى. |
| 131 | **4 مستودعات جديدة**: Verification · OfferReport · Engagement · Ambassador ⇒ **24** | P11.1 | ADR-0051. |
| 132 | **آلتا الحالة النقيتان**: الشريك 6/10 · العرض 7/8 · فحص الفاعل · `cancelled` نهائية | P11.1 | كل غير معلن مرفوض استقصائياً. |
| 133 | **الشارة من سجل التحقق فقط** (`isVerified`) + **النشر مشروط بسجل ساري** | P11.1/3 | ADR-0052. |
| 134 | **تنظيف الأرقام اليمنية** + قائمة السماح الخارجية + تأكيد قبل واتساب/الخرائط | P11.1/2 | ADR-0054. |
| 135 | **صلاحيات السفير**: deny-list صريحة + غياب القدرة في التبعيات | P11.1/3 | ADR-0057. |
| 136 | **إحصاءات مشاهدات تجميعية** بلا هويات + حجب دون الحد | P11.1 | ADR-0056. |
| 137 | **`audience` مؤقت** (`beneficiaries` فقط) + **إعادة تحقق 365 يوماً** من `system_settings` | P11.1 | ADR-0055/0058. |
| 138 | **seed موسوم**: «شريك تجريبي» + خصم `placeholder` + `partner-marketplace` مستقل | P11.1 | لا هواتف في الحزمة (اختبار PII). |
| 139 | **Browser** بفلاتر نص/14 فئة/منطقة/موثّق فقط + بطاقات + تاج عند التحقق | P11.2 | ADR-0053. |
| 140 | **ملف الشريك · قائمة العروض · تفاصيل العرض** (قيمة/منتجات/شروط/عدّاد صلاحية/طريقة الاستفادة) | P11.2 | — |
| 141 | **اتصال `tel:` · واتساب بتأكيد · خرائط · مشاركة · حفظ · بلاغ** | P11.2 | ADR-0054. |
| 142 | **تسجيل الشريك** + مستندات تحقق خاصة ⇒ `pending_verification` | P11.3 | ADR-0059. |
| 143 | **لوحة الشريك**: عروضي/حالات/تعديل/تجديد/إلغاء + إحصاءات + إعادة تقديم المستندات | P11.3 | الزر صار مربوطاً برافع مستندات. |
| 144 | **تقديم/تعديل العرض → مراجعة → نشر → انتهاء → تجديد → إلغاء** | P11.3 | ADR-0060. |
| 145 | **السفراء**: طلب · موافقة · مهام بالمناطق المعتمدة · صور نشاط | P11.3 | ADR-0057. |
| 146 | **محاكي الشركاء `(dev)`** + ربط الأعراس قراءة فقط + المسارات/Allowlist | P11.3 | ADR-0047/0053. |

> لا شيء آخر مكتمل. أي جدول آخر يبقى فارغاً حتى المرحلة المعنية.

---

## 5) غير المكتملة

- **P12 (Souk)** حتى **P24**.
- شاشات الميزات المتبقية Placeholders صادقة: سوق خير P12، وظائف/متطوعون P13، الحاسبة/الدليل P14، توعية P15، الإشعارات/البحث P16، لوحة الفريق P17.
- **لا مراجعة إدارية حقيقية** للشركاء/العروض قبل P17 — المحاكي في `(dev)` فقط.
- **صور الشركاء ومستندات التحقق** في MockStorage (ذاكرة) ⇒ لا صمود ولا RLS حتى P18.
- **الحفظ والمشاهدات** محلية على الجهاز ⇒ لا مزامنة عبر أجهزة حتى P18.
- **العروض غير النسبية** تظهر 0% في الرئيسية واقتراحات الميزانية (§8 #71).
- P18 يستبدل mocks بـSupabase + RLS على مستندات التحقق/Bلاغات/مهام السفير.

---

## 6) الخدمات المتصلة

> **لا شيء متصل.** لا مشروع Supabase، لا مزوّد دفع مرخّص، لا تخزين سحابي، لا بريد، لا Push.
> وضع `backend` يعرض **Not Connected** بصدق. **قيد:** `WeddingChatApi` بلا `refetch` (§8 #66).
> عند ربط أي خدمة يُضاف صف: الخدمة، ما يتصل بها، البيئة، طريقة التحقق، التاريخ، **من تحقق**.

---

## 7) الخدمات التجريبية

| الخدمة | الحالة | الوسم في الواجهة |
|--------|--------|------------------|
| MockAuthProvider (15 capability) | يعمل عبر نفس عقد الإنتاج | DemoBanner + Badge |
| 12 Mock Providers + **24 Mock Repos** | تعمل في وضع demo | Registry يعرض `mock` |
| OTP · جلسات/أجهزة · صورة Avatar | تجريبية موسومة | نصوصها الخاصة في كل namespace |
| أداة تعبئة الرئيسية | تنشر وتربط عبر العقود، يدوياً | `home:dev.*` |
| إحصاءات الرئيسية | دلو demo فقط، محجوب دون الحد | `home:sections.community-stats.demoOnly` |
| طلب مساعدة · رقم مرجعي · بصمة مستند | تجريبية موسومة | `assistance:*` |
| Demo Payment · نية تبرع · إيصال | لا حركة أموال ولا إيصال رسمي | `CertaintyBadge` + `receipts.demoNote` |
| صرف تجريبي · محاكي Maker/Checker | `(dev)` فقط | شارة Demo |
| مجموعات الأعراس · الدردشة · Confetti | عبر نفس العقود | شارة Demo + ملاحظة الاحتفاظ |
| **شركاء تجريبيون** | 4 في الحزمة + إنشاء من التسجيل | **«شريك تجريبي»** على كل بطاقة |
| **عروض تجريبية** | قيم الخصم **placeholder** موسومة | `marketplace:discount.placeholder` |
| **مستندات تحقق تجريبية** | MockStorage ذاكرة · للمراجعين فقط | `marketplace:media.privateNote` |
| **مشاهدات/حفظ** | تجميعية محلية · محجوبة دون الحد | `marketplace:detail.viewsSuppressed` |
| **محاكي الشركاء** | `(dev)/partners` فقط | شارة Demo + ملاحظة النطاق |
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
| 4 | سياسة الانسحاب من العرس | 30 يوماً استُخدمت مؤقتاً | Open | حجب P10 مرفوع؛ الاعتماد معلّق. |
| 5 | استثناء «مساعدة واحدة» | مغلق مؤقتاً | Open | قرار بشري. |
| 6 | **فئة خصومات الشركاء** | **`beneficiaries` استُخدمت مؤقتاً في P11** | Open | **حجب P11 مرفوع**؛ الاعتماد النهائي معلّق. |
| 7 | مدة الاحتفاظ + فترة الحذف + احتفاظ الدردشة | 30 يوماً مؤقتة | Open | تشمل مستندات التحقق والبلاغات. |
| 8 | الحد الأدنى لإخفاء الإحصاءات | 10 مؤقت | Open | يحجب P15/P17؛ مُعاد استخدامه في السوق. |
| 9 | `forceRTL` عند تبديل اللغة | — | **Closed (P05)** | ADR-0013. |
| 10 | أيقونات أصول التطبيق من قالب Expo | لا تعكس الهوية | Open | P22/P23. |
| 11 | لا تحقق آلي من وجود ملفات الحوكمة | يدوي | Open | `AGENT_RULES §6`. |
| 12 | ESLint مثبّت على 9.x | لا ميزات 10 | Accepted | ADR-0007. |
| 13 | `i18n-allow-arabic` في اختبار قديم | مقبول | Accepted | تنظيف P21. |
| 14 | `populateDemoSeed` لا يغطي content/notifications/search ولا مستودعات P10/P11 | لا بذرة تلقائية للمجموعة/السوق | Open | `Notification.create` موجود لكن الـpopulator لم يُربط. |
| 15 | backend mode يستخدم mocks للـ24 repo | بيانات demo في backend | Accepted | يُصحَّح P18. |
| 16 | `RingProgress` بلا animation | تجربة أقل نعومة | Accepted | لم يُنفَّذ في P05–P11. |
| 17 | `BottomSheet` single-snap | لا نقاط متعددة | Accepted | P20 إن لزم. |
| 18 | `Tabs` غير scrollable | ≤5 تبويبات | Accepted | السوق استخدم ScrollView أفقياً للـChips. |
| 19 | اختبارات Reanimated mock ثابت | الحركة لا تُختبر آلياً | Accepted | ADR-0011. |
| 20 | شارة الإشعارات بلا مصدر حقيقي | عدّاد محلي | Open | P16. |
| 21 | شاشة Maintenance ثابتة | لا علم عن بُعد | Open | P18+. |
| 22 | الاتجاه الأصلي يكتمل بعد إعادة الفتح | لا مكتبة restart | Accepted | ملاحظة صادقة. |
| 23 | فاحص الأزرار regex-based | لا يغطي كل الأنماط | Accepted | ADR-0015. |
| 24 | الفاحص غير مضمّن في سكربت `lint` | خطوة CI مستقلة فقط | Open | يلزم `package.json` كامل. |
| 25 | أنماط اختبار React 19 / RNTL v14 | أخطاء متكررة إن تُجاهلت | Accepted | دروس ملزمة. |
| 26 | **لم يُجرَ تحقق على الأجهزة (P05–P11)** | حركة/Blur/بصمة/EXIF/رفع/Confetti/**tel:/wa.me/الخرائط** | Open | بقرار المالك؛ P20/P21. |
| 27 | رابط صورة Avatar غير دائم | يضيع بإعادة التشغيل | Open | P18. |
| 28 | إزالة EXIF غير متحققة على جهاز | ادعاء خصوصية غير مُثبت | Open | P20؛ يشمل وسائط السوق. |
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
| 40 | AppendOnly بلا انتقال | — | **Closed (P09)** | `advance` أُضيف. |
| 41 | `ContentRepository` ReadOnly | مستودع القصص فارغ | Open | P15/P18. |
| 42 | **لا ربط حساب↔شريك** | — | **Closed (P11)** | `Partner.ownerId` + التسجيل + اللوحة. |
| 43 | المتطوعون تسجيلات لا مهام | قسم المتطوع محدود | Open | P13. |
| 44 | مبالغ البرامج غير معروضة في المبادرات | معلومات ناقصة | Open | حتى اعتماد #1. |
| 45 | Carousel RTL + fallback الكسل | سلوك غير متحقق | Open | أجهزة + P20/P21. |
| 46 | انحراف صيغة مفاتيح i18n | كسر اختبارين في P07.2 | Accepted | درس مُلزِم. |
| 47 | `DESIGN_SYSTEM.md` أسطر قديمة | — | **Closed (P07)** | صُحّح. |
| 48 | فئة الحاجة غير مجموعة في payload | بطاقة الدعم بتسمية عامة | Open | P15/P18. |
| 49 | `AuditRepository` بلا فلتر `target` | الخط الزمني client-side | Open | P18. |
| 50 | انتقالات سير العمل غير ذرّية | فشل جزئي يفصل الحالة عن البيانات | Open | يشمل الطلب والصرف والمجموعة والسوق؛ P18. |
| 51 | بصمة المستند وصفية | إعادة التسمية تُفلت | Open | محتوى + HMAC في P18. |
| 52 | PDF بلا معالجة | بيانات وصفية قد تبقى | Accepted | معلن بصدق؛ يشمل مستندات الشركاء. |
| 53 | الرقم المرجعي من المزوّد التجريبي | ليس رسمياً | Open | P18. |
| 54 | الاستكمال يعدّل 4 أرقام + مستندات + ملاحظة | تحرير محدود | Open | P17/P18. |
| 55 | محاكي مراجعة الطلبات بديل مؤقت | لا صلاحيات فعلية | Open | P17 + RLS P18. |
| 56 | `Date.now()` في نافذة الاعتراض | يحتاج `eslint-disable purity` | Accepted | نمط موثّق. |
| 57 | لا مزوّد دفع مرخّص ولا Webhook | `verified` غير قابل للوصول في الخادم | Open | P18. |
| 58 | إحصاءات الرئيسية تقرأ `confirmed` القديمة | لا تتحدّث مع `verified` | Open | توحيد في P15/P18. |
| 59 | محاكي Maker/Checker بديل مؤقت | لا فصل مراجعين بصلاحيات | Open | P17. |
| 60 | `Program.kind` غائب في الـseed | كل البرامج `grant` افتراضاً | Open | P18. |
| 61 | القرض الحسن بلا جهة إحالة مربوطة | معلومات فقط | Open | يعتمد على #11. |
| 62 | تقرير الأثر فارغ في Demo | لا أرقام للمستخدم | **Accepted** | مقصود (ADR-0039). |
| 63 | الإيصال تجريبي غير رسمي | لا يصلح مستنداً مالياً | Open | P18. |
| 64 | الانسحاب في نمط `custom` | يحتاج إعادة إعلان الحصص | Open | قرار بشري (#12). |
| 65 | `chat-unmute` يرفع أول كتم فقط | كتم متعدد لا يُدار بالكامل | Open | P17/P18. |
| 66 | `WeddingChatApi` بلا `refetch` | NotConnected بلا إعادة محاولة | Open | يُصلَح في P12. |
| 67 | مفتاح `budget.errors.INVALID_TOTAL` ناقص | يُعرض المفتاح الخام | Open | يُضاف في P12. |
| 68 | `styles` الميت في `GroupBudgetScreen` | كود ميت تجميلي | Accepted | `void styles.spacer;` بعد P11.3. |
| 69 | الميزانية/الموافقات/الدردشة في الذاكرة | لا حفظ دائم ولا RLS | Open | P18. |
| 70 | قيم تشغيلية مؤقتة للمجموعة | سقف 12 · نصاب >50% · معدل 5/10s | Open | موسومة؛ بانتظار المالك. |
| 71 | **الرئيسية واقتراحات الميزانية تعرضان `discountPercent` فقط** | العروض غير النسبية (fixed/gift/service) تظهر **0%** | Open | توحيد العرض مع `discountType` في P12/P15. |
| 72 | **صور الشركاء ومستندات التحقق في MockStorage** | لا صمود ولا عزل وصول فعلي | Open | RLS + تخزين دائم P18. |
| 73 | **الحفظ والمشاهدات محلية** | لا مزامنة عبر أجهزة | Open | P18. |
| 74 | **محاكي الشركاء بديل عن لوحة P17** | لا صلاحيات ولا فصل مراجعين | Open | P17. |
| 75 | **إعادة التحقق الدورية 365 يوماً مؤقتة** | مدة غير معتمدة | Open | قرار بشري (#13). |
| 76 | **أكواد أخطاء السوق الجديدة بلا خرائط i18n مخصصة** | `authErrorKey` يعيد مفتاحاً عاماً لبعضها | Open | استكمال الخرائط في P17. |
| 77 | **`DevPartnersScreen` لا ينشئ شريكاً داخل الشاشة** | اختبارات المحاكي تغطي الفراغ/الوضع فقط؛ الانتقالات مغطّاة في اختبارات الخدمات | Accepted | تغطية أوسع في P17/P21. |

---

## 9) الخطوة التالية

**P12 — Souk (سوق خير).** غير محجوبة بقرار بشري: التبرعات **عينية فقط**، لا دفع داخلي ولا تتبّع مالي (ADR-0005).

**نطاق P12 المتوقع:** كتالوج الأصناف العينية بالفئات والمناطق · عرض/طلب/حجز/تسليم · حالات الصنف · ربط نوع `in_kind` من كتالوج البرامج · صور الأصناف عبر خط الرفع المُعاد استخدامه · خصوصية المتبرع والمستفيد · لا أسعار ولا مدفوعات.

**قبل بدء P12 مطلوب من المالك:**
1. **إشارة البدء** — لم تبدأ P12.
2. تنفيذ **#33** + حذف `SignInPlaceholder` (#34).
3. `package.json` الكامل (لضم الفاحص لـ`lint` وإعلان `zod`).
4. قرار بشأن **#71** (توحيد عرض الخصم غير النسبي) — الآن أو في P15.
5. إصلاحات صغيرة معلنة: **#66** (`refetch` للدردشة) · **#67** (مفتاح ناقص) · **#65** (رفع الكتم المتعدد).

**عند بدء P12 سيُطلب بالاسم:** `src/schemas/souk.ts` · `src/repositories/mock/souk.ts` · `src/repositories/mock/__tests__/souk.test.ts` · `src/locales/{ar,en}/souk.json` · `src/features/shell/AccountPlaceholder.tsx` (نسختك الحالية إن لزم مدخل جديد).
