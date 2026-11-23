# ARCHITECTURE — عازب | AZIB

> يوثّق البنية التقنية بعد **P09 (Financial Assistance Architecture)**.
> **عام المستودع:** لا أسرار ولا بيانات شخصية.

---

## 1) نظرة عامة

```
┌──────────────────────────────────────────────────────────┐
│  app/ (Routes only)                                      │
│  Gate · (onboarding) (auth) (tabs) (features) (staff)    │
│  (dev) · profile · settings · legal · assistance · programs│
└───────────────────────┬──────────────────────────────────┘
┌───────────────────────▼──────────────────────────────────┐
│  src/features/{shell,onboarding,auth,profile,settings,   │
│                legal,home,assistance,finance,dev}        │
│  + components/{ui,brand,shell}                           │
└───────────────────────┬──────────────────────────────────┘
                        │ hooks
┌───────────────────────▼──────────────────────────────────┐
│  TanStack Query (حالة الخادم) + Zustand (7 stores)        │
└───────────────────────┬──────────────────────────────────┘
┌───────────────────────▼──────────────────────────────────┐
│  ProviderContainer: 12 Providers + 16 Repos + Registry   │
└───────────────────────┬──────────────────────────────────┘
┌───────────────────────▼──────────────────────────────────┐
│  mock | demo-payment | not-connected | (supabase P18)    │
└───────────────────────┬──────────────────────────────────┘
┌───────────────────────▼──────────────────────────────────┐
│  core (Result/AppError/logger) · config · i18n · theme   │
│  وحدات حدود SDK: token-vault · image-pipeline ·          │
│    biometric · export-file · hash · document-pipeline    │
└──────────────────────────────────────────────────────────┘
```

**القاعدة الذهبية:** `app/` لا تستورد `not-connected/*` ولا `adapters/*`؛ كل شيء عبر hooks أو `useProviderContainer()`.

---

## 2) خريطة المسارات

```
app/
├─ _layout · index(Gate) · +not-found · maintenance
├─ (onboarding)/ index
├─ (auth)/ welcome · sign-in · sign-up · verify · forgot-password · reset-password
├─ (tabs)/ index(Home) · services · weddings · partners · account
├─ (features)/ souk · jobs · volunteers · learn · calculator · guide
│              notifications · search
├─ (staff)/ index
├─ (dev)/ index · integrations · auth · assistance · finance · gallery
├─ profile/ index · edit
├─ settings/ 13 شاشة
├─ legal/ [doc]
├─ assistance/ index · conditions · pre-check · new · mine
│              [id]/ index · info-request · decision · appeal
└─ programs/                     # P09
   ├─ index · [id] · kind/[kind] · donate/[id]
   ├─ donations · receipts · disbursements · impact
   └─ provider-requirements
```

**مصدر الحقيقة:** `src/constants/routes.ts`.

### 2.1 Gate
`resolveGate()` نقية: loading / onboarding / auth(→Welcome) / verify / ready / not-connected / error.

### 2.2 الحراس
| المسار | الحارس |
|--------|--------|
| `(tabs)/*` | `useShellGate` |
| `(staff)/*` | `StaffLayoutGate` + `hasStaffRole` |
| `(dev)/*` | بوابة إنتاج → NotFound |
| `profile/*` | `RequireAuth` |
| `settings/{account,privacy,security,devices,delete-account,export-data}` | `RequireAuth` |
| `settings/{language,appearance,numbers,help,about}` | عام |
| `assistance/{new,mine,[id]/*}` | `RequireAuth` + فحص ملكية |
| `assistance/{index,conditions,pre-check}` | عام |
| **`programs/{donate,donations,receipts,disbursements}`** | **`RequireAuth` + فحص ملكية** |
| **`programs/{index,[id],kind,impact,provider-requirements}`** | **عام** |
| شاشة الأمان | `BiometricGate` عند تفعيل القفل |

> الحارس واجهة فقط؛ الحماية الفعلية RLS في P18 (قاعدة 19).

---

## 3) طبقة المصادقة (P06)

`auth-machine` (5 حالات) · `token-vault` · `use-auth` · `use-otp` · `consents` · `errors` · `RequireAuth` · 6 شاشات. عقد Auth = **15 capability**.

**المتاجر (7 — حالة عميل فقط):** app-mode · onboarding · language · auth · settings · shell · assistance-draft.
**ممنوع:** توكنات أو كلمات مرور أو معرّفات خام أو بيانات خادم في أي متجر.

---

## 4) طبقة الرئيسية (P07)

`HomeConfigSource` قابل للتبديل + تخصيص محفوظ · استعلام لكل قسم · `SectionShell`/`SectionErrorBoundary`/`LazySection`/`Stagger(≤8)` · 8 أقسام · بوابة موافقة fail-closed · تعقيم · إخفاء الأعداد والمبالغ · فصل Demo/Real · FlatList + Pull-to-Refresh.

---

## 5) طبقة المساعدات (P08)

- **المحرك النقي:** rules → gates → components → bands → flags ⇒ `AdvisoryEvaluation` بلا قرار.
- **آلة الحالات:** 11 حالة · 18 انتقالاً · الفرض في `workflow-service`.
- **الخدمات:** hash · dedup · audit-trail · workflow · document-pipeline · submission.
- **الرحلة:** مسودة ببصمات → Wizard 8 خطوات → رقم مرجعي → متابعة/استكمال/قرار/اعتراض.
- **المحاكي:** `(dev)/assistance`.

---

## 6) طبقة التمويل (P09)

### 6.1 الفصل الرباعي
```
intent_created → provider_pending → provider_confirmed → verified
   (العميل)        (مزوّد)            (مزوّد)          (مالي/خادم)
                                                          ↓
                                              إيصال مشتق (لا كيان)

proposed → approved → paid_recorded → confirmed_by_beneficiary
 (Maker)   (Checker≠)   (مالي+إثبات)      (المستفيد)
                ↘ rejected      ↘ disputed → paid_recorded
```
**لا يُشتق بعضها من بعض.** التفصيل في `docs/FINANCE_ARCHITECTURE.md`.

### 6.2 الوحدات
| الوحدة | المسؤولية |
|--------|-----------|
| `state-machines/donation-machine.ts` | 6 حالات · حدّ كتابة العميل (Forbidden) |
| `state-machines/disbursement-machine.ts` | 6 حالات · فحص الفاعل |
| `state-machines/guards.ts` | Maker≠Checker · إثبات · حد تراكمي · حالة الطلب · `committedTotal` |
| `services/idempotency.ts` | مفتاح حتمي مشتق |
| `services/donation-intent-service.ts` | إنشاء/إلغاء/تسليم/محاكاة/تحقق |
| `services/disbursement-service.ts` | اقتراح/قرار/دفع/رد مستفيد |
| `services/receipt-service.ts` | إيصال مشتق بعد `verified` |
| `services/impact-service.ts` | real+verified + حجب (يعيد استخدام P07) |
| `services/finance-audit.ts` | Append-only بلا مبالغ/هويات |
| `catalog/program-kinds.ts` | 5 أنواع · qard_hasan إحالة فقط |

### 6.3 المزوّد
`providers/mock/demo-payment.ts` — العقد كما هو + دوال `__` للـdemo؛ `verifyExternalPayment` لا يخترع تأكيداً؛ الحاوية تستخدمه في demo فقط.

### 6.4 الشاشات
9 شاشات + محاكي `(dev)/finance`. اليقين بأيقونة+نص+لون (`CertaintyBadge`, `DisbursementStatusBadge`).

---

## 7) AppMode

| الوضع | Adapters | Registry |
|-------|----------|----------|
| `demo` | 12 mock (الدفع = Demo Payment) + 16 mock repos | `mock` → `connected` |
| `backend` (env كامل) | 12 NotConnected + 16 mock repos مؤقتاً | `configured` → `error` |
| `backend` (env ناقص) | نفسه | `disabled` → `error` |

كل شاشات المساعدات والتمويل وأقسام الرئيسية تعرض NotConnected في backend.

---

## 8) Provider Contracts (12)

Auth (15) · Database (marker) · Storage · Notification · **Payment (ADR-0005 — مزوّدان: mock بسيط وdemo دورة حياة)** · Email/Sms · Analytics · Maps/Search · Ai (ADR-0006) · Content.
التفصيل في `docs/INTEGRATIONS.md`.

---

## 9) Repository Contracts (16)

4 أنماط: Crud (9) · ReadOnly (1) · AppendOnly (2) · Custom (4).
**توسيعات إضافةً فقط:** P08 على Application (13 حالة + `update`/`submit`) · P09 على Donation/Disbursement (8 حالات لكل منهما + `advance`).
**قيود:** AppendOnly دلالة محفوظة (لا update/delete) · ReadOnly يمنع إنشاء محتوى · Audit بلا فلتر target.

---

## 10) Error Handling

`Result<T, AppError>` في كل المستودعات والمزوّدات. أكواد P09: `INVALID_TRANSITION` · `CLIENT_WRITE_FORBIDDEN` · `MAKER_REQUIRED` · `CHECKER_REQUIRED` · `MAKER_EQUALS_CHECKER` · `PROOF_REQUIRED` · `PROOF_TOO_LONG` · `INVALID_AMOUNT` · `AMOUNT_CAP_EXCEEDED` · `APPLICATION_NOT_APPROVED` · `PLEDGE_NOT_FOUND` · `PLEDGE_ALREADY_SETTLED` · `PROVIDER_NOT_DEMO` · `PROVIDER_NOT_CONFIRMED` · `NOT_DONATION_OWNER` · `NOT_BENEFICIARY` · `IDEMPOTENCY_KEY_REQUIRED` · `NO_INTENT` · `REFERENCE_NOT_MINTED`.

---

## 11) i18n و RTL

15 namespace · `ar` افتراضية · اللغة محفوظة.
نصوص P09 في `assistance:finance.*`.
**دروس ملزمة:** تطابق صيغة المفاتيح · كل Hook قبل أي `return` مبكر · لا `Date.now()` أثناء render · **`rerender` بعد تحديث متغيّر خارجي في الاختبارات**.

---

## 12) الوحدات الحدودية لـSDK (ADR-0022)

token-vault · image-pipeline · biometric · export-file · hash · document-pipeline.
**لا حزمة أصلية جديدة في المنطق المالي** — المزوّد التجريبي يحاكي داخلياً بلا IO.

---

## 13) Seed

`mocks/seed/*` خارج `src/`: محتوى مُختلق، `dataOrigin='demo'`، لا PII.
`buildDemoSeedBundle()` (15 collection) + `populateDemoSeed` (13/16).
مستقلان: `locations.ts` (P06) و`assistance.ts` (P08). **لا seed مالي جديد في P09** — النوايا تُنشأ من الواجهة.

---

## 14) أدوات المطور والفحوص

`(dev)/index` (وضع/Tier/لغة/اهتزاز/شارة/تعبئة Demo/روابط/إعادة ضبط) · `integrations` · `auth` · `assistance` · **`finance`** · بوابة إنتاج على كل `(dev)/*`.
`check-hardcoded-arabic.mjs` · `check-dead-buttons.mjs`.

---

## 15) Testing

- **Jest + jest-expo + RNTL v14** — **178 suites · 1138 tests** عند إغلاق P09 (بتقرير المالك).
- اصطلاحات: `__tests__` · `await render/fireEvent/unmount` · **`rerender` بعد تحديث متغيّر خارجي** · لا `act` حول fireEvent · `await act(() => …)` للمتاجر · `!`/`?? default` للفهرسة · mock لـ`Select`/`Modal` · **`invalidateQueries({queryKey:[feature]})`** · `setQueryData` للجلسة قبل render · `jest.mock` بعد الـimports.
- **غير مغطى بـJest:** الحركة الفعلية، Blur، الإيماءات، الخطوط، EXIF، البصمة، رفع المستندات، Carousel RTL، الكسل، **التدفق المالي على جهاز** ⇒ P20/P21.

---

## 16) CI

`npm ci` → Expo Doctor → audit (informational) → `lint` (يشمل العربية) → **Dead Buttons Check** → `typecheck` → `test --ci` → `web:export`.

---

## 17) الحالات الحرجة التي يجب عدم كسرها

1. `PaymentProvider` بلا charge/capture/refund/createIntent/createPaymentMethod (ADR-0005).
2. `AiProvider` بلا decide/approve/reject/block (ADR-0006).
3. `dataOrigin='demo'` على كل كائنات Seed.
4. لا `service_role` ولا أسرار في العميل.
5. `backend` لا ينكسر عند غياب env — NotConnected.
6. `@/` aliases عبر resolver-typescript (ADR-0008).
7. لا زر بلا وظيفة (يفشل CI).
8. قائمة سماح الروابط لا تُوسَّع إلا بتحديث `deep-links.ts` + اختبار.
9. حارس Staff deny-by-default.
10. `(dev)` محجوب في الإنتاج (Gallery + المحاكيان + أداة التعبئة).
11. اللغة محفوظة وتُطبَّق عند الإقلاع.
12. مجلد الاختبار `__tests__`.
13. لا توكنات في Zustand/AsyncStorage/الروابط/السجلات/التصدير.
14. إعادة مصادقة قبل تغيير كلمة المرور وقبل جدولة الحذف.
15. فشل معالجة الصورة/المستند ⇒ لا رفع.
16. كل capability معلَنة توجد كدالة في Mock وNotConnected معاً.
17. واجهات Expo داخل وحداتها الحدودية.
18. لا نشر لحالة دعم أو قصة بلا موافقة سارية.
19. بطاقة الدعم لا تحمل اسماً ولا مبلغاً ولا معرّف شخص.
20. حجب العدد يحجب المبلغ معه.
21. دلو Real لا يُعرض في الرئيسية قبل P18.
22. لا استعلام واحد كبير للرئيسية.
23. حد الـStagger 8 وكل مدة عبر `useMotion().duration()`.
24. المحرك لا يُنتج قراراً — `advisory:true` دائماً.
25. ثروة الأقارب والميراث غير المستلم لا تدخل أي حساب.
26. كل عتبة ونطاق من ملف القواعد.
27. النقاط لا تُعرض للمتقدم.
28. لا معرّف خام في المسودة أو السجل.
29. آلة الحالات تُفرَض في الخدمة؛ `update` لا يقبل status.
30. محاكيات `(dev)` demo فقط ولا تقرر نيابة عن المستخدم.
31. **العميل لا يكتب `verified` ولا أي حالة تبرع بعد `intent_created`.**
32. **لا إيصال قبل `verified`، ورقم Demo موسوم غير رسمي.**
33. **Maker ≠ Checker، وإثبات إلزامي، وحد تراكمي، وتأكيد المستفيد.**
34. **بيانات Demo لا تدخل تقرير الأثر.**
35. **لا تأكيد دفع مُختَرع في أي مزوّد.**
36. **دلالة AppendOnly محفوظة** — لا `update`/`delete` على Donation/Disbursement.
