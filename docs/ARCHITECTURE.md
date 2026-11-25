# ARCHITECTURE — عازب | AZIB

> يوثّق البنية التقنية بعد **P11 (Partner Marketplace, Contribution System & Ambassadors)**.
> **عام المستودع:** لا أسرار ولا بيانات شخصية.

---

## 1) نظرة عامة

```
┌──────────────────────────────────────────────────────────┐
│  app/ (Routes only)                                      │
│  Gate · (onboarding) (auth) (tabs) (features) (staff)    │
│  (dev) · profile · settings · legal · assistance ·        │
│  programs · weddings · partners                           │
└───────────────────────┬──────────────────────────────────┘
┌───────────────────────▼──────────────────────────────────┐
│  src/features/{shell,onboarding,auth,profile,settings,   │
│    legal,home,assistance,finance,weddings,partners,dev}  │
│  + components/{ui,brand,shell}                           │
└───────────────────────┬──────────────────────────────────┘
                        │ hooks
┌───────────────────────▼──────────────────────────────────┐
│  TanStack Query (حالة الخادم) + Zustand (7 stores)        │
└───────────────────────┬──────────────────────────────────┘
┌───────────────────────▼──────────────────────────────────┐
│  ProviderContainer: 12 Providers + 24 Repos + Registry   │
└───────────────────────┬──────────────────────────────────┘
┌───────────────────────▼──────────────────────────────────┐
│  mock | demo-payment | not-connected | (supabase P18)    │
└───────────────────────┬──────────────────────────────────┘
┌───────────────────────▼──────────────────────────────────┐
│  core (Result/AppError/logger) · config · i18n · theme   │
│  وحدات حدود SDK: token-vault · image-pipeline ·          │
│    biometric · export-file · hash · document-pipeline ·  │
│    partners/external-actions                             │
└──────────────────────────────────────────────────────────┘
```

**القاعدة الذهبية:** `app/` لا تستورد `not-connected/*` ولا `adapters/*`؛ كل شيء عبر hooks أو `useProviderContainer()`.
**قاعدة الاستيراد:** مكوّنات الميزة بمسارها النسبي؛ برميل `components/ui` لنظام التصميم فقط.

---

## 2) خريطة المسارات

```
app/
├─ _layout · index(Gate) · +not-found · maintenance
├─ (onboarding)/ · (auth)/ 6 · (tabs)/ 5 · (features)/ 8 · (staff)/
├─ (dev)/ index · integrations · auth · assistance · finance · partners · gallery
├─ profile/ index · edit
├─ settings/ 13 شاشة
├─ legal/ [doc]
├─ assistance/ index · conditions · pre-check · new · mine · [id]/4
├─ programs/ index · [id] · kind/[kind] · donate/[id] · donations ·
│            receipts · disbursements · impact · provider-requirements
├─ weddings/ new · [id]/9
└─ partners/                     # P11 — بلا index.tsx (ADR-0053)
   ├─ register · dashboard · ambassador · saved
   ├─ offers/ new · [offerId] · edit/[offerId]
   └─ [id]/ index · offers
```

**مصدر الحقيقة:** `src/constants/routes.ts`.

### 2.1 الحراس
| المسار | الحارس |
|--------|--------|
| `(tabs)/*` | `useShellGate` |
| `(staff)/*` | `StaffLayoutGate` + `hasStaffRole` |
| `(dev)/*` | بوابة إنتاج → NotFound |
| `profile/*` · بعض `settings/*` | `RequireAuth` |
| `assistance/{new,mine,[id]/*}` | `RequireAuth` + ملكية |
| `programs/{donate,donations,receipts,disbursements}` | `RequireAuth` + ملكية |
| `weddings/new` · `weddings/[id]/{members,polls,budget,agreement,chat,countdown,completion,services}` | `RequireAuth` |
| **`weddings` (التبويب) · `weddings/[id]` (التفاصيل)** | **عام بإسقاط عام** |
| **`partners/{register,dashboard,ambassador,saved,offers/*}`** | **`RequireAuth` + ملكية الشريك** |
| **`partners` (التبويب) · `partners/[id]/*`** | **عام (دليل)** |

> الحارس واجهة فقط؛ الحماية الفعلية RLS في P18 (قاعدة 19).

---

## 3) طبقة المصادقة (P06)
`auth-machine` · `token-vault` · `use-auth` · `use-otp` · `consents` · `RequireAuth` · 6 شاشات. عقد Auth = **15 capability**.
**المتاجر (7):** app-mode · onboarding · language · auth · settings · shell · assistance-draft.

---

## 4) طبقة الرئيسية (P07)
`HomeConfigSource` قابل للتبديل · استعلام لكل قسم · `SectionShell`/`Boundary`/`Lazy`/`Stagger(≤8)` · 8 أقسام · بوابة موافقة fail-closed · تعقيم · إخفاء الأعداد والمبالغ · فصل Demo/Real.
**قيد:** قسم العروض يقرأ `discountPercent` فقط (#71).

---

## 5) طبقة المساعدات (P08)
المحرك النقي (rules→gates→components→bands→flags) · آلة 11 حالة في الخدمة · **document-pipeline** (فحص/إعادة ترميز/فشل⇒لا رفع) · مسودة ببصمات · Wizard 8 خطوات · متابعة/استكمال/قرار/اعتراض · محاكي `(dev)/assistance`.

---

## 6) طبقة التمويل (P09)
الفصل الرباعي · آلتا التبرع/الصرف · Maker≠Checker · حد تراكمي · إيصال مشتق · Idempotency حتمية · تقرير أثر real+verified · محاكي `(dev)/finance`.

---

## 7) طبقة الأعراس الجماعية (P10)
`engine` (cost-sharing/largest-remainder/withdrawal/discovery) · `state` (group-machine 6/10 · roles · poll-rules · approvals) · `chat` (filter/rate/retention/moderation) · 4 مستودعات · `subscribe` محلي يكتب في Query cache · ميزانية بنسخ + إجماع · اتفاق Append-only · عد تنازلي + Confetti · محاكي Maker/Checker.

---

## 8) طبقة السوق والسفراء (P11)

### 8.1 البنية
```
state/     partner-machine (6 حالات/10 انتقالات) · offer-machine (7/8) ·
           verification (isVerified من السجل) · expiry · permissions
lib/       phone (تنظيف يمني) · external-links (سماح + builders) ·
           categories (14) · stats (تجميع + حجب) · filters
config/    limits (audience · reverification · media)
schemas/   offer (draft/report) · registration (partner/ambassador/task)
services/  external-actions (حدود SDK) · engagement · media ·
           registration · verification · offer-lifecycle · ambassador
hooks/     browser · profile · offer-detail · offer-actions · saved ·
           registration · my-partner · offer-composer · ambassador
components/PartnerScaffold · VerifiedCrown · DiscountValue ·
           ValidityCountdown · PartnerCard · OfferCard · ReportOfferForm ·
           VerificationStatusBadge · OfferStatusBadge · MediaUploadField
screens/   Browser · Profile · OfferList · OfferDetail · SavedOffers ·
           Register · Dashboard · OfferComposer · Ambassador
```

### 8.2 آلة حالة الشريك (6 حالات · 10 انتقالات)

| من | إلى | الفاعل |
|---|---|---|
| `draft` | `pending_verification` | partner_owner |
| `pending_verification` | `verified` · `rejected` | partner_verifier |
| `rejected` | `pending_verification` | partner_owner |
| `verified` | `suspended` | moderator |
| `verified` | `expired` | system |
| `verified` | `pending_verification` | partner_verifier |
| `suspended` | `verified` | admin |
| `suspended` | `expired` | system |
| `expired` | `pending_verification` | partner_owner |

**لا حالة نهائية** — كلها قابلة للاستعادة. **الشارة ليست حالة**: `isVerified(verification, now)` تقرأ السجل فقط (ADR-0052).

### 8.3 آلة حالة العرض (7 حالات · 8 انتقالات)

| من | إلى | الفاعل |
|---|---|---|
| `draft` | `in_review` | partner_owner |
| `in_review` | `approved` · `rejected` | reviewer |
| `approved` | `active` | reviewer (**يتطلب سجل تحقق ساري**) |
| `active` | `expired` | **system** |
| `active` | `cancelled` | partner_owner |
| `expired` | `in_review` | partner_owner (تجديد) |
| `rejected` | `in_review` | partner_owner |
| `cancelled` | — (نهائية) | — |

`isClientWritableOfferStatus('expired') === false`؛ العميل يحسب الانتهاء ويعرضه فقط.

### 8.4 المستودعات الأربعة (⇒ 24)
| المستودع | المحتوى |
|----------|---------|
| `partnerVerifications` | سجل التحقق (submit/decide/getLatest/listByPartner) — **مصدر الشارة** |
| `offerReports` | بلاغات العروض (سبب + تفصيل + حسم) |
| `partnerEngagement` | حفظ per-user + **عدّادات مشاهدة تجميعية بلا معرّف مشاهد** |
| `ambassadors` | طلبات · مهام بالمناطق · صور نشاط |

### 8.5 الروابط الخارجية (ADR-0054)
سماح: `tel:` · `https://wa.me/` · `geo:` · `maps:` · `https://maps.google.com/`. builders من رقم منظّف؛ تأكيد قبل واتساب/الخرائط؛ `tel:` مباشر؛ مشاركة برابط `azib://` حقيقي. **وحدة حدودية واحدة** لـ`expo-linking` + `Share`.

### 8.6 رفع الوسائط (ADR-0059)
`media-service` tái يستخدم `pickImageDocument`/`pickPdfDocument`/`prepareDocument` من P08 بحدود `PARTNER_MEDIA_LIMITS`. فشل المعالجة ⇒ لا رفع. مستندات التحقق خاصة بالمراجعين.

### 8.7 صلاحيات السفير (ADR-0057)
deny-list صريحة + **غياب القدرة في التبعيات** (`AmbassadorDeps` = ambassadors + audit فقط) + تقييد المهمة بالمنطقة المعتمدة.

### 8.8 المحاكي
`(dev)/partners` ينفّذ قرارات التحقق ومراجعة/نشر/انتهاء العروض وقبول السفراء وإسناد المهام عبر **نفس الخدمات**، بفاعل `admin` موسوم، ومحصور بوضع demo وبوابة الإنتاج.

---

## 9) AppMode

| الوضع | Adapters | Registry |
|-------|----------|----------|
| `demo` | 12 mock (الدفع = Demo Payment) + **24 mock repos** | `mock` → `connected` |
| `backend` (env كامل) | 12 NotConnected + 24 mock repos مؤقتاً | `configured` → `error` |
| `backend` (env ناقص) | نفسه | `disabled` → `error` |

**قيد:** `WeddingChatApi` بلا `refetch` ⇒ شاشة الدردشة بلا إعادة محاولة (#66).

---

## 10) Provider Contracts (12)
Auth (15) · Database · Storage · Notification · Payment (ADR-0005) · Email/Sms · Analytics · Maps/Search · Ai (ADR-0006) · Content.
**لا مزوّد 13** — البث اللحظي في المستودع (ADR-0041)، والروابط الخارجية في وحدة حدودية (ADR-0054).

---

## 11) Repository Contracts (24)
4 أنماط أصلية ⇒ 16، **+ 4 للمجموعة (P10)**، **+ 4 للسوق (P11)** ⇒ 24.
**توسيعات إضافةً فقط:** Application (P08) · Donation/Disbursement (P09) · Wedding (P10) · Partner/Offer (P11).
**قيود:** AppendOnly دلالة محفوظة · ReadOnly يمنع إنشاء محتوى · Audit بلا فلتر target · Group/Poll/Budget/Chat/Verification/Report/Engagement/Ambassador في الذاكرة حتى P18.

---

## 12) Error Handling
`Result<T, AppError>` في كل المستودعات والمزوّدات.
**قاعدة P11:** لا كائن خطأ مُصنّع؛ `AppError.*` دائماً؛ ولا `ok:true/value:null` عند غياب مورد مطلوب.
أكواد P11: `INVALID_TRANSITION` · `NOT_MEMBER` · `NO_PERMISSION` · `NOT_PARTNER_OWNER` · `PARTNER_NOT_FOUND` · `PARTNER_SUSPENDED` · `PARTNER_NOT_VERIFIED` · `VERIFICATION_NOT_FOUND` · `ALREADY_DECIDED` · `REASON_REQUIRED` · `DOCUMENTS_REQUIRED` · `OFFER_NOT_FOUND` · `OFFER_NOT_EDITABLE` · `AUDIENCE_NOT_APPROVED` · `INVALID_VALIDITY_WINDOW` · `INVALID_REGISTRATION` · `INVALID_OFFER` · `INVALID_REPORT` · `INVALID_APPLICATION` · `ALREADY_APPLIED` · `NOT_ASSIGNED` · `REGION_NOT_ASSIGNED` · `TASK_ALREADY_SUBMITTED` · `EXTERNAL_URL_BLOCKED` · `EMPTY_SHARE` · `INVALID_SAVE` · `INVALID_OFFER`.
**قيد:** بعض الأكواد بلا خريطة i18n مخصصة ⇒ مفتاح عام (#76).

---

## 13) i18n و RTL
15 namespace · `ar` افتراضية · اللغة محفوظة.
نصوص P11 في `marketplace:*`.
**دروس ملزمة:** تطابق صيغة المفاتيح · كل Hook قبل أي `return` مبكر · لا ساعة في render · `rerender` في الاختبارات · **`locales/*.json` خارج فاحص العربية ⇒ مراجعة بشرية**.

---

## 14) الوحدات الحدودية لـSDK (ADR-0022)
token-vault · image-pipeline · biometric · export-file · hash · document-pipeline · **partners/external-actions**.
**P11 لم يضف حزمة أصلية** — `expo-linking` موجود، و`Image`/`Share` من react-native.

---

## 15) Seed
`mocks/seed/*` خارج `src/`: محتوى مُختلق، `dataOrigin='demo'`، لا PII.
مستقلة لا تمسّ الحزمة: `assistance.ts` (P08) · `wedding-planning.ts` (P10) · **`partner-marketplace.ts` (P11)**.
`partners.ts`/`offers.ts` مُمدّدان (بلا هواتف في الحزمة؛ قيم الخصم placeholder).
**`populateDemoSeed` لم يُربط بمستودعات P10/P11** (#14).

---

## 16) أدوات المطور والفحوص
`(dev)/index` · `integrations` · `auth` · `assistance` · `finance` · **`partners`** · بوابة إنتاج على كل `(dev)/*`.
`check-hardcoded-arabic.mjs` (`app/` + `src/`, `.ts/.tsx`, عدا `src/locales/`) · `check-dead-buttons.mjs`.
**قيد الفاحص:** لا يكشف زراً معطّلاً منطقياً (درس P11.3).

---

## 17) Testing
- **Jest + jest-expo + RNTL v14** — **231 suites · 1396 tests** عند إغلاق P11 (بتقرير المالك).
- اصطلاحات: `__tests__` · `await render/fireEvent/unmount` · **`rerender`** · **موكات بمعاملات صريحة** · موك `Share` يعيد `activityType` · لا `act` حول fireEvent · `invalidateQueries({queryKey:[feature]})` · `setQueryData` للجلسة قبل render · الساعة المحقونة توافق ساعة التخزين.
- **غير مغطى بـJest:** الحركة الفعلية، Blur، الخطوط، EXIF، البصمة، رفع الوسائط، Carousel RTL، Confetti/الحلقات، **tel:/wa.me/الخرائط**، التدفق الكامل ⇒ P20/P21.

---

## 18) CI
`npm ci` → Expo Doctor → audit (informational) → `lint` (يشمل العربية) → **Dead Buttons Check** → `typecheck` → `test --ci` → `web:export`.

---

## 19) الحالات الحرجة التي يجب عدم كسرها

1. `PaymentProvider` بلا charge/capture/refund/createIntent/createPaymentMethod.
2. `AiProvider` بلا decide/approve/reject/block.
3. `dataOrigin='demo'` على كل كائنات Seed.
4. لا `service_role` ولا أسرار في العميل.
5. `backend` لا ينكسر عند غياب env.
6. `@/` aliases عبر resolver-typescript.
7. لا زر بلا وظيفة — **ولا زر معطّل منطقياً بسبب مدخلات غائبة**.
8. قائمة سماح الروابط لا تُوسَّع إلا بتحديث + اختبار.
9. حارس Staff deny-by-default.
10. `(dev)` محجوب في الإنتاج.
11. اللغة محفوظة وتُطبَّق عند الإقلاع.
12. مجلد الاختبار `__tests__`.
13. لا توكنات في Zustand/AsyncStorage/الروابط/السجلات/التصدير.
14. إعادة مصادقة قبل تغيير كلمة المرور وقبل جدولة الحذف.
15. فشل معالجة الصورة/المستند ⇒ لا رفع.
16. كل capability معلَنة توجد كدالة في Mock وNotConnected.
17. واجهات Expo داخل وحداتها الحدودية.
18. لا نشر بلا موافقة سارية.
19. بطاقة الدعم بلا اسم/مبلغ/معرّف.
20. حجب العدد يحجب المبلغ معه.
21. دلو Real لا يُعرض في الرئيسية قبل P18.
22. لا استعلام واحد كبير للرئيسية.
23. حد الـStagger 8.
24. المحرك لا يُنتج قراراً.
25. ثروة الأقارب والميراث غير المستلم لا تدخل أي حساب.
26. كل عتبة ونطاق من ملف القواعد.
27. النقاط لا تُعرض للمتقدم.
28. لا معرّف خام في المسودة أو السجل.
29. آلة الحالات تُفرَض في الخدمة.
30. محاكيات `(dev)` demo فقط.
31. العميل لا يكتب `verified` (تبرع).
32. لا إيصال قبل `verified`.
33. Maker ≠ Checker + إثبات + حد تراكمي + تأكيد المستفيد.
34. بيانات Demo لا تدخل تقرير الأثر.
35. لا تأكيد دفع مُختَرع.
36. دلالة AppendOnly محفوظة.
37. مجموع حصص التكاليف = الإجمالي دائماً، وبأعداد صحيحة.
38. لا اعتماد ميزانية بلا إجماع؛ أي تعديل يصفّر الموافقات.
39. الخدمة تسلك مسار الآلة المعلن ولا تقفز حالتين.
40. كل مسار بلا `RequireAuth` يُسقط إسقاطاً عاماً — والحلقات مع التاريخ.
41. اسم العرض داخل المجموعة بموافقة صاحبه فقط.
42. قواعد الدردشة مفروضة في الخدمة، والاحتفاظ محدود.
43. **شارة التوثيق من سجل تحقق ساري فقط؛ والنشر مشروط به.**
44. **الروابط الخارجية بقائمة سماح، وتأكيد قبل المغادرة.**
45. **السفير لا يملك قدرة الوصول لمستندات التحقق أو بيانات المستفيدين.**
46. **مشاهدات تجميعية بلا هويات، وأعداد صغيرة محجوبة.**
47. **الآلة قبل الكتابة في كل خدمة؛ ولا خطأ مُصنّع ولا نجاح كاذب.**
48. **مكوّنات الميزة تُستورد بمسارها النسبي لا من برميل نظام التصميم.**
