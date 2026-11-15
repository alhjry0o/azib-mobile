# PROJECT_CONTEXT — السياق الدائم لمشروع عازب | AZIB

> هذا الملف يُقرأ في بداية كل مرحلة. يُحدَّث في نهاية كل مرحلة قبل إعلانها Done.
> **عام المستودع:** لا أسرار، لا بيانات شخصية حقيقية.

آخر تحديث: P05 — Shell + Onboarding (مغلق — 2026-11-16).

---

## 1) القرارات التقنية

| القرار | القيمة المعتمدة | الحالة | المرجع |
|--------|------------------|--------|--------|
| مدير الحزم | npm | مُعتمد | `docs/DECISIONS.md#adr-0001` |
| إطار العمل | Expo + React Native + TypeScript (strict) + Expo Router | مُعتمد | HRD |
| حالة العميل | Zustand | مُعتمد (4 stores) | `docs/DECISIONS.md#adr-0002` |
| حالة الخادم | TanStack Query | مُعتمد ومُفعّل في P05 | `docs/DECISIONS.md#adr-0002` |
| النماذج والتحقق | React Hook Form + Zod | مُعتمد (RHF يُفعّل في P06) | HRD |
| الترجمة | i18next (لغة افتراضية `ar`, RTL) + حفظ اللغة | مُعتمد | ADR-0013 |
| الحركة | Reanimated + Gesture Handler | مُعتمد | HRD, ADR-0011 |
| الخادم | Supabase خلف Provider Abstraction | مُعتمد (غير مربوط حتى P18) | HRD |
| الاختبارات | Jest + RNTL، Playwright (Web E2E)، pgTAP (DB) | مُعتمد | HRD, ADR-0004 |
| CI | GitHub Actions + فاحص الأزرار الميتة | مُعتمد | ADR-0015 |
| التنقل | Expo Router + FloatingDock مخصص | مُعتمد | ADR-0012 |
| الروابط العميقة | `azib://` بقائمة سماح | مُعتمد | ADR-0014 |
| نموذج الأموال | Non-Custodial (لا محفظة، لا Escrow) | مُعتمد | ADR-0005 |
| تقييم الأهلية | Advisory فقط + مراجعة بشرية نهائية | مُعتمد | ADR-0006 |
| أسلوب 3D | ثلاث طبقات | مُعتمد | ADR-0003 |

---

## 2) إصدارات الأدوات

> المصدر الأساسي `package.json`. القيم `TBD` تُملأ من الملف الفعلي — **لا تخمين**.

| الأداة | الإصدار | مصدر التحقق | تاريخ |
|--------|---------|--------------|-------|
| Node.js | v26.13.0 | `node -v` (بتقرير المستخدم) | 2026-11-08 |
| npm | 12.2.1 | `npm -v` (بتقرير المستخدم) | 2026-11-08 |
| Expo SDK | ~58.0.25 | `package.json` | 2026-11-16 |
| React Native | 0.88.1 | `package.json` | 2026-11-08 |
| React | 19.3.0 | `package.json` | 2026-11-08 |
| React DOM | 19.3.0 | `package.json` | 2026-11-08 |
| expo-router | ~58.0.31 | `package.json` | 2026-11-16 |
| expo-constants | ~58.0.15 | `package.json` | 2026-11-08 |
| expo-linking | ~58.0.17 | `package.json` | 2026-11-16 |
| expo-status-bar | ~58.0.5 | `package.json` | 2026-11-16 |
| expo-font | ~58.0.12 | `package.json` | 2026-11-16 |
| expo-blur | ~58.0.6 | `package.json` | 2026-11-16 |
| expo-haptics | ~58.0.8 | `package.json` | 2026-11-16 |
| expo-localization | ~58.0.5 | `package.json` | 2026-11-16 |
| **expo-splash-screen** | **TBD** | أُضيف في P05 — بانتظار `package.json` محدث | — |
| **@react-native-community/netinfo** | **TBD** | أُضيف في P05 — بانتظار `package.json` محدث | — |
| **@tanstack/react-query** | **TBD** | أُضيف في P05 — بانتظار `package.json` محدث | — |
| **zod** | **TBD** | مستخدم في `env.ts`/`schemas`؛ غير ظاهر في النسخة المرسلة | — |
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
| jest-expo | ^58.0.14 | `package.json` | 2026-11-09 |
| @types/jest | ^30.0.0 | `package.json` | 2026-11-09 |
| @types/node | ^26.6.6 | `package.json` | 2026-11-09 |
| @testing-library/react-native | ^14.1.0 | `package.json` | 2026-11-16 |
| react-test-renderer | ^19.3.0 | `package.json` | 2026-11-16 |
| prettier | ^3.10.0 | `package.json` | 2026-11-16 |

**التحقق من التوافق (P05):** `npm run doctor` → **20/20 checks passed** (بتقرير المستخدم قبل بدء P05).

---

## 3) بنية المجلدات (الفعلية بعد P05)

```
azib-mobile/
├─ app/                          # Routes ONLY (Expo Router) — بلا منطق أعمال
│  ├─ _layout.tsx                # Providers + خطوط + Splash + Hosts + ErrorBoundary
│  ├─ index.tsx                  # Gate (Redirect فقط)
│  ├─ +not-found.tsx · maintenance.tsx
│  ├─ (onboarding)/ _layout + index
│  ├─ (auth)/ _layout + sign-in
│  ├─ (tabs)/ _layout + index + services + weddings + partners + account
│  ├─ (features)/ _layout + 9 شاشات ميزات
│  ├─ (staff)/ _layout (حارس دور) + index
│  └─ (dev)/ _layout (بوابة إنتاج) + index + integrations + gallery
├─ src/
│  ├─ components/
│  │  ├─ ui/                     # Design System (P04, 42 مكوّناً)
│  │  ├─ brand/                  # ArchHero, Qamariya, DoubleRing*, Hero3D, Glass, Glow
│  │  └─ shell/                  # FloatingDock, AnimatedSplash, Hosts, Banners,
│  │                             # AppErrorBoundary, RoutePlaceholder, GateLoading, ForbiddenView
│  ├─ features/
│  │  ├─ shell/                  # routing, deep-links, query-client, use-session,
│  │  │                          # use-shell-gate, use-offline-status, use-keyboard-visibility,
│  │  │                          # use-notifications-badge, use-language-switch,
│  │  │                          # LanguageBootstrap, DeepLinkGuard, GateScreen, TabsShell,
│  │  │                          # StaffLayoutGate, SignIn/Account/Services
│  │  ├─ onboarding/             # OnboardingFlow + steps/ (5 خطوات + InfoRow)
│  │  └─ dev/                    # DevSettingsScreen, IntegrationsScreen
│  ├─ stores/                    # app-mode · onboarding · shell · language
│  ├─ constants/routes.ts        # مصدر وحيد للمسارات + TABS
│  ├─ locales/{ar,en}/           # 15 namespace (منها onboarding)
│  ├─ hooks/ · theme/ · core/ · config/ · providers/ · repositories/ · schemas/
│  └─ i18n/                      # config, index, formatters, rtl
├─ mocks/seed/                   # Demo seed (dataOrigin='demo')
├─ scripts/                      # check-hardcoded-arabic.mjs · check-dead-buttons.mjs
├─ tests/__tests__/scripts/      # اختبارات الفاحصات (مجلد __tests__ بالداخل)
├─ docs/ · .github/workflows/ · supabase/ (P18)
└─ app.config.ts · eslint.config.js · jest.config.js · jest.setup.ts · tsconfig.json
```

**قواعد ثابتة:** Routes in `app/` only · Features in `src/features/` · لا منطق أعمال في `app/*.tsx` · **مجلد الاختبار اسمه `__tests__` دائماً** (بشرطتين سفليتين).

---

## 4) الوظائف المكتملة

| # | الوظيفة | المرحلة | ملاحظات |
|---|---------|---------|---------|
| 1 | ملفات الحوكمة (AGENT_RULES, DECISIONS, PRODUCT_POLICIES, GLOSSARY, ASSET_LICENSES, THREAT_MODEL) | P01 | وثائق فقط. |
| 2 | السياق الدائم (PROJECT_CONTEXT, DEVELOPMENT_PROGRESS, README) | P01 | جاهزة للتحديث. |
| 3 | مشروع Expo SDK 58 (TS strict, ESLint, Jest, CI) | P02 | CI أخضر 2026-11-09. |
| 4 | Core Platform (Result, AppError, logger, env, AppMode store) | P03 | يستهلكه كل ما بعده. |
| 5 | 12 Provider contracts + NotConnected stubs + Registry | P03 | ADR-0005/0006 محققة. |
| 6 | 12 Mock adapters + ProviderContainer | P03 | `dataOrigin='demo'`. |
| 7 | 16 Repository contracts + mocks + Contract tests | P03 | تُستبدل في P18. |
| 8 | i18n كامل + formatters + RTL helpers | P03 | 14 namespace آنذاك. |
| 9 | Demo seed framework + DemoBadge + NotConnectedScreen | P03 | populator يغطي 13/16. |
| 10 | Theme tokens + ThemeProvider + 4 hooks | P04 | WCAG AA verified. |
| 11 | Design System (42 مكوّناً) + Gallery + `docs/DESIGN_SYSTEM.md` | P04 | 565 اختباراً عند الإغلاق. |
| 12 | **شجرة المسارات الكاملة** (onboarding/auth/tabs/features/staff/dev + not-found/maintenance) | P05 | `src/constants/routes.ts` مصدر وحيد. |
| 13 | **Gate** (`resolveGate` نقية + `useShellGate` + `useSession` عبر Query) | P05 | Onboarding / Auth / Tabs / NotConnected / Error / Loading. |
| 14 | **FloatingDock** (5 خانات، الوسطى مميزة، حركة اختيار، Haptics، شارة، إخفاء الكيبورد، SafeArea، RTL) | P05 | ADR-0012. |
| 15 | **المضيفات العامة**: DialogHost + BottomSheetHost (فوق P04) + ToastProvider | P05 | منع تكدس Dialog+Sheet مفروض في المتجر. |
| 16 | **OfflineBanner** (NetInfo حقيقي) + **DemoBanner** (وضع demo فقط، قابل للإخفاء) | P05 | لا محاكاة اتصال. |
| 17 | **AppErrorBoundary** عام + **NotFound** + **Maintenance** | P05 | Fallback بتوكنز ثابتة (بلا hooks). |
| 18 | **Deep Links `azib://`** بقائمة سماح + حراس Layouts + إسقاط Query/Fragment | P05 | ADR-0014. |
| 19 | **حارس Staff** (deny-by-default حتى وصول الأدوار) + ForbiddenView | P05 | الواجهة ليست ضابط أمان؛ RLS في P18. |
| 20 | **AnimatedSplash** (قمرية + اتحاد حلقتين، تخطي دائم، بديل Reduce Motion) | P05 | بعد جاهزية الخطوط؛ `expo-splash-screen` الأصلي حتى الجاهزية. |
| 21 | **Onboarding خمس شاشات** (علامة/رسالة/مميزات/خصوصية/لغة) + تخطي دائم + حفظ الاكتمال | P05 | Parallax عبر Hero3D بحسب Tier. |
| 22 | **حفظ اللغة + LanguageBootstrap + forceRTL** عند التبديل والإقلاع | P05 | ADR-0013 — يغلق §8 #2. |
| 23 | **namespace `onboarding`** (ar/en) → الإجمالي 15 | P05 | `config.test.ts` حُدّث إلى 15. |
| 24 | **Developer Settings** (وضع/Tier/لغة/اهتزاز/شارة/روابط/إعادة ضبط Onboarding) | P05 | مخفية في الإنتاج. |
| 25 | **IntegrationsScreen** (12 مزوّداً من Registry + healthCheckAll حقيقي) | P05 | demo→connected، backend→error بصدق. |
| 26 | **بوابة `(dev)` للإنتاج** (تحمي Gallery أيضاً) | P05 | يقدّم ما كان مؤجلاً لـP22 — يغلق §8 #15. |
| 27 | **RoutePlaceholder موحّد** يذكر مرحلة البناء لكل قسم غير منفذ | P05 | لا أزرار شكلية. |
| 28 | **`scripts/check-dead-buttons.mjs`** + خطوة CI مستقلة | P05 | ADR-0015. |
| 29 | دخول/خروج Demo عامل عبر نفس `AuthProvider` + وسم Demo ظاهر | P05 | المصادقة الحقيقية في P06. |

> لا شيء آخر مكتمل. أي جدول آخر يبقى فارغاً حتى المرحلة المعنية.

---

## 5) غير المكتملة

- ابتداءً من **P06 (Auth/Profile/Settings/Legal)** حتى **P24 (Final Integration)**.
- شاشات الميزات كلها **Placeholders صادقة** تعرض مرحلة بنائها: الرئيسية P07، المساعدات P08، عرسنا واحد P10، الشركاء P11، سوق خير P12، وظائف/متطوعون P13، الحاسبة/الدليل P14، توعية P15، الإشعارات/البحث P16، لوحة الفريق P17.
- P18 سيستبدل mocks بـSupabase adapters (Providers + Repositories).
- لا أدوار فعلية بعدُ؛ حارس Staff يرفض الجميع افتراضياً.

---

## 6) الخدمات المتصلة

> لا شيء متصل. لا مشروع Supabase، لا مزوّد دفع، لا تخزين، لا بريد، لا Push.
> وضع `backend` يعرض **Not Connected** بصدق مع إعادة محاولة عاملة.
> عند ربط أي خدمة لاحقاً يُضاف صف هنا: الخدمة، ما يتصل بها، البيئة، طريقة التحقق، التاريخ، **من تحقق**.

---

## 7) الخدمات التجريبية

| الخدمة | الحالة | الوسم في الواجهة |
|--------|--------|------------------|
| MockAuthProvider (دخول/خروج Demo) | يعمل عبر نفس عقد الإنتاج | DemoBanner عام + Badge «بيانات تجريبية» في الدخول والحساب |
| 12 Mock Providers + 16 Mock Repos | تعمل في وضع demo | Registry يعرض `mock` في شاشة التكاملات |
| عدّاد شارة الإشعارات | عدّاد محلي فقط (افتراضي 0) | أداة Dev موسومة بصدق؛ المصدر الحقيقي في P16 |

**الشرطان محققان:** وسم واضح للمستخدم + المرور عبر نفس `Provider` المستخدم في الإنتاج (لا مسار موازٍ).

---

## 8) المشكلات المعروفة

| # | المشكلة | التأثير | الحالة | ملاحظات |
|---|---------|---------|--------|---------|
| 1 | قرارات `docs/PRODUCT_POLICIES.md` غير معتمدة | تحجب P08/P10/P11/P15 | Open | قرارات بشرية مطلوبة. |
| 2 | `I18nManager.forceRTL` غير مفعّل عند تبديل اللغة | — | **Closed (P05)** | `useLanguageSwitch` + `LanguageBootstrap` (ADR-0013). |
| 3 | أيقونات أصول التطبيق (icon/splash/adaptive) من قالب Expo | لا تعكس الهوية البصرية | Open | أيقونات الواجهة lucide (P04)؛ الأصول تُستبدل عند الهوية النهائية (P22/P23). |
| 4 | لا تحقق آلي من وجود ملفات الحوكمة | يدوي فقط | Open | قائمة تحقق في `AGENT_RULES §6`. |
| 5 | ESLint مثبّت على 9.x (ADR-0007) | لا ميزات ESLint 10 | Accepted | ADR بديل عند دعم `eslint-config-expo`. |
| 6 | `src/lib/__tests__/i18n.test.ts` يستخدم `i18n-allow-arabic` | مقبول (نص غير UI) | Accepted | تنظيف في P21. |
| 7 | `tsconfig.types = ["jest","node"]` | يُحدَّث عند إضافة بيئات | Accepted | إعداد داخلي. |
| 8 | `populateDemoSeed` لا يغطي content/notifications/search | تحتاج factory param | Open | **مؤجل بقرار المالك في P05**؛ لا تعديل على `repositories/container.ts`. |
| 9 | backend mode يستخدم mocks للـ16 repo حتى P18 | بيانات demo في وضع backend | Accepted | يُصحَّح في P18. |
| 10 | لا Developer Settings UI | — | **Closed (P05.3)** | شاشتا Dev + Integrations. |
| 11 | `RingProgress` بلا animation | تجربة أقل نعومة | Accepted | لم يُنفَّذ في P05؛ يبقى مؤجلاً. |
| 12 | `BottomSheet` single-snap فقط | لا نقاط توقف متعددة | Accepted | P20 إن لزم. |
| 13 | `Tabs` غير scrollable | ≤5 تبويبات | Accepted | P07+ إن لزم. |
| 14 | `Avatar` initials فقط | لا صور مستخدم | Open | P06 (رفع الملفات). |
| 15 | Gallery متاح في الإنتاج | — | **Closed (P05.1)** | بوابة `(dev)/_layout` → NotFound في الإنتاج. |
| 16 | اختبارات Reanimated تستخدم mock ثابت (ADR-0011) | الحركة الحقيقية لا تُختبر في Jest | Accepted | E2E في P21 + أجهزة. |
| 17 | شارة الإشعارات بلا مصدر حقيقي | العدّاد محلي (0 افتراضاً) | Open | يُربط في P16 عبر `setUnreadNotifications`. |
| 18 | لا حقل أدوار في `AuthUser` | حارس Staff يرفض الجميع | Open | تمديد العقد في P06/P17 (يحتاج ADR). |
| 19 | شاشة Maintenance ثابتة | لا علم تشغيل عن بُعد | Open | تُربط بإعدادات/علم في P18+. |
| 20 | انعكاس الاتجاه الأصلي يكتمل بعد إعادة فتح التطبيق | لا مكتبة restart | Accepted | ملاحظة صادقة في شاشة اللغة والإعدادات. |
| 21 | المصادقة Placeholder (Demo فقط) | لا حساب حقيقي | Open | P06. |
| 22 | فاحص الأزرار الميتة regex-based | لا يغطي كل الأنماط (جسم تعليق فقط مثلاً) | Accepted | استثناءات موثقة: Gallery و`__tests__` (ADR-0015). |
| 23 | الفاحص غير مضمّن في سكربت `lint` | يعمل عبر خطوة CI مستقلة فقط | Open | يُضم عند توفر `package.json` محدث. |
| 24 | أنماط اختبار React 19 + تسمية المجلدات | أخطاء متكررة إن تُجاهلت | Accepted | **دروس ملزمة**: `override`، `tabBar` prop مباشر، دمج الاستيرادات، `await renderHook`، `act` حول `fireEvent`، ومجلد `__tests__` دائماً. |

---

## 9) الخطوة التالية

**P06 — Auth / Profile / Settings / Legal:**
- مصادقة حقيقية عبر `AuthProvider` (mock في demo، وNot Connected صادق في backend حتى P18) بدل Placeholder الدخول.
- إدارة الجلسة (تسجيل/خروج/تحديث) وربطها بـGate بدل الاعتماد على دخول Demo فقط.
- الملف الشخصي: إنشاء/تعديل عبر `ProfileRepository` + Zod + React Hook Form.
- صور Avatar (رفع عبر `FileStorageProvider`) — يغلق §8 #14.
- الإعدادات (لغة/إشعارات/خصوصية) وصفحات Legal من `locales/*/legal.json`.
- أساس الأدوار لتمكين حارس Staff لاحقاً — يغلق §8 #18 تدريجياً.

**قبل بدء P06 مطلوب من المالك:**
1. إرسال `package.json` محدثاً (أو قيم الإصدارات الأربع `TBD` في §2).
2. موافقة على تمديد عقد `AuthUser` بحقل أدوار (تغيير عقد يستوجب ADR جديداً).
3. تأكيد أن قرارات `PRODUCT_POLICIES` (مدة الاحتفاظ) لا تحجب شاشات الخصوصية في P06.
