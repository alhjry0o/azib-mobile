# ARCHITECTURE — عازب | AZIB

> يوثّق البنية التقنية بعد **P07 (Home Dashboard & Discovery)**.
> **عام المستودع:** لا أسرار ولا بيانات شخصية.

---

## 1) نظرة عامة

```
┌──────────────────────────────────────────────────────────┐
│  app/ (Routes only)                                      │
│  Gate · (onboarding) (auth) (tabs) (features) (staff)    │
│  (dev) · profile · settings · legal · +not-found         │
└───────────────────────┬──────────────────────────────────┘
┌───────────────────────▼──────────────────────────────────┐
│  src/features/{shell,onboarding,auth,profile,settings,   │
│                legal,home,dev} + components/{ui,brand,   │
│                shell}                                    │
└───────────────────────┬──────────────────────────────────┘
                        │ hooks (useAuth/useSession/useProfile/
                        │        useHomeConfig/useHomeSection)
┌───────────────────────▼──────────────────────────────────┐
│  TanStack Query (حالة الخادم) + Zustand (حالة العميل)     │
└───────────────────────┬──────────────────────────────────┘
┌───────────────────────▼──────────────────────────────────┐
│  ProviderContainer: 12 Providers + 16 Repos + Registry   │
└───────────────────────┬──────────────────────────────────┘
┌───────────────────────▼──────────────────────────────────┐
│  mock | not-connected | (supabase P18)                   │
└───────────────────────┬──────────────────────────────────┘
┌───────────────────────▼──────────────────────────────────┐
│  core (Result/AppError) · config (env) · i18n · theme    │
│  وحدات حدود SDK: token-vault · image-pipeline ·          │
│                  biometric · export-file  (ADR-0022)     │
└──────────────────────────────────────────────────────────┘
```

**القاعدة الذهبية:** `app/` لا تستورد `not-connected/*` ولا `adapters/*`؛ كل شيء عبر hooks أو `useProviderContainer()`.

---

## 2) خريطة المسارات

```
app/
├─ _layout.tsx · index.tsx (Gate) · +not-found.tsx · maintenance.tsx
├─ (onboarding)/ index
├─ (auth)/ welcome · sign-in · sign-up · verify · forgot-password · reset-password
├─ (tabs)/ index(Home) · services · weddings · partners · account
├─ (features)/ assistance · souk · jobs · volunteers · learn · calculator
│              guide · notifications · search
├─ (staff)/ index · (dev)/ index · integrations · auth · gallery
├─ profile/ index · edit
├─ settings/ index · account · language · appearance · numbers · notifications
│            privacy · help · about · security · devices · delete-account · export-data
└─ legal/ [doc]
```

**مصدر الحقيقة:** `src/constants/routes.ts`.

### 2.1 Gate
`resolveGate()` نقية: loading / onboarding / auth(→Welcome) / verify / ready / not-connected / error. الضيف يمرّ إلى التبويبات؛ الجلسة غير الموثّقة تذهب إلى Verify.

### 2.2 الحراس
| المسار | الحارس |
|--------|--------|
| `(tabs)/*` | `useShellGate` |
| `(staff)/*` | `StaffLayoutGate` + `hasStaffRole` (deny-by-default) |
| `(dev)/*` | بوابة إنتاج → NotFound |
| `profile/*` | `RequireAuth` |
| `settings/{account,privacy,security,devices,delete-account,export-data}` | `RequireAuth` |
| `settings/{language,appearance,numbers,help,about}` | عام |
| شاشة الأمان | `BiometricGate` عند تفعيل القفل |

> الحارس واجهة فقط؛ الحماية الفعلية RLS في P18 (قاعدة 19).

---

## 3) طبقة المصادقة (P06)

`auth-machine` (5 حالات نقية) · `token-vault` (SecureStore/ذاكرة) · `use-auth` (نقطة الأفعال) · `use-otp` · `consents` · `errors` · `RequireAuth` · 6 شاشات.
عقد `AuthProvider` = **15 capability** (التفصيل في `docs/INTEGRATIONS.md`).

**المتاجر (6، حالة عميل فقط):** app-mode · onboarding · language · auth (الضيف + challenge) · settings (تفضيلات + تفضيلات الرئيسية) · shell (dialog/sheet/badge).
**ممنوع:** توكنات أو كلمات مرور أو بيانات خادم في أي متجر.

---

## 4) طبقة الرئيسية (P07)

### 4.1 التكوين
```
HomeScreen
 ├─ ListHeader: HomeHeader · HomeHero · QuickActions · [كتل الأدوار]
 ├─ FlatList(data = config.visibleSections)
 │   └─ SectionErrorBoundary → LazySection → Stagger → <Section/>
 └─ ListFooter: إشعار Demo + تذييل
```

| الوحدة | المسؤولية |
|--------|-----------|
| `config/home-config.types.ts` | 8 معرّفات أقسام + 7 إجراءات + `HomeConfig` + `HomeConfigSource` |
| `config/default-home-config.ts` | افتراضي + دوال تطبيع نقية |
| `config/home-config.source.ts` | Mock + `get/set/resetHomeConfigSource` (ADR-0023) |
| `hooks/use-home-config.ts` | دمج المصدر + التخصيص المحفوظ + ترشيح المسجّل |
| `sections/registry.ts` | خريطة id → مكوّن؛ `REGISTERED_SECTION_IDS = HOME_SECTION_IDS` |

**الترتيب الافتراضي:** support-cases · weddings · offers · souk · jobs · community-stats · initiatives · success-stories.
**التخصيص:** `settings.store.homeSectionOrder` / `homeSectionVisibility` / `homeQuickActionVisibility` (محفوظة على الجهاز). المجهول يُسقط، والمكرر يُدمج، والناقص يُلحق.

### 4.2 الاستعلام لكل قسم
`useHomeSection({ id, fetch, enabled })` ⇒ مفتاح `['home', mode, id]`، `staleTime=30s`، `enabled` فقط في demo.

| الشرط | الحالة |
|-------|--------|
| mode ≠ demo | `not-connected` |
| `enabled=false` | `empty` |
| جارٍ / بلا نتيجة | `loading` |
| `Result.ok=false` | `error` |
| مصفوفة فارغة | `empty` |
| غير ذلك | `ready` |

**إعادة المحاولة معزولة:** `SectionShell.onRetry` يعيد استعلام القسم؛ `SectionErrorBoundary.onRetry` يبطل `['home', mode, id]` فقط.
**Pull-to-Refresh:** `client.invalidateQueries({queryKey:['home']})` — `refreshing`/`onRefresh` props مباشرة على FlatList.

### 4.3 الأقسام الثمانية

| القسم | المصدر | المرشّح | الخصوصية |
|-------|--------|---------|----------|
| support-cases | `applications.list({status:'approved'})` | حالة قابلة للنشر **+ موافقة سارية** | إسقاط معقّم فقط (§4.4) |
| weddings | `weddings.list` | `open` + ترتيب بالتاريخ، حد 6 | لا بيانات أشخاص |
| offers | `offers.list` + `partners.list` | `active` **و** شريك `verified`، حد 5 | اسم الشريك عام |
| souk | `souk.list` | `available`، حد 5 | عيني فقط |
| jobs | `jobs.list` | `open`، حد 5 | **لا بيانات تواصل** |
| community-stats | `donations` + `disbursements` + `profiles` | `confirmed` فقط | إخفاء + فصل (§4.5) |
| initiatives | `programs.list` | `open`، حد 4 | **بلا مبالغ** |
| success-stories | `content.list` | **موافقة لكل قصة** | لا نشر بلا موافقة |

**كتل الأدوار:** `partner_owner` ⇒ ملخص بلا أرقام (لا ربط حتى P11) · `volunteer` ⇒ تسجيلات المستخدم · دور فريق ⇒ اختصار Staff.

### 4.4 بوابة الموافقة والتعقيم (ADR-0024)

```
PublicationConsent { subjectId, grantedAt, revokedAt|null }
isConsentActive ⇒ false إذا: مفقود · grantedAt فاسد · منح مستقبلي ·
                            سحب ماضٍ · revokedAt فاسد   (fail-closed)
indexConsents ⇒ الأحدث لكل subject
```

`toPublicSupportCase(application, consent, ctx)` يشترط `status ∈ {approved, disbursed}` **و** موافقة سارية، ثم يُسقط:

| مسموح | ممنوع دائماً |
|-------|--------------|
| `id` (معرّف حالة مبهم) | `applicantId` · `programId` |
| `categoryKey` (فئة الحاجة) | `notes` · `reviewerNote` |
| `governorateKey` (المحافظة فقط) | `requestedAmount` (ولا مقرّباً) |
| `dataOrigin` | أي بيانات تواصل أو تفاصيل تعريفية |

`selectPublicStories` يشترط موافقة لكل سجل محتوى؛ **موافقة الحساب (`storiesConsent`) ليست بديلاً**.
**لا مصدر موافقات في عقود P03** ⇒ القسمان يعرضان حالة فارغة صادقة + السبب + إجراء حقيقي.

### 4.5 الإحصاءات (ADR-0025 + ADR-0026)

```
SMALL_NUMBER_THRESHOLD = 10   // PENDING_POLICY — PRODUCT_POLICIES #8
suppressSmallNumber(n) ⇒ n < الحد أو غير منتهٍ ⇒ { kind:'suppressed' }
buildStatCell(count,total) ⇒ إن حُجب العدد حُجب المبلغ معه
computeCommunityStats ⇒ { demo: bucket, real: bucket }   // منفصلان تماماً
```
- تُحتسب السجلات `confirmed` فقط.
- **الواجهة تعرض دلو demo حصراً** مع شارة demo وملاحظة الحد ونص «لا أرقام حقيقية هنا».
- حالة فارغة إذا كان مجموع السجلات صفراً.
- بحجم البيانات التجريبي الحالي كل الخلايا محجوبة — سلوك مقصود وموثّق.

### 4.6 الأداء والحركة
- `FlatList`: `initialNumToRender=2`, `maxToRenderPerBatch=2`, `windowSize=5`, `removeClippedSubviews`.
- `LazySection` يُركّب القسم عند ظهوره؛ أول قسمين eager؛ **fallback 700ms** لبيئات لا تُبلّغ الظهور (Jest/بعض تخطيطات الويب).
- `Stagger`: حد **8** عناصر، خطوة 60ms، مدة عبر `useMotion().duration()` ⇒ 0 عند Reduce Motion.
- البارالاكس: `onScroll` يكتب في `SharedValue` (مع `eslint-disable react-hooks/immutability`)؛ `Hero3D` يُعطّل نفسه على Tier low.
- Carousel الأعراس: `FlatList` أفقي مع `inverted` في RTL — **يحتاج تحققاً على جهاز**.

### 4.7 أداة تعبئة Demo (dev فقط)
`populateHomeDemoData(repositories)` في `features/dev/demo-seed.ts`:
1. `populateDemoSeed` (العقود نفسها).
2. نشر: partners→`verified` · weddings→`open` · souk→`available` · jobs→`open` · programs→`open`.
3. ضبط `titleKey`/`nameKey` على `home:demo.*` حتى لا تظهر مفاتيح خام.
4. إنشاء عروض مرتبطة بشركاء حقيقيين وتفعيلها (العروض اليتيمة تبقى draft/مخفية).
5. `invalidateQueries(['home'])`.

**لا تعبئة تلقائية.** ترفض العمل خارج وضع demo. لا تعدّل عقداً ولا mock factory.

---

## 5) AppMode

| الوضع | Adapters | Registry |
|-------|----------|----------|
| `demo` | 12 mock + 16 mock repos | `mock` → `connected` |
| `backend` (env كامل) | 12 NotConnected + 16 mock repos مؤقتاً | `configured` → `error` |
| `backend` (env ناقص) | نفسه | `disabled` → `error` |

التبديل من شاشة المطور: `setMode()` + `queryClient.clear()`. كل أقسام الرئيسية تعرض NotConnected في backend.

---

## 6) Provider Contracts (12)

Auth (15 capability، ADR-0016) · Database (marker) · Storage (مستخدم لصورة Avatar) · Notification · Payment (ADR-0005) · Email/Sms · Analytics · Maps/Search · Ai (ADR-0006) · Content.
التفصيل الكامل في `docs/INTEGRATIONS.md`.

---

## 7) Repository Contracts (16)

4 أنماط: Crud (9) · ReadOnly (1: content) · AppendOnly (2: donation, disbursement) · Custom (4).
**الاستهلاك حتى P07:** profiles · applications · programs · weddings · partners · offers · souk · jobs · volunteers · donations · disbursements · content.
**لم يُعدَّل أي عقد في P06/P07.** قيود مكتشفة: AppendOnly يمنع تأكيد التبرعات؛ ReadOnly يمنع إنشاء المحتوى (§8 في PROJECT_CONTEXT).

---

## 8) Error Handling

```ts
type Result<T, E = AppError> = { ok: true; value: T } | { ok: false; error: E }
```
Repositories/Providers تُعيد Result دائماً. الشاشات تستهلك hooks وتعرض loading/error/empty/not-connected. `authErrorKey()` يقدّم أكواد المزوّد على التصنيف العام.

---

## 9) i18n و RTL

15 namespace · `ar` افتراضية (RTL) · اللغة محفوظة وتُطبَّق عند الإقلاع (ADR-0013).
نصوص P07 كلها في `home:` (بما فيها أقسام kebab-case وأدوات dev وبيانات demo).
**درس مُلزِم:** صيغة المفاتيح في JSON يجب أن تطابق ما في `ts/tsx` حرفياً.

---

## 10) الوحدات الحدودية لـSDK (ADR-0022)

token-vault (secure-store) · image-pipeline (picker + `manipulateAsync`) · biometric (local-authentication) · export-file (`File`/`Paths` + sharing).

---

## 11) Seed

`mocks/seed/*` خارج `src/`: محتوى مُختلق، `dataOrigin='demo'`، لا PII. `buildDemoSeedBundle()` (15 collection) + `populateDemoSeed` (13/16). `locations.ts` بانتظار تحقق بشري. **content/notifications/search غير مدعومة في الـpopulator.**

---

## 12) أدوات المطور والفحوص

`(dev)/index` (وضع/Tier/لغة/اهتزاز/شارة/روابط/**تعبئة Demo**/إعادة ضبط) · `(dev)/integrations` · `(dev)/auth` · بوابة إنتاج على كل `(dev)/*`.
`check-hardcoded-arabic.mjs` (app/ + src/) · `check-dead-buttons.mjs` (app/ + src/features/، يستثني Gallery و`__tests__`).

---

## 13) Testing

- **Jest + jest-expo + RNTL v14** — **129 suites · 869 tests** عند إغلاق P07 (بتقرير المالك).
- اصطلاحات ملزمة: `__tests__` · `await render/fireEvent/unmount` · لا `act` حول fireEvent · `await act(() => …)` للمتاجر · `useEffect` للالتقاط · `?? default` للفهرسة · mock لـ`Select`/`Modal` · `setQueryData` مباشر · `waitFor` على الحالة النهائية · `jest.mock` بعد الـimports.
- **غير مغطى بـJest:** الحركة الفعلية، Blur، الإيماءات، الخطوط، EXIF، البصمة، Carousel RTL، سلوك الكسل على جهاز، التدفق الكامل ⇒ P20/P21.

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
9. حارس Staff deny-by-default؛ الأدوار من الجلسة.
10. `(dev)` محجوب في الإنتاج (ومنها Gallery وأداة التعبئة).
11. اللغة محفوظة وتُطبَّق عند الإقلاع.
12. مجلد الاختبار `__tests__`.
13. لا توكنات في Zustand/AsyncStorage/الروابط/السجلات/التصدير.
14. إعادة مصادقة قبل تغيير كلمة المرور وقبل جدولة الحذف.
15. فشل معالجة الصورة ⇒ لا رفع.
16. كل capability معلَنة توجد كدالة في Mock وNotConnected معاً.
17. واجهات Expo داخل وحداتها الحدودية (ADR-0022).
18. **لا نشر لحالة دعم أو قصة نجاح بلا موافقة سارية** (ADR-0024).
19. **بطاقة الدعم لا تحمل اسماً ولا مبلغاً ولا معرّف شخص** (ADR-0024).
20. **حجب العدد يحجب المبلغ معه** (ADR-0025).
21. **دلو Real لا يُعرض إطلاقاً قبل P18** (ADR-0026).
22. **لا استعلام واحد كبير للرئيسية** — استعلام مستقل لكل قسم.
23. **حد الـStagger 8 عناصر** وكل مدة عبر `useMotion().duration()`.
