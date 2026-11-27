# ARCHITECTURE — عازب | AZIB

> يوثّق البنية التقنية بعد **P12 (Souk Al Khair)**.
> **عام المستودع:** لا أسرار ولا بيانات شخصية.

---

## 1) نظرة عامة

```
┌──────────────────────────────────────────────────────────┐
│  app/ (Routes only)                                      │
│  Gate · (onboarding) (auth) (tabs) (features) (staff)    │
│  (dev) · profile · settings · legal · assistance ·        │
│  programs · weddings · partners · souk                    │
└───────────────────────┬──────────────────────────────────┘
┌───────────────────────▼──────────────────────────────────┐
│  src/features/{shell,onboarding,auth,profile,settings,   │
│    legal,home,assistance,finance,weddings,partners,souk, │
│    dev}                                                  │
│  + components/{ui,brand,shell}                           │
└───────────────────────┬──────────────────────────────────┘
                        │ hooks  ← تصغير البيانات هنا
┌───────────────────────▼──────────────────────────────────┐
│  TanStack Query (حالة الخادم) + Zustand (7 stores)        │
└───────────────────────┬──────────────────────────────────┘
┌───────────────────────▼──────────────────────────────────┐
│  ProviderContainer: 12 Providers + 27 Repos + Registry   │
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
**قاعدة البيانات:** الإسقاط العام **وتصغير الحقول الحساسة** يجريان **عند حدود الـhook** لا في الواجهة (ADR-0065).

---

## 2) خريطة المسارات

```
app/
├─ _layout · index(Gate) · +not-found · maintenance
├─ (onboarding)/ · (auth)/ 6 · (tabs)/ 5 · (features)/ 7 · (staff)/
├─ (dev)/ index · integrations · auth · assistance · finance · partners · souk · gallery
├─ profile/ index · edit
├─ settings/ 13 شاشة
├─ legal/ [doc]
├─ assistance/ index · conditions · pre-check · new · mine · [id]/4
├─ programs/ index · [id] · kind/[kind] · donate/[id] · donations ·
│            receipts · disbursements · impact · provider-requirements
├─ weddings/ new · [id]/9
├─ partners/ register · dashboard · ambassador · saved · offers/* · [id]/*
└─ souk/                         # P12 — يملك /souk بـindex (ADR-0061)
   ├─ _layout · index · new · mine · requests · inbox
   ├─ coordination/[requestId] · handover/[requestId]
   └─ [id]/ index · request · report
```

**مصدر الحقيقة:** `src/constants/routes.ts`.

### 2.1 الحراس (بدقة)
| المسار | الحارس |
|--------|--------|
| `(tabs)/*` | `useShellGate` |
| `(staff)/*` | `StaffLayoutGate` + `hasStaffRole` (deny-by-default) |
| `(dev)/*` | بوابة إنتاج → NotFound |
| `profile/*` · بعض `settings/*` | `RequireAuth` |
| `assistance/{new,mine,[id]/*}` | `RequireAuth` + ملكية |
| `programs/{donate,donations,receipts,disbursements}` | `RequireAuth` + ملكية |
| `weddings/new` · `weddings/[id]/{members,polls,budget,agreement,chat,countdown,completion,services}` | `RequireAuth` |
| `weddings` (التبويب) · **`weddings/[id]` (التفاصيل)** | **عام بإسقاط عام** |
| `partners/{register,dashboard,ambassador,saved,offers/*}` | `RequireAuth` + ملكية الشريك |
| `partners` (التبويب) · `partners/[id]/*` | **عام (دليل)** |
| **`souk` (المتصفح) · `souk/[id]` (التفاصيل)** | **عام بإسقاط عام** — لا `donorId` ولا `estimatedValue` ولا عنوان دقيق |
| **`souk/{new,mine,requests,inbox}`** | **`RequireAuth`** |
| **`souk/[id]/{request,report}`** | **`RequireAuth`** |
| **`souk/coordination/[requestId]` · `souk/handover/[requestId]`** | **`RequireAuth`** + طرفية في الخدمة + **تصغير الرمز عند الـhook** |

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
`engine` (cost-sharing/largest-remainder/withdrawal/discovery) · `state` (group-machine 6/10 · roles · poll-rules · approvals) · `chat` (filter/rate/retention/moderation) · 4 مستودعات · `subscribe` محلي · ميزانية بنسخ + إجماع · اتفاق Append-only · عد تنازلي + Confetti · محاكي Maker/Checker.

---

## 8) طبقة الشركاء والسفراء (P11)
`state` (partner-machine 6/10 · offer-machine 7/8 · verification · expiry · permissions) · `lib` (phone/external-links/categories/stats/filters) · 4 مستودعات · الشارة من سجل التحقق · روابط خارجية بقائمة سماح · تسجيل/لوحة/عروض · سفراء بمهام ميدانية · محاكي `(dev)/partners`.

---

## 9) طبقة سوق خير (P12)

### 9.1 البنية
```
state/     item-machine (8 حالات/10 انتقالات) · request-machine (5/9) ·
           contact-disclosure · handover · sale-lexicon · permissions ·
           limits · filters (11 تصنيفاً) · duplicate · stats ·
           public-view · error-keys
schemas/   item (draft/report) · request (request/handover/rating/message)
services/  media (يعيد استخدام خط P08) · item · request ·
           coordination · handover · report
hooks/     limits · browser · item · composer · mine ·
           inbox · coordination · handover · report
components/SoukScaffold · SoukBadges (4) · GiftEmptyState (3D) ·
           SoukImageGallery · SoukItemCard · SafeMeetingNote ·
           ContactDisclosureCard · HandoverCodeCard
screens/   Browser · ItemDetail · ItemComposer · Request · MyItems ·
           MyRequests · Inbox · Coordination · Handover · Report
```

### 9.2 آلة حالة العنصر (8 حالات · 10 انتقالات)

| من | إلى | الفاعل |
|---|---|---|
| `draft` | `pending_review` · `available` | donor (حسب الإعداد) |
| `pending_review` | `available` · `rejected` | moderator |
| `available` | `reserved` | **system** (قبول طلب) |
| `available` | `withdrawn` | donor |
| `available` | `expired` | **system** |
| `reserved` | `handed_over` | **system** (تأكيدان) |
| `reserved` | `available` | **system** (إلغاء طلب) |
| `expired` | `draft` | donor (إعادة إدراج) |
| `handed_over` · `withdrawn` · `rejected` | — (نهائية) | — |

**legacy:** `claimed → handed_over` عند القراءة فقط. `isClientWritableItemStatus` يرفض `reserved`/`handed_over`/`expired`.

### 9.3 آلة حالة الطلب (5 حالات · 9 انتقالات)

| من | إلى | الفاعل |
|---|---|---|
| `pending` | `accepted` · `rejected` | donor **أو** moderator |
| `pending` | `cancelled` | requester |
| `accepted` | `handed_over` | **system** |
| `accepted` | `cancelled` | donor / requester / moderator |
| `handed_over` · `rejected` · `cancelled` | — (نهائية) | — |

### 9.4 المستودعات الثلاثة (⇒ 27)
| المستودع | المحتوى |
|----------|---------|
| `soukRequests` | طلبات · موافقتا كشف · تأكيدان · رمز · تقييم |
| `soukReports` | بلاغات العناصر/الرسائل + حسم |
| `soukChat` | رسائل التنسيق · بلاغ · حذف · **`subscribe`** |

### 9.5 لا سعر (ADR-0063)
لا `price`/`amountPaid`/`currency` في أي كيان. `estimatedValue?` للإحصاء فقط، موسوم «غير موثقة»، **مُستبعد من الإسقاط العام ومن تقرير الأثر**، ومحجوب مع عدد المساهمين.

### 9.6 كشف الاتصال التدريجي (ADR-0064)
`not_a_party` / `not_accepted` / `awaiting_consents` / `ready`. الرقم من `Profile.phone` **وقت الطلب فقط**، وللطرف الآخر فقط.

### 9.7 التسليم المزدوج (ADR-0065)
رمز `AZIB-DEMO-HO-*` يُولَّد عند القبول. **يُعرض للمتبرع وحده** بتصغير عند حدود الـhook:
`isDonor ? view : { ...view, handoverCode: null }`
`handed_over` للطلب والعنصر بعد `donorConfirmedAt` **و**`recipientConfirmedAt`.

### 9.8 مكافحة التسليع (ADR-0067)
معجم تحذيري (لا حجب) · شرط عدم إعادة بيع إلزامي · علم تكرار ببصمة وصفية (**إعادة التسمية تُفلت** — #51).

### 9.9 المحاكي
`(dev)/souk` يراجع العناصر ويحسم الطلبات والبلاغات عبر **نفس الخدمات**، بفاعل `admin` موسوم، ومحصور بوضع demo. **لا يُغني عن صندوق المتبرع** (ADR-0071).

---

## 10) AppMode

| الوضع | Adapters | Registry |
|-------|----------|----------|
| `demo` | 12 mock (الدفع = Demo Payment) + **27 mock repos** | `mock` → `connected` |
| `backend` (env كامل) | 12 NotConnected + 27 mock repos مؤقتاً | `configured` → `error` |
| `backend` (env ناقص) | نفسه | `disabled` → `error` |

**قيد:** `WeddingChatApi` بلا `refetch` (#66).

---

## 11) Provider Contracts (12)
Auth (15) · Database · Storage · Notification · Payment (ADR-0005) · Email/Sms · Analytics · Maps/Search · Ai (ADR-0006) · Content.
**لا مزوّد 13** — البث اللحظي في المستودعات (ADR-0041/0070)، والروابط الخارجية في وحدة حدودية (ADR-0054).

---

## 12) Repository Contracts (27)
4 أنماط أصلية ⇒ 16، **+ 4 للمجموعة (P10)**، **+ 4 للشركاء (P11)**، **+ 3 لسوق خير (P12)** ⇒ 27.
**توسيعات إضافةً فقط:** Application (P08) · Donation/Disbursement (P09) · Wedding (P10) · Partner/Offer (P11) · Souk (P12).
**قيود:** AppendOnly دلالة محفوظة · ReadOnly يمنع إنشاء محتوى · Audit بلا فلتر target · كل مستودعات P10–P12 في الذاكرة حتى P18.

---

## 13) Error Handling
`Result<T, AppError>` في كل المستودعات والمزوّدات.
**قاعدة:** لا كائن خطأ مُصنّع؛ `AppError.*` دائماً؛ ولا `ok:true/value:null` عند غياب مورد مطلوب.
أكواد P12: `INVALID_TRANSITION` · `NOT_ITEM_DONOR` · `ITEM_NOT_FOUND` · `ITEM_NOT_AVAILABLE` · `ITEM_RATE_LIMITED` · `ITEM_CONTACT_IN_DESCRIPTION` · `NO_RESALE_CONSENT_REQUIRED` · `TOO_MANY_IMAGES` · `OWN_ITEM` · `ACTIVE_REQUEST_LIMIT` · `DUPLICATE_REQUEST` · `REQUEST_RATE_LIMITED` · `REQUEST_NOT_FOUND` · `REQUEST_NOT_ACCEPTED` · `NOT_A_PARTY` · `HANDOVER_NOT_READY` · `HANDOVER_CODE_MISMATCH` · `HANDOVER_NOT_COMPLETED` · `INVALID_RATING` · `RATING_NOTE_TOO_LONG` · `CHAT_CONTENT_BLOCKED` · `CHAT_RATE_LIMITED` · `MESSAGE_NOT_FOUND` · `REPORT_NOT_FOUND` · `INVALID_REPORT` · `REASON_REQUIRED` · `NO_PERMISSION`.
`soukErrorKey` يخرائطها إلى `marketplace:souk.errors.*` وإلا يعود للخريطة العامة.

---

## 14) i18n و RTL
15 namespace · `ar` افتراضية · اللغة محفوظة.
نصوص P12 في `marketplace:souk.*`.
**دروس ملزمة:** تطابق صيغة المفاتيح · كل Hook قبل أي `return` مبكر · لا ساعة في render · `rerender` في الاختبارات · **`locales/*.json` خارج فاحص العربية ⇒ مراجعة بشرية** · **أخرِج ملف الترجمة كاملاً** لا ككتل.

---

## 15) الوحدات الحدودية لـSDK (ADR-0022)
token-vault · image-pipeline · biometric · export-file · hash · document-pipeline · partners/external-actions.
**P12 لم يضف وحدة ولا حزمة** — أعاد استخدام خط P08 (ADR-0069).

---

## 16) Seed
`mocks/seed/*` خارج `src/`: محتوى مُختلق، `dataOrigin='demo'`، لا PII.
مستقلة لا تمسّ الحزمة: `assistance.ts` (P08) · `wedding-planning.ts` (P10) · `partner-marketplace.ts` (P11) · **`souk-marketplace.ts` (P12)**.
**`populateDemoSeed` لم يُربط بمستودعات P10–P12** (#14).

---

## 17) أدوات المطور والفحوص
`(dev)/index` · `integrations` · `auth` · `assistance` · `finance` · `partners` · **`souk`** · بوابة إنتاج على كل `(dev)/*`.
`check-hardcoded-arabic.mjs` (`app/` + `src/`, `.ts/.tsx`, عدا `src/locales/`) · `check-dead-buttons.mjs`.
**قيود الفاحص:** لا يكشف زراً معطّلاً منطقياً ولا تسريباً دلالياً ولا تسرّباً لغوياً في JSON.
**`expo-doctor` مثبّت** (ADR-0073) ⇒ معيار ثابت لا يتحرك تحت المشروع.

---

## 18) Testing
- **Jest + jest-expo + RNTL v14** — **252 suites · 1503 tests** عند إغلاق P12 (بتقرير المالك).
- اصطلاحات: `__tests__` · `await render/fireEvent/unmount` · **`rerender`** · موكات بمعاملات صريحة · موك `Share` يعيد `activityType` · `fireEvent(el,'valueChange',v)` · لا `act` حول fireEvent · `invalidateQueries({queryKey:[feature]})` · `setQueryData` للجلسة قبل render · الساعة المحقونة توافق ساعة التخزين · fixture نصي مميّز.
- **غير مغطى بـJest:** الحركة الفعلية، Blur، الخطوط، EXIF، بصمة المحتوى، رفع الوسائط، Carousel RTL، Confetti/الحلقات، tel:/wa.me/الخرائط، **عرض صور سوق خير**، التدفق الكامل ⇒ P20/P21.
- **تغطية شكلية معلنة:** `DevSoukScreen` (فراغ/وضع/تبديل) — التغطية الفعلية في اختبارات الخدمات والصندوق (#80).

---

## 19) CI
`npm ci` → **Expo Doctor (مثبّت)** → audit (informational) → `lint` (يشمل العربية) → **Dead Buttons Check** → `typecheck` → `test --ci` → `web:export`.
**لا `continue-on-error` على أي بوابة جودة.**

---

## 20) الحالات الحرجة التي يجب عدم كسرها

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
20. حجب العدد يحجب المبلغ معه — **والبوابة على العدد لا على المقدار**.
21. دلو Real لا يُعرض في الرئيسية قبل P18.
22. لا استعلام واحد كبير للرئيسية.
23. حد الـStagger 8.
24. المحرك لا يُنتج قراراً.
25. ثروة الأقارب والميراث غير المستلم لا تدخل أي حساب.
26. كل عتبة ونطاق من ملف القواعد.
27. النقاط لا تُعرض للمتقدم.
28. لا معرّف خام في المسودة أو السجل.
29. آلة الحالات تُفرَض في الخدمة.
30. محاكيات `(dev)` demo فقط **ولا تُغني عن مسار المستخدم**.
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
42. قواعد الدردشة مفروضة في الخدمة.
43. شارة التوثيق من سجل تحقق ساري فقط؛ والنشر مشروط به.
44. الروابط الخارجية بقائمة سماح، وتأكيد قبل المغادرة.
45. السفير لا يملك قدرة الوصول لمستندات التحقق أو بيانات المستفيدين.
46. مشاهدات تجميعية بلا هويات.
47. الآلة قبل الكتابة؛ ولا خطأ مُصنّع ولا نجاح كاذب.
48. مكوّنات الميزة تُستورد بمسارها النسبي.
49. **لا `price`/`amountPaid`/`currency` في سوق خير؛ والتقدير غير موثق ولا يُعرض كرقم عام ولا يدخل الأثر.**
50. **لا رقم تواصل ولا عنوان دقيق في وصف عنصر عام.**
51. **كشف الاتصال يستلزم القبول + موافقة الطرفين + الطرفية.**
52. **رمز التسليم لطرف واحد، ويُصغَّر عند حدود الـhook لا في الواجهة.**
53. **التقييم خاص بالفريق وليس تصنيفاً أخلاقياً؛ وهوية المبلّغ لا تُعرض للمشتكى عليه.**
54. **`titleKey`+`category` يبقيان المطلوبين الوحيدين في عقد سوق خير؛ والحالة الابتدائية معامل اختياري لا تغيير لافتراض المصنع.**
