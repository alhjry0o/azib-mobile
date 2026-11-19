# ARCHITECTURE — عازب | AZIB

> يوثّق البنية التقنية بعد **P06 (Auth / Profile / Settings / Legal)**.
> **عام المستودع:** لا أسرار ولا بيانات شخصية.

---

## 1) نظرة عامة

```
┌──────────────────────────────────────────────────────────┐
│  app/ (Routes only)                                      │
│  Gate · (onboarding) (auth) (tabs) (features) (staff)    │
│  (dev) · profile · settings · legal · +not-found         │
└───────────────────────┬──────────────────────────────────┘
                        │ يركّب فقط — بلا منطق أعمال
┌───────────────────────▼──────────────────────────────────┐
│  src/features/{shell,onboarding,auth,profile,settings,   │
│                legal,dev} + components/{ui,brand,shell}  │
└───────────────────────┬──────────────────────────────────┘
                        │ hooks (useAuth/useSession/useProfile…)
┌───────────────────────▼──────────────────────────────────┐
│  TanStack Query (حالة الخادم) + Zustand (حالة العميل)     │
└───────────────────────┬──────────────────────────────────┘
                        │ useProviderContainer()
┌───────────────────────▼──────────────────────────────────┐
│  ProviderContainer: 12 Providers + 16 Repos + Registry   │
└───────────────────────┬──────────────────────────────────┘
                        │ اختيار الـadapter حسب AppMode
┌───────────────────────▼──────────────────────────────────┐
│  mock | not-connected | (supabase P18)                   │
└───────────────────────┬──────────────────────────────────┘
┌───────────────────────▼──────────────────────────────────┐
│  core (Result/AppError) · config (env) · i18n · theme    │
│  وحدات حدود SDK: token-vault · image-pipeline ·          │
│                  biometric · export-file  (ADR-0022)     │
└──────────────────────────────────────────────────────────┘
```

**القاعدة الذهبية:** `app/` لا تستورد `not-connected/*` ولا `adapters/*` مباشرة؛ كل شيء عبر hooks أو `useProviderContainer()`.

---

## 2) خريطة المسارات

```
app/
├─ _layout.tsx · index.tsx (Gate) · +not-found.tsx · maintenance.tsx
├─ (onboarding)/ index                     → 5 خطوات
├─ (auth)/ welcome · sign-in · sign-up · verify
│          forgot-password · reset-password
├─ (tabs)/ index · services · weddings · partners · account
├─ (features)/ assistance · souk · jobs · volunteers · learn
│              calculator · guide · notifications · search
├─ (staff)/ index                          → حارس دور صريح
├─ (dev)/ index · integrations · auth · gallery   → بوابة إنتاج
├─ profile/ index · edit                   → RequireAuth
├─ settings/ index · account · language · appearance · numbers
│            notifications · privacy · help · about
│            security · devices · delete-account · export-data
└─ legal/ [doc]                            → 5 وثائق بنسخ
```

**مصدر الحقيقة:** `src/constants/routes.ts` (`ROUTES` + `TABS` + `href()` + `legalDocPath()`).

### 2.1 Gate

`resolveGate()` نقية في `features/shell/routing.ts`:

| الشرط | الحالة | الوجهة |
|-------|--------|--------|
| متاجر غير محمّلة أو استعلام الجلسة جارٍ | `loading` | GateLoading |
| `onboardingCompleted=false` | `onboarding` | `/(onboarding)` |
| جلسة بلا تحقق معلّق | `ready` | `/(tabs)` |
| جلسة بتحقق معلّق | `verify` | `/(auth)/verify` |
| لا جلسة + علم ضيف | `ready` | `/(tabs)` (تصفح عام) |
| لا جلسة + لا ضيف | `auth` | `/(auth)/welcome` |
| خطأ NotConnected | `not-connected` | NotConnectedState + Retry |
| خطأ آخر | `error` | ErrorState + Retry |

الجلسة تُقرأ عبر `AuthProvider.getSession()` وتُخزَّن في Query بمفتاح `['auth','session',mode]`.

### 2.2 الحراس

| المسار | الحارس | السلوك |
|--------|--------|--------|
| `(tabs)/*` | `useShellGate` | onboarding/auth/verify/not-connected/error قبل العرض |
| `(staff)/*` | `StaffLayoutGate` + `hasStaffRole` | ضيف → sign-in · بلا دور فريق → Forbidden |
| `(dev)/*` | `DevLayout` | production → NotFound |
| `profile/*` | `RequireAuth` | ضيف/خارج → welcome · تحقق معلّق → verify |
| `settings/account`, `settings/privacy`, `settings/security`, `settings/devices`, `settings/delete-account`, `settings/export-data` | `RequireAuth` | كما سبق |
| `settings/{language,appearance,numbers,help,about}` | عام | متاح للضيف |
| شاشة الأمان | `BiometricGate` | عند تفعيل القفل: بصمة فعلية قبل العرض |

> **قاعدة 19:** الحارس واجهة فقط. الحماية الفعلية RLS في P18.

---

## 3) طبقة المصادقة (P06)

| الوحدة | المسؤولية |
|--------|-----------|
| `auth-machine.ts` | آلة نقية: loading · unauthenticated · guest · authenticated · needs_verification + `isValidTransition` + `deriveAuthPhase` |
| `token-vault.ts` | SecureStore على الجهاز · ذاكرة على الويب · لا تسجيل (ADR-0017) |
| `use-auth.ts` | نقطة الدخول الوحيدة لأفعال المصادقة + تجديد مجدول + مسح عند الخروج |
| `use-otp.ts` | محاولات + كولداون + helpers نقية |
| `consents.ts` | وثائق الموافقة ونسخها عند التسجيل |
| `errors.ts` | `authErrorKey()` يحوّل `AppError` إلى مفتاح ترجمة |
| `RequireAuth.tsx` | حارس المسارات المحمية |
| `screens/*` | 6 شاشات (RHF + Zod + `useWatch`) |

**المتاجر (Zustand — حالة عميل فقط، 6):**

| المتجر | persist | المحتوى |
|--------|---------|---------|
| `app-mode` | ✅ | demo \| backend |
| `onboarding` | ✅ | completed |
| `language` | ✅ | ar \| en |
| `auth` | ✅ (الضيف فقط) | guestActive · challenge (ذاكرة) · redirectAfterAuth (ذاكرة) |
| `settings` | ✅ | أرقام · مظهر · رؤية · موافقة القصص · إشعارات · قفل بيومتري |
| `shell` | ❌ | dialog/sheet/demoBanner/unread |

**ممنوع:** توكنات أو كلمات مرور أو بيانات خادم في أي متجر.

---

## 4) الأمان

- **إعادة مصادقة** قبل تغيير كلمة المرور وقبل جدولة الحذف (داخل المزوّد).
- **Backoff**: قفل الدخول بعد 5 إخفاقات · 5 محاولات للرمز · كولداون 30s لإعادة الإرسال.
- **منع تعداد الحسابات** في استعادة كلمة المرور.
- **القفل البيومتري** اختياري؛ معطّل بسبب معلن عند عدم وجود عتاد/بصمة مسجّلة.
- **الجلسات**: عرض + إنهاء بعينها؛ إنهاء الحالية يُخرج إلى Welcome.
- **التصدير**: بلا توكنات/كلمات مرور/بيانات آخرين (مُختبَر).
- **الروابط**: لا معاملات حساسة تُقرأ إطلاقاً.

---

## 5) AppMode

| الوضع | Adapters | Registry |
|-------|----------|----------|
| `demo` | 12 mock + 16 mock repos | `mock` → `connected` بعد healthCheck |
| `backend` (env كامل) | 12 NotConnected + 16 mock repos مؤقتاً | `configured` → `error` |
| `backend` (env ناقص) | نفسه | `disabled` → `error` |

التبديل من شاشة المطور: `setMode()` + `queryClient.clear()`. الشاشات المعتمدة على الخادم تعرض NotConnected صادقاً في backend.

---

## 6) Provider Contracts (12)

| Provider | ADR | ملاحظات |
|----------|-----|---------|
| Auth | **0016** | **15 capability** — التفصيل في `docs/INTEGRATIONS.md` |
| Database | — | marker |
| Storage | 0020 | uploadFile/deleteFile/getPublicUrl — مستخدم فعلياً لصورة Avatar |
| Notification | — | requestPermission/scheduleLocal/cancelScheduled |
| Payment | **0005** | recordPledge/verifyExternalPayment فقط |
| Email / Sms | — | send (Mock يسجّل فقط) |
| Analytics | — | track/setUserId (PII ممنوع) |
| Maps / Search | — | geocode/reverseGeocode · query |
| Ai | **0006** | scoreEligibility فقط، `advisory: true` |
| Content | — | i18n keys لا نص حرفي |

---

## 7) Repository Contracts (16)

4 أنماط: Crud (9) · ReadOnly (1) · AppendOnly (2) · Custom (4).
**الاستهلاك الفعلي حتى P06:** `profiles` (عرض/تعديل/إنشاء) و`settings` غير مستخدم بعد. البقية تبدأ من P07.
**لم يُعدَّل أي عقد في P06** — الموقع داخل `city` (ADR-0019)، والصورة في Query cache (ADR-0020).

---

## 8) Error Handling

```ts
type Result<T, E = AppError> = { ok: true; value: T } | { ok: false; error: E }
```
Repositories وProviders تُعيد Result دائماً. الشاشات تستهلك hooks وتعرض `loading/error/empty/notConnected`. `authErrorKey()` يقدّم أكواد المزوّد على تصنيف الخطأ العام.

---

## 9) i18n و RTL

15 namespace · الافتراضي `ar` (RTL) · fallback `en` · اللغة محفوظة وتُطبَّق عند الإقلاع (ADR-0013) · النصوص تتبدل فوراً والاتجاه الأصلي يكتمل بعد إعادة الفتح (ملاحظة صادقة معروضة) · كل نصوص P06 في `auth:` و`profile:` و`legal:` (لا زيادة في عدد الـnamespaces).

---

## 10) الوحدات الحدودية لـSDK (ADR-0022)

| الوحدة | الحزمة | الواجهة المثبتة فعلياً |
|--------|--------|------------------------|
| token-vault | expo-secure-store | `setItemAsync/getItemAsync/deleteItemAsync` |
| image-pipeline | expo-image-picker / manipulator | `launchImageLibraryAsync` · `manipulateAsync` |
| biometric | expo-local-authentication | `hasHardwareAsync/isEnrolledAsync/authenticateAsync` |
| export-file | expo-file-system / sharing | `File`/`Paths` · `isAvailableAsync/shareAsync` |

---

## 11) Seed

`mocks/seed/*` (خارج `src/`): محتوى مُختلق، `dataOrigin='demo'`، لا PII. `buildDemoSeedBundle()` (15 collection) + `populateDemoSeed` (13/16) — **غير موصول بالواجهة** (مؤجل بقرار المالك). `locations.ts` شجرة demo بانتظار تحقق بشري.

---

## 12) أدوات المطور والفحوص

`(dev)/index` (وضع/Tier/لغة/اهتزاز/شارة/روابط/إعادة ضبط) · `(dev)/integrations` (12 مزوّداً + healthCheckAll) · `(dev)/auth` (أدوار + جلسة + رمز تجريبي) · بوابة إنتاج على كل `(dev)/*`.
`check-hardcoded-arabic.mjs` (app/ + src/) · `check-dead-buttons.mjs` (app/ + src/features/، يستثني Gallery و`__tests__`).

---

## 13) Testing

- **Jest + jest-expo + RNTL v14** — **110 suites · 780 tests** عند إغلاق P06 (بتقرير المالك).
- **اصطلاحات ملزمة:** مجلد `__tests__` · `await render` · `await fireEvent.xxx` · `await view.unmount()` · لا تغليف fireEvent بـact · `await act(() => …)` للمتاجر · `useEffect` لالتقاط قيم hooks · `?? default` للفهرسة الرقمية · mock لـ`Select`/`Modal` · `setQueryData` مباشر · `waitFor` على الحالة النهائية.
- **Mocks:** Reanimated ثابت (ADR-0011) · NetInfo · splash · secure-store · picker · manipulator (عامة) · file-system/sharing/local-authentication (محلية في الاختبارات).
- **غير مغطى بـJest:** الحركة الفعلية، Blur، الإيماءات، الخطوط، EXIF، البصمة الحقيقية، رجوع Android، التدفق على الأجهزة ⇒ P20/P21.

---

## 14) CI

`npm ci` → Expo Doctor → audit (informational) → `lint` (يشمل العربية) → **Dead Buttons Check** → `typecheck` → `test --ci` → `web:export`.

---

## 15) الحالات الحرجة التي يجب عدم كسرها

1. `PaymentProvider` بلا charge/capture/refund/createIntent (ADR-0005).
2. `AiProvider` بلا decide/approve/reject/block (ADR-0006).
3. `dataOrigin='demo'` على كل كائنات Seed.
4. لا `service_role` ولا أسرار في العميل.
5. `backend` لا ينكسر عند غياب env — NotConnected.
6. `@/` aliases عبر resolver-typescript (ADR-0008).
7. لا زر بلا وظيفة (يفشل CI).
8. قائمة سماح الروابط لا تُوسَّع إلا بتحديث `deep-links.ts` + اختبار.
9. حارس Staff deny-by-default؛ الأدوار من الجلسة فقط.
10. `(dev)` محجوب في الإنتاج (ومنها Gallery).
11. اللغة محفوظة وتُطبَّق عند الإقلاع.
12. مجلد الاختبار `__tests__`.
13. **لا توكنات في Zustand/AsyncStorage/الروابط/السجلات/التصدير.**
14. **إعادة مصادقة قبل تغيير كلمة المرور وقبل جدولة الحذف.**
15. **فشل معالجة الصورة ⇒ لا رفع** (حماية EXIF).
16. **كل capability معلَنة في العقد يجب أن توجد كدالة في Mock وNotConnected معاً.**
17. **واجهات Expo الأصلية تبقى داخل وحداتها الحدودية** (ADR-0022).
