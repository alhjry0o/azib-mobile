# ARCHITECTURE — عازب | AZIB

> يوثّق هذا الملف البنية التقنية الحالية بعد **P03 (Core Platform)**.
> **عام المستودع:** لا أسرار ولا بيانات شخصية.

---

## 1) نظرة عامة

طبقات التطبيق (من الأعلى إلى الأسفل):

```
┌─────────────────────────────────────────────────┐
│  app/ (Routes) + src/features (P05+)            │
└────────────────────┬────────────────────────────┘
                     │ useProviderContainer()
┌────────────────────▼────────────────────────────┐
│  ProviderContainer (React context)              │
│  ├─ 12 Provider Interfaces                      │
│  ├─ RepositoryContainer (16 repos)              │
│  └─ IntegrationRegistry                         │
└────────────────────┬────────────────────────────┘
                     │ adapter selection (by AppMode)
┌────────────────────▼────────────────────────────┐
│  Adapters: mock | not-connected | (supabase P18)│
└────────────────────┬────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────┐
│  src/core: Result<T,E>, AppError, logger        │
│  src/config: env (Zod validated)                │
│  src/stores: app-mode.store                     │
│  src/i18n: i18next + formatters + RTL           │
└─────────────────────────────────────────────────┘
```

**القاعدة الذهبية:** طبقة `app/` لا تستورد `@/adapters/*` ولا `@/providers/not-connected/*` مباشرة. كل شيء عبر `useProviderContainer()`.

---

## 2) AppMode

| الوضع | Adapters | Registry status |
|-------|----------|------------------|
| `demo` | 12 mock adapters + 16 mock repos | `mock` (كل شيء) |
| `backend` (env كامل) | 12 NotConnected + 16 mock repos مؤقتاً | `configured` → `error` بعد healthCheck |
| `backend` (env ناقص) | 12 NotConnected + 16 mock repos مؤقتاً | `disabled` |

**التبديل:** `useAppModeStore.setMode()` → `ProviderContainerProvider` يعيد البناء بـ`useMemo`.

**قيد مؤقت (P18):** backend mode يستخدم mocks للـ16 repository حتى تُنفَّذ Supabase-backed adapters. موثَّق في `PROJECT_CONTEXT §8`.

---

## 3) Provider Contracts (12)

كل provider يمتد `ProviderBase` (name, mode, capabilities, healthCheck) + دوال خاصة.

| Provider | ADR حاكم | ملاحظات |
|----------|-----------|----------|
| Auth | — | signIn/Out/getSession/refresh |
| Database | — | marker للاتصال (لا methods) |
| Storage | — | uploadFile/deleteFile/getPublicUrl |
| Notification | — | requestPermission/scheduleLocal/cancelScheduled |
| Payment | **ADR-0005** | recordPledge/verifyExternalPayment فقط. لا charge/capture/refund |
| Email | — | send |
| Sms | — | send |
| Analytics | — | track/setUserId (PII ممنوع في properties) |
| Maps | — | geocode/reverseGeocode |
| Search | — | query |
| Ai | **ADR-0006** | scoreEligibility فقط، `advisory: true` دائماً. لا decide/reject |
| Content | — | getArticleBySlug/listArticles (i18n keys, لا literal text) |

---

## 4) Repository Contracts (16)

3 أنماط:

1. **`CrudRepository<T, TCreate, TUpdate>`** (9): profile, application (custom), program, wedding, partner, offer, souk, job, volunteer
2. **`ReadOnlyRepository<T>`** (1): content
3. **`AppendOnlyRepository<T, TCreate>`** (2): donation, disbursement
4. **Custom interfaces** (4): audit (append-only بدون delete), notification (markRead), search (delegation), settings (key-value)

**Mock repos** في `src/repositories/mock/*`. كلها in-memory بـ`dataOrigin='demo'`. تشارك `MockRepositoryOptions { delayMs, forceErrorKind }` للاختبار.

**`createMockCrudRepository`** (في `mock/crud-factory.ts`) يُنفّذ CRUD pattern مرة واحدة لـ6 repos (Wedding/Partner/Offer/Souk/Job/Volunteer).

**`SearchRepository`** يُفوّض إلى `SearchProvider` (لا نسخة موازية من منطق البحث).

---

## 5) Error Handling

```ts
type Result<T, E = AppError> = 
  | { ok: true; value: T }
  | { ok: false; error: E }
```

- **Repositories** تُعيد `Promise<Result<T>>` دائماً.
- **Providers** تُعيد `Promise<Result<T>>` دائماً.
- **Components** لا تستدعي repo/provider مباشرة (P05+ ستمر عبر hooks من TanStack Query).
- **`AppErrorKind`**: Network, Auth, Forbidden, Validation, NotFound, Conflict, NotConnected, Unknown.
- **`i18nKey`**: `errors.<kind>` — يُترجم في `src/locales/*/errors.json`.

---

## 6) i18n

- **i18next + react-i18next + expo-localization**.
- **14 namespace:** common, errors, auth, home, assistance, weddings, marketplace, profile, souk, jobs, tools, learn, staff, legal.
- **اللغة الافتراضية:** `ar` (RTL). `fallbackLng: en`.
- **Formatters** (`src/i18n/formatters.ts`): number, currency (YER بدون كسور), date, percent. مع دعم الأرقام الغربية/الهندية.
- **RTL** (`src/i18n/rtl.ts`): `applyDirectionToNativeLayer` + `needsReloadForLanguageChange`. مفعّل بـ`I18nManager.allowRTL(true)` عند الإقلاع. تفعيل `forceRTL` الكامل في P05 عند تبديل اللغة.

---

## 7) Seed Framework

- **`mocks/seed/*`** (خارج `src/`، غير مفحوص لسكريبت العربية).
- **محتوى عربي مُختلق** (أسماء وهمية، أرقام `+967000…`، بريد `.invalid`).
- **`buildDemoSeedBundle()`** يُعيد `SeedBundle` (15 collection).
- **`populateDemoSeed(container)`** يُملأ mocks (13/16 repo؛ content/notification/search غير مدعومة حالياً — ستحتاج factory param في P05).
- **يُستدعى فقط في demo mode** (وإلا `skipped: 'not-demo-mode'`).

---

## 8) Testing

- **Jest + jest-expo** — يعمل عبر `npm test`.
- **Contract tests** (`__tests__/contracts/*.contract.ts`) — تُشارك في 16 repo.
- **Mock adapters** — tested via specific tests (`__tests__/mock-adapters.test.ts`).
- **Container** — tested with 3 modes (demo, backend+env, backend-no-env).
- **Seed** — validated for PII, uniqueness, `dataOrigin='demo'`.
- **RNTL** (`@testing-library/react-native`) غير مثبَّت بعد. يُضاف مع أول اختبار مكوّن في P04/P05.

---

## 9) CI

`.github/workflows/ci.yml`:
1. `npm ci`
2. `Expo Doctor`
3. `npm audit` (informational)
4. `npm run lint` (يشمل فحص العربية)
5. `npm run typecheck`
6. `npm test -- --ci`
7. `npm run web:export`

---

## 10) الحالات الحرجة التي يجب عدم كسرها

1. **`PaymentProvider`** لا يحتوي `charge/capture/refund/createIntent/createPaymentMethod` (ADR-0005).
2. **`AiProvider`** لا يحتوي `decide/approve/reject/block` (ADR-0006)؛ `advisory: true` دائماً.
3. **`dataOrigin='demo'`** على كل كائنات Seed.
4. **لا `service_role`** ولا أسرار في العميل.
5. **`backend` mode لا ينكسر** عند غياب env — يعرض NotConnected.
6. **`@/` aliases** حلّها ESLint عبر `eslint-import-resolver-typescript` (ADR-0008).
7. **`I18nManager.isRTL`** لا يتحول عند تبديل اللغة دون reload — هذا مقصود وموثَّق.
```
