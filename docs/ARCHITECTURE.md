# ARCHITECTURE — عازب | AZIB

> يوثّق هذا الملف البنية التقنية الحالية بعد **P05 (Shell + Onboarding)**.
> **عام المستودع:** لا أسرار ولا بيانات شخصية.

---

## 1) نظرة عامة

```
┌──────────────────────────────────────────────────────────┐
│  app/ (Routes only)                                      │
│  _layout · index(Gate) · (onboarding) (auth) (tabs)      │
│  (features) (staff) (dev) · +not-found · maintenance     │
└───────────────────────┬──────────────────────────────────┘
                        │ يركّب فقط — بلا منطق أعمال
┌───────────────────────▼──────────────────────────────────┐
│  src/features/{shell,onboarding,dev}                     │
│  + src/components/shell (Dock, Splash, Hosts, Banners…)  │
└───────────────────────┬──────────────────────────────────┘
                        │ useSession() / useShellGate() (TanStack Query)
┌───────────────────────▼──────────────────────────────────┐
│  ProviderContainer (React context)                       │
│  ├─ 12 Provider Interfaces                               │
│  ├─ RepositoryContainer (16 repos)                       │
│  └─ IntegrationRegistry                                  │
└───────────────────────┬──────────────────────────────────┘
                        │ adapter selection (by AppMode)
┌───────────────────────▼──────────────────────────────────┐
│  Adapters: mock | not-connected | (supabase P18)         │
└───────────────────────┬──────────────────────────────────┘
┌───────────────────────▼──────────────────────────────────┐
│  src/core: Result<T,E>, AppError, logger                 │
│  src/config: env (Zod)   ·  src/i18n: 15 ns + RTL        │
│  src/stores: app-mode · onboarding · shell · language    │
│  src/theme + src/components/{ui,brand} (P04)             │
└──────────────────────────────────────────────────────────┘
```

**القاعدة الذهبية:** `app/` لا تستورد `@/providers/not-connected/*` ولا `@/adapters/*` مباشرة. كل شيء عبر `useProviderContainer()` أو hooks من `src/features/shell`.

---

## 2) خريطة المسارات (P05)

```
app/
├─ _layout.tsx              # Providers + خطوط + Splash + Hosts + ErrorBoundary
├─ index.tsx                # Gate: Redirect فقط
├─ +not-found.tsx           # /+not-found
├─ maintenance.tsx          # /maintenance
├─ (onboarding)/
│  ├─ _layout.tsx           # Stack بلا Dock
│  └─ index.tsx             # /onboarding — OnboardingFlow (5 خطوات)
├─ (auth)/
│  ├─ _layout.tsx
│  └─ sign-in.tsx           # /sign-in — Placeholder صادق (P06) + دخول Demo
├─ (tabs)/
│  ├─ _layout.tsx           # TabsShell: حارس + Tabs مخفي + FloatingDock
│  ├─ index.tsx             # /            الرئيسية   → P07
│  ├─ services.tsx          # /services    الخدمات    → روابط فعلية للميزات
│  ├─ weddings.tsx          # /weddings    عرسنا واحد → P10 (الخانة الوسطى)
│  ├─ partners.tsx          # /partners    الشركاء    → P11
│  └─ account.tsx           # /account     حسابي      → P06 (+ شارة + رابط Dev)
├─ (features)/
│  ├─ _layout.tsx
│  ├─ assistance.tsx        # /assistance    → P08
│  ├─ souk.tsx              # /souk          → P12
│  ├─ jobs.tsx              # /jobs          → P13
│  ├─ volunteers.tsx        # /volunteers    → P13
│  ├─ learn.tsx             # /learn         → P15
│  ├─ calculator.tsx        # /calculator    → P14
│  ├─ guide.tsx             # /guide         → P14
│  ├─ notifications.tsx     # /notifications → P16
│  └─ search.tsx            # /search        → P16
├─ (staff)/
│  ├─ _layout.tsx           # StaffLayoutGate: deny-by-default
│  └─ index.tsx             # /staff → P17
└─ (dev)/
   ├─ _layout.tsx           # بوابة: production → NotFound
   ├─ index.tsx             # /dev — إعدادات المطور
   ├─ integrations.tsx      # /dev/integrations — Registry
   └─ gallery.tsx           # /gallery — Design System Showcase (P04)
```

**مصدر الحقيقة:** `src/constants/routes.ts` (`ROUTES` + `TABS` + `href()`), ويُستخدم في كل تنقل وقائمة سماح. لا تكرار لمسارات حرفية.

### 2.1 Gate (`app/index.tsx`)

`resolveGate()` دالة نقية في `src/features/shell/routing.ts`:

| الشرط | الحالة | الوجهة |
|-------|--------|--------|
| المتاجر غير مُحمّلة أو استعلام الجلسة جارٍ | `loading` | GateLoading (DoubleRingLoader) |
| `onboardingCompleted = false` | `onboarding` | `/(onboarding)` |
| الجلسة `ok(null)` | `auth` | `/(auth)/sign-in` |
| الجلسة `ok(session)` | `ready` | `/(tabs)` |
| خطأ `NotConnected` | `not-connected` | NotConnectedState + Retry عامل |
| أي خطأ آخر | `error` | ErrorState + Retry عامل |

- الجلسة تُقرأ عبر **`AuthProvider.getSession()`** وتُخزَّن في TanStack Query بمفتاح `['auth','session', mode]`.
- الحارس نفسه مطبَّق في `(tabs)/_layout` و`(staff)/_layout` فلا يُتجاوز بالوصول المباشر.
- تبديل AppMode يمسح Query cache (`queryClient.clear()`) ويغيّر مفتاح الجلسة → إعادة قراءة صادقة.

### 2.2 الحراس

| المسار | الحارس | السلوك |
|--------|--------|--------|
| `(tabs)/*` | `useShellGate` | onboarding/auth/not-connected/error قبل عرض التبويبات |
| `(staff)/*` | `StaffLayoutGate` + `hasStaffRole()` | ضيف → sign-in، مستخدم بلا دور → **ForbiddenView** |
| `(dev)/*` | `DevLayout` | `env.APP_MODE === 'production'` → NotFound |
| `(onboarding)` | لا حارس دخول | الخروج منه بإكمال/تخطي يحفظ العلم |

> **قاعدة 19:** الحارس في الواجهة واجهة فقط. الحماية الفعلية RLS على الخادم في P18.
> `AuthUser` لا يحوي أدواراً بعدُ، لذا `hasStaffRole()` يعيد `false` للجميع (deny-by-default) حتى P06/P17.

---

## 3) طبقة Shell

| المكوّن | الموقع | المسؤولية |
|---------|--------|-----------|
| `FloatingDock` | `components/shell` | 5 خانات، الوسطى مميزة، حركة اختيار، Haptics، شارة، إخفاء عند الكيبورد، SafeArea، ترتيب RTL — ADR-0012 |
| `AnimatedSplash` | `components/shell` | قمرية + اتحاد حلقتين، تخطي، Reduce Motion، بعد جاهزية الخطوط |
| `DialogHost` / `BottomSheetHost` | `components/shell` | مضيفات عامة فوق مكوّني P04، مدفوعة بـ`shell.store` |
| `ToastProvider` | `components/ui` (P04) | مضيف Toast الوحيد — لا تكرار |
| `OfflineBanner` | `components/shell` | NetInfo حقيقي (`isConnected === false` فقط) |
| `DemoBanner` | `components/shell` | وضع demo فقط، قابل للإخفاء لجلسة التشغيل |
| `AppErrorBoundary` | `components/shell` | Class boundary بتوكنز ثابتة (بلا hooks) + Retry |
| `RoutePlaceholder` | `components/shell` | Placeholder موحّد يذكر مرحلة البناء + إجراء حقيقي اختياري |
| `GateLoading` / `ForbiddenView` | `components/shell` | حالات تحميل ومنع موحّدة |

**قاعدة P04 مفروضة في المتجر:** لا يُفتح Dialog وBottomSheet معاً (`openDialog` يصفّر `sheet` والعكس).

**المتاجر (Zustand — حالة عميل فقط):**

| المتجر | persist | المحتوى |
|--------|---------|---------|
| `app-mode.store` | ✅ | `mode: demo\|backend` + `hydrated` |
| `onboarding.store` | ✅ | `completed` + `hydrated` |
| `language.store` | ✅ | `language: ar\|en` + `hydrated` — ADR-0013 |
| `shell.store` | ❌ | dialog/sheet/demoBannerDismissed/unreadNotifications |

---

## 4) الروابط العميقة (`azib://`)

`src/features/shell/deep-links.ts` — دوال نقية + `DeepLinkGuard` في الجذر.

| التصنيف | المسارات | السلوك |
|---------|----------|--------|
| **allow** | `/`, `/index`, `/sign-in`, `/maintenance`, `/services`, `/weddings`, `/partners`, `/account`, `/assistance`, `/souk`, `/jobs`, `/volunteers`, `/learn`, `/calculator`, `/guide`, `/notifications`, `/search` | يمرّ للـRouter طبيعياً (والحراس تظل مطبقة) |
| **guarded** | `/onboarding*`, `/staff*`, `/dev*`, `/gallery*` | يقرّر حارس الـLayout (Forbidden أو NotFound) |
| **not-found** | أي مسار آخر | `router.replace('/+not-found')` |
| **ignore** | رابط غير `azib://` أو غائب | لا إجراء |

**التطبيع:** إزالة مقاطع المجموعات `(tabs)`، إسقاط `?query` و`#fragment` بالكامل، إزالة الشرطة النهائية.
**الأمان:** لا معاملات حساسة في الروابط إطلاقاً — تُهمَل ولا تُقرأ. ADR-0014.

---

## 5) AppMode

| الوضع | Adapters | Registry status |
|-------|----------|------------------|
| `demo` | 12 mock + 16 mock repos | `mock` → `connected` بعد healthCheck |
| `backend` (env كامل) | 12 NotConnected + 16 mock repos مؤقتاً | `configured` → `error` بعد healthCheck |
| `backend` (env ناقص) | 12 NotConnected + 16 mock repos مؤقتاً | `disabled` → `error` بعد healthCheck |

**التبديل:** من شاشة إعدادات المطور → `useAppModeStore.setMode()` + `queryClient.clear()` → إعادة بناء الحاوية.
**قيد مؤقت (P18):** backend mode يستخدم mocks للـ16 repository — موثَّق في `PROJECT_CONTEXT §8 #9`.

---

## 6) Provider Contracts (12)

كل provider يمتد `ProviderBase` (name, mode, capabilities, healthCheck) + دوال خاصة.

| Provider | ADR حاكم | ملاحظات |
|----------|-----------|----------|
| Auth | — | signIn/Out/getSession/refresh — **تستهلكه P05 عبر Query** |
| Database | — | marker للاتصال |
| Storage | — | uploadFile/deleteFile/getPublicUrl |
| Notification | — | requestPermission/scheduleLocal/cancelScheduled |
| Payment | **ADR-0005** | recordPledge/verifyExternalPayment فقط |
| Email / Sms | — | send |
| Analytics | — | track/setUserId (PII ممنوع) |
| Maps | — | geocode/reverseGeocode |
| Search | — | query |
| Ai | **ADR-0006** | scoreEligibility فقط، `advisory: true` |
| Content | — | getArticleBySlug/listArticles (i18n keys) |

---

## 7) Repository Contracts (16)

4 أنماط: `CrudRepository` (9) · `ReadOnlyRepository` (1: content) · `AppendOnlyRepository` (2: donation, disbursement) · Custom (4: audit, notification, search, settings).
`SearchRepository` يُفوّض إلى `SearchProvider` (لا نسخة موازية من منطق البحث).
**لم تُستخدم الـrepositories في واجهات P05 بعد** (Placeholders)؛ أول استهلاك فعلي في P06.

---

## 8) Error Handling

```ts
type Result<T, E = AppError> =
  | { ok: true; value: T }
  | { ok: false; error: E }
```

- Repositories وProviders تُعيد `Promise<Result<T>>` دائماً.
- المكونات لا تستدعي provider مباشرة؛ تمر عبر hooks (`useSession`, `useShellGate`) أو شاشات Dev عبر الحاوية.
- `AppErrorKind`: Network, Auth, Forbidden, Validation, NotFound, Conflict, NotConnected, Unknown.
- واجهات P05 تعرض عناوين صريحة من `common:shell.*` بدل الاعتماد على مفاتيح `errors.*` غير المضمّنة في common.

---

## 9) i18n و RTL

- **15 namespace:** common, errors, auth, home, assistance, weddings, marketplace, profile, souk, jobs, tools, learn, staff, legal, **onboarding**.
- الافتراضي `ar` (RTL)، fallback `en`.
- **حفظ اللغة:** `language.store` (persist) — ADR-0013.
- **`LanguageBootstrap`** عند الإقلاع: يطبّق `applyDirectionToNativeLayer(language)` ويضبط i18next على اللغة المحفوظة.
- **`useLanguageSwitch`**: يحفظ الاختيار + forceRTL + `setLanguage()` فوراً (يستخدمه Onboarding وإعدادات المطور).
- النصوص تتبدل فوراً؛ **الاتجاه الأصلي يكتمل بعد إعادة فتح التطبيق** — ملاحظة صادقة معروضة للمستخدم (لا مكتبة restart).
- Formatters: number/currency (YER بلا كسور)/date/percent.

---

## 10) Seed Framework

- `mocks/seed/*` (خارج `src/`): محتوى عربي مُختلق، `dataOrigin='demo'`، لا PII.
- `buildDemoSeedBundle()` (15 collection) + `populateDemoSeed(container)` (13/16).
- **غير موصول بالتطبيق بعد** — `seedBundle` factory param مؤجل بقرار المالك (`PROJECT_CONTEXT §8 #8`).

---

## 11) أدوات المطور والفحوص

- `(dev)/index`: AppMode · Tier override · اللغة/الاتجاه · الاهتزاز · عدّاد شارة Dock · روابط · إعادة ضبط Onboarding (عبر DialogHost).
- `(dev)/integrations`: 12 مزوّداً من Registry + `healthCheckAll()` حقيقي.
- بوابة إنتاج: كل `(dev)/*` (ومنها Gallery) → NotFound في `production`.
- **`scripts/check-dead-buttons.mjs`**: يفشل على معالجات `on*` فارغة أو `TODO`/`FIXME` داخل `app/` و`src/features/` فقط؛ يستثني `app/(dev)/gallery.tsx` و`__tests__` — ADR-0015.
- `scripts/check-hardcoded-arabic.mjs`: كما هو من P02 (نطاق `app/` + `src/`).

---

## 12) Testing

- **Jest + jest-expo + RNTL** — 623 اختباراً ناجحاً عند إغلاق P05 (بتقرير المستخدم).
- **تسمية المجلدات: `__tests__` دائماً** (بشرطتين سفليتين). `testMatch` يلتقط `**/__tests__/**/*.test.ts(x)`؛ مجلد اسمه `tests` وحده **لا يُفحص**. المجلد الخارجي `tests/` مسموح لأنه يحتوي `__tests__` بداخله.
- **أنماط React 19 الملزمة:** `await renderHook` عند الحاجة · تغليف `fireEvent` بـ`act` عند تحديث الحالة · `await act(async () => {})` لتحديثات Zustand · `{ includeHiddenElements: true }` للعناصر المخفية.
- **Reanimated:** mock ثابت في `jest.setup.ts` (ADR-0011) — الحركة الفعلية لا تُختبر في Jest.
- **NetInfo وexpo-splash-screen:** mocks عالمية في `jest.setup.ts`.
- اختبارات الفاحصات تعيش في `tests/__tests__/scripts/` وتولّد ملفات مؤقتة في `os.tmpdir()`.
- **غير مغطى بـJest:** تشغيل الحركة، إيماءات PanResponder، Blur، تحميل الخطوط، رجوع Android، التدفق الكامل على الأجهزة → تحقق يدوي + P21.

---

## 13) CI

`.github/workflows/ci.yml`:
1. `npm ci`
2. `Expo Doctor`
3. `npm audit` (informational)
4. `npm run lint` (يشمل فحص العربية)
5. **`node scripts/check-dead-buttons.mjs`** ← جديد في P05
6. `npm run typecheck`
7. `npm test -- --ci`
8. `npm run web:export`

---

## 14) الحالات الحرجة التي يجب عدم كسرها

1. `PaymentProvider` بلا `charge/capture/refund/createIntent` (ADR-0005).
2. `AiProvider` بلا `decide/approve/reject/block` (ADR-0006).
3. `dataOrigin='demo'` على كل كائنات Seed.
4. لا `service_role` ولا أسرار في العميل.
5. `backend` mode لا ينكسر عند غياب env — يعرض NotConnected.
6. `@/` aliases محلولة عبر `eslint-import-resolver-typescript` (ADR-0008).
7. **لا زر بلا وظيفة** — يفشل CI إن وُجد معالج فارغ أو TODO في `app/` أو `src/features/`.
8. **قائمة سماح الروابط** لا تُوسَّع إلا بتحديث `deep-links.ts` + اختبار.
9. **حارس Staff deny-by-default** حتى وصول الأدوار؛ لا تُفتح `(staff)` بلا فحص دور.
10. **`(dev)` محجوب في الإنتاج** — بما فيها Gallery.
11. **اللغة محفوظة** وتُطبَّق عند الإقلاع؛ لا يُعاد المستخدم إلى `ar` قسراً بعد اختياره `en`.
12. **مجلد الاختبار `__tests__`** — أي تسمية أخرى تُخفي الاختبارات عن CI.
