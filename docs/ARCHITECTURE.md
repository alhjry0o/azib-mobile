# ARCHITECTURE — عازب | AZIB

> يوثّق البنية التقنية بعد **P08 (Assistance & Eligibility Engine)**.
> **عام المستودع:** لا أسرار ولا بيانات شخصية.

---

## 1) نظرة عامة

```
┌──────────────────────────────────────────────────────────┐
│  app/ (Routes only)                                      │
│  Gate · (onboarding) (auth) (tabs) (features) (staff)    │
│  (dev) · profile · settings · legal · assistance          │
└───────────────────────┬──────────────────────────────────┘
┌───────────────────────▼──────────────────────────────────┐
│  src/features/{shell,onboarding,auth,profile,settings,   │
│                legal,home,assistance,dev}                │
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
│  mock | not-connected | (supabase P18)                   │
└───────────────────────┬──────────────────────────────────┘
┌───────────────────────▼──────────────────────────────────┐
│  core (Result/AppError/logger) · config (env) · i18n     │
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
├─ (dev)/ index · integrations · auth · assistance · gallery
├─ profile/ index · edit
├─ settings/ index · account · language · appearance · numbers · notifications
│            privacy · help · about · security · devices · delete-account · export-data
├─ legal/ [doc]
└─ assistance/                      # P08 (ADR-0029)
   ├─ index (programs) · conditions · pre-check · new (wizard) · mine
   └─ [id]/ index (detail+timeline) · info-request · decision · appeal
```

**مصدر الحقيقة:** `src/constants/routes.ts` (`ROUTES` + دوال المسارات الديناميكية + `TABS` + `href()`).

### 2.1 Gate
`resolveGate()` نقية: loading / onboarding / auth(→Welcome) / verify / ready / not-connected / error. الضيف يمرّ إلى التبويبات.

### 2.2 الحراس
| المسار | الحارس |
|--------|--------|
| `(tabs)/*` | `useShellGate` |
| `(staff)/*` | `StaffLayoutGate` + `hasStaffRole` (deny-by-default) |
| `(dev)/*` | بوابة إنتاج → NotFound |
| `profile/*` | `RequireAuth` |
| `settings/{account,privacy,security,devices,delete-account,export-data}` | `RequireAuth` |
| `settings/{language,appearance,numbers,help,about}` | عام |
| `assistance/{new,mine,[id]/*}` | `RequireAuth` + **فحص ملكية** في شاشة التفاصيل |
| `assistance/{index,conditions,pre-check}` | عام (اكتشاف) |
| شاشة الأمان | `BiometricGate` عند تفعيل القفل |

> الحارس واجهة فقط؛ الحماية الفعلية RLS في P18 (قاعدة 19).

---

## 3) طبقة المصادقة (P06)

`auth-machine` (5 حالات) · `token-vault` · `use-auth` · `use-otp` · `consents` · `errors` · `RequireAuth` · 6 شاشات.
عقد `AuthProvider` = **15 capability** (التفصيل في `docs/INTEGRATIONS.md`).

**المتاجر (7 — حالة عميل فقط):** app-mode · onboarding · language · auth (ضيف + challenge) · settings (تفضيلات + تخصيص الرئيسية) · shell (dialog/sheet/badge) · **assistance-draft** (مسودة غير مُرسلة، بصمات لا معرّفات).
**ممنوع:** توكنات أو كلمات مرور أو معرّفات خام أو بيانات خادم في أي متجر.

---

## 4) طبقة الرئيسية (P07)

- `HomeConfigSource` قابل للتبديل + تخصيص محفوظ؛ `SECTION_REGISTRY` يرشّح المنفَّذ.
- استعلام لكل قسم بمفتاح `['home', mode, id]`؛ `resolveSectionStatus` نقية.
- `SectionShell` (4 حالات + إجراء فارغ) · `SectionErrorBoundary` (عزل + إعادة محاولة القسم) · `LazySection` (ظهور + fallback 700ms) · `Stagger` (حد 8).
- 8 أقسام؛ بوابة موافقة fail-closed؛ تعقيم بطاقة الدعم؛ إخفاء الأعداد والمبالغ؛ فصل Demo/Real.
- `FlatList` مضبوط + Pull-to-Refresh (`refreshing`/`onRefresh` مباشرة).

---

## 5) طبقة المساعدات (P08)

### 5.1 المحرك (نقي)
```
rules.types → rules.v1 (نسخة سارية) → rules-source (قابل للتبديل)
                     ↓
gates (4) → score-application (6 مكوّنات) → bands (4) → flags (5)
                     ↓
        AdvisoryEvaluation { advisory:true, ruleVersion, … }
```
- لا React، لا IO، لا ساعة إلا المُحقنة.
- فشل بوابة ⇒ لا نقاط ولا قرار؛ الأعلام لا تغيّر النقاط.
- ثروة الأقارب والميراث غير المستلم والأصول غير المتاحة **مستبعدة**.
- كل عتبة ونطاق من ملف القواعد. التفصيل الكامل في `docs/ELIGIBILITY_ENGINE.md`.

### 5.2 آلة الحالات
- 11 حالة · 18 انتقالاً · فاعل لكل انتقال · حالتان نهائيتان.
- `toWorkflowStatus` يترجم legacy (`reviewing`, `disbursed`) عند القراءة فقط.
- **الفرض في `workflow-service`** لا في المستودع؛ `updateStatus` يبقى متساهلاً لعقد P03 وP17.

### 5.3 الخدمات
| الوحدة | المسؤولية |
|--------|-----------|
| `hash.ts` | SHA-256 عبر `expo-crypto` — **وحدة حدودية** |
| `dedup-service.ts` | واجهة + Mock: بصمة هوية/هاتف/مستند + نافذة إرسال |
| `audit-trail.ts` | Append-only بميتاداتا محدودة |
| `workflow-service.ts` | يفرض الآلة + يحرس الاعتراض + يكتب التدقيق |
| `document-pipeline.ts` | picker + فحص من القواعد + `manipulateAsync` + بصمة — **وحدة حدودية** |
| `submission-service.ts` | dedup → score → create → attach → submit + audit |

### 5.4 الرحلة
- `assistance-draft.store` (7 مجموعات + خطوة + مستندات + إقرارات) —autosave + تعافٍ.
- Wizard 8 خطوات: Applicant · Income · Assets · Obligations · Engagement · Documents · Review · Submit.
- Zod لكل خطوة؛ أخطاء Inline بمفاتيح i18n؛ `NumericField` أعداد صحيحة فقط.
- بعد الإرسال: بطاقة نتيجة بالرقم المرجعي (من المزوّد، موسوم Demo).

### 5.5 المتابعة
- `useMyApplications` · `useApplicationDetail` (ملكية) · `useApplicationTimeline` (من التدقيق).
- `useAssistanceActions`: إعادة إرسال · اعتراض · إلغاء (deps بـ`useMemo`).
- شاشات: طلباتي · التفاصيل+Timeline · الاستكمال · القرار · الاعتراض.
- **النقاط لا تُعرض**؛ الأسباب من كتالوج i18n؛ الاعتراض مرة واحدة داخل النافذة.

### 5.6 المحاكي
`(dev)/assistance`: إنشاء طلب تجريبي كامل + انتقالات مراجع/مالي عبر نفس الخدمة + منتقي أسباب/حقول. demo فقط، وبوابة الإنتاج تحجبه. **لا قرار آلي في مسار المستخدم.**

---

## 6) AppMode

| الوضع | Adapters | Registry |
|-------|----------|----------|
| `demo` | 12 mock + 16 mock repos | `mock` → `connected` |
| `backend` (env كامل) | 12 NotConnected + 16 mock repos مؤقتاً | `configured` → `error` |
| `backend` (env ناقص) | نفسه | `disabled` → `error` |

كل شاشات المساعدات وأقسام الرئيسية تعرض NotConnected في backend.

---

## 7) Provider Contracts (12)

Auth (15 capability) · Database (marker) · Storage (صور + مستندات) · Notification · Payment (ADR-0005) · Email/Sms · Analytics · Maps/Search · Ai (ADR-0006) · Content.
**ملاحظة P08:** محرك الأهلية **لا يمرّ عبر `AiProvider`** — إنه دالة نقية محلية؛ `AiProvider.scoreEligibility` يبقى capacidade استشارية عامة منفصلة.

---

## 8) Repository Contracts (16)

4 أنماط: Crud (9) · ReadOnly (1) · AppendOnly (2) · Custom (4).
**توسيع P08 (إضافةً فقط):** `Application` + 8 حقول اختيارية + `update` + `submit`، و13 حالة مع legacy محفوظ.
**قيود مكتشفة:** AppendOnly يمنع تأكيد التبرعات · ReadOnly يمنع إنشاء محتوى · Audit بلا فلتر `target`.

---

## 9) Error Handling

`Result<T, AppError>` في كل المستودعات والمزوّدات. الشاشات تستهلك hooks وتعرض loading/error/empty/not-connected. `authErrorKey()` يقدّم أكواد المزوّد. أكواد P08: `INVALID_TRANSITION` · `APPEAL_ALREADY_USED` · `APPEAL_WINDOW_CLOSED` · `NO_SESSION` · `NO_PROGRAM` · `INVALID_AMOUNT` · `REFERENCE_NOT_MINTED` · `UNSUPPORTED_DOCUMENT_TYPE` · `DOCUMENT_TOO_LARGE` · `DOCUMENT_PROCESSING_FAILED`.

---

## 10) i18n و RTL

15 namespace · `ar` افتراضية · اللغة محفوظة وتُطبَّق عند الإقلاع.
نصوص P08 كلها في `assistance:` (محرك/بوابات/نطاقات/أعلام/حالات/أسباب/استكمال/مستندات/wizard/dev).
**دروس ملزمة:** تطابق صيغة المفاتيح بين JSON والكود · كل Hook قبل أي `return` مبكر · لا `Date.now()` أثناء render.

---

## 11) الوحدات الحدودية لـSDK (ADR-0022)

token-vault (secure-store) · image-pipeline (picker + `manipulateAsync`) · biometric (local-authentication) · export-file (`File`/`Paths` + sharing) · **hash (expo-crypto)** · **document-pipeline (document-picker + image-picker + manipulator)**.

---

## 12) Seed

`mocks/seed/*` خارج `src/`: محتوى مُختلق، `dataOrigin='demo'`، لا PII.
`buildDemoSeedBundle()` (15 collection) + `populateDemoSeed` (13/16).
**مستقلان لا يمسّان الحزمة:** `locations.ts` (P06) و`assistance.ts` (P08).

---

## 13) أدوات المطور والفحوص

`(dev)/index` (وضع/Tier/لغة/اهتزاز/شارة/تعبئة Demo/روابط/إعادة ضبط) · `integrations` · `auth` · **`assistance` (محاكي المراجعة)** · بوابة إنتاج على كل `(dev)/*`.
`check-hardcoded-arabic.mjs` (app/ + src/) · `check-dead-buttons.mjs` (app/ + src/features/، يستثني Gallery و`__tests__`).

---

## 14) Testing

- **Jest + jest-expo + RNTL v14** — **155 suites · 1020 tests** عند إغلاق P08 (بتقرير المالك).
- اصطلاحات: `__tests__` · `await render/fireEvent/unmount` · لا `act` حول fireEvent · `await act(() => …)` للمتاجر · `useEffect` للالتقاط · `!`/`?? default` للفهرسة · mock لـ`Select`/`Modal` · **`invalidateQueries({queryKey:[feature]})` دائماً** · `setQueryData` للجلسة قبل render · `waitFor` على الحالة النهائية · `jest.mock` بعد الـimports.
- **غير مغطى بـJest:** الحركة الفعلية، Blur، الإيماءات، الخطوط، EXIF، البصمة، رفع المستندات على جهاز، Carousel RTL، سلوك الكسل، التدفق الكامل ⇒ P20/P21.

---

## 15) CI

`npm ci` → Expo Doctor → audit (informational) → `lint` (يشمل العربية) → **Dead Buttons Check** → `typecheck` → `test --ci` → `web:export`.

---

## 16) الحالات الحرجة التي يجب عدم كسرها

1. `PaymentProvider` بلا charge/capture/refund/createIntent (ADR-0005).
2. `AiProvider` بلا decide/approve/reject/block (ADR-0006).
3. `dataOrigin='demo'` على كل كائنات Seed.
4. لا `service_role` ولا أسرار في العميل.
5. `backend` لا ينكسر عند غياب env — NotConnected.
6. `@/` aliases عبر resolver-typescript (ADR-0008).
7. لا زر بلا وظيفة (يفشل CI).
8. قائمة سماح الروابط لا تُوسَّع إلا بتحديث `deep-links.ts` + اختبار.
9. حارس Staff deny-by-default؛ الأدوار من الجلسة.
10. `(dev)` محجوب في الإنتاج (Gallery + المحاكي + أداة التعبئة).
11. اللغة محفوظة وتُطبَّق عند الإقلاع.
12. مجلد الاختبار `__tests__`.
13. لا توكنات في Zustand/AsyncStorage/الروابط/السجلات/التصدير.
14. إعادة مصادقة قبل تغيير كلمة المرور وقبل جدولة الحذف.
15. فشل معالجة الصورة/المستند ⇒ لا رفع.
16. كل capability معلَنة توجد كدالة في Mock وNotConnected معاً.
17. واجهات Expo داخل وحداتها الحدودية.
18. لا نشر لحالة دعم أو قصة بلا موافقة سارية (ADR-0024).
19. بطاقة الدعم لا تحمل اسماً ولا مبلغاً ولا معرّف شخص.
20. حجب العدد يحجب المبلغ معه (ADR-0025).
21. دلو Real لا يُعرض قبل P18 (ADR-0026).
22. لا استعلام واحد كبير للرئيسية.
23. حد الـStagger 8 وكل مدة عبر `useMotion().duration()`.
24. **المحرك لا يُنتج قراراً** — `advisory:true` دائماً ولا حقل قرار (ADR-0028).
25. **ثروة الأقارب والميراث غير المستلم لا تدخل أي حساب** (HRD P08 §3).
26. **كل عتبة ونطاق من ملف القواعد** — لا أرقام مثبّتة في المحرك/الواجهة/الاختبارات.
27. **النقاط لا تُعرض للمتقدم**؛ الأسباب من كتالوج i18n فقط.
28. **لا معرّف خام في المسودة أو السجل** — بصمة فقط (ADR-0030).
29. **الآلة تُفرَض في الخدمة**؛ `update` لا يقبل status؛ `submit` ذرّي.
30. **المحاكي demo فقط** ولا ينفّذ قراراً في مسار المستخدم.
