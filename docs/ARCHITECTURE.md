# ARCHITECTURE — عازب | AZIB

> يوثّق البنية التقنية بعد **P10 (Group Weddings)**.
> **عام المستودع:** لا أسرار ولا بيانات شخصية.

---

## 1) نظرة عامة

```
┌──────────────────────────────────────────────────────────┐
│  app/ (Routes only)                                      │
│  Gate · (onboarding) (auth) (tabs) (features) (staff)    │
│  (dev) · profile · settings · legal · assistance ·        │
│  programs · weddings                                      │
└───────────────────────┬──────────────────────────────────┘
┌───────────────────────▼──────────────────────────────────┐
│  src/features/{shell,onboarding,auth,profile,settings,   │
│    legal,home,assistance,finance,weddings,dev}           │
│  + components/{ui,brand,shell}                           │
└───────────────────────┬──────────────────────────────────┘
                        │ hooks
┌───────────────────────▼──────────────────────────────────┐
│  TanStack Query (حالة الخادم) + Zustand (7 stores)        │
└───────────────────────┬──────────────────────────────────┘
┌───────────────────────▼──────────────────────────────────┐
│  ProviderContainer: 12 Providers + 20 Repos + Registry   │
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
├─ (onboarding)/ · (auth)/ 6 · (tabs)/ 5 · (features)/ 8 · (staff)/
├─ (dev)/ index · integrations · auth · assistance · finance · gallery
├─ profile/ index · edit
├─ settings/ 13 شاشة
├─ legal/ [doc]
├─ assistance/ index · conditions · pre-check · new · mine · [id]/4
├─ programs/ index · [id] · kind/[kind] · donate/[id] · donations ·
│            receipts · disbursements · impact · provider-requirements
└─ weddings/                     # P10 — بلا index.tsx (ADR-0042)
   ├─ new
   └─ [id]/ index · members · polls · budget · agreement · chat ·
            countdown · completion · services
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
| **`weddings/new` · `weddings/[id]/*`** | **`RequireAuth`** (بما فيها countdown — ADR-0050) |
| **`weddings` (التبويب) · `programs` العام** | **عام بإسقاط عام** |

> الحارس واجهة فقط؛ الحماية الفعلية RLS في P18 (قاعدة 19).

---

## 3) طبقة المصادقة (P06)
`auth-machine` · `token-vault` · `use-auth` · `use-otp` · `consents` · `RequireAuth` · 6 شاشات. عقد Auth = **15 capability**.
**المتاجر (7):** app-mode · onboarding · language · auth · settings · shell · assistance-draft.

---

## 4) طبقة الرئيسية (P07)
`HomeConfigSource` قابل للتبديل · استعلام لكل قسم · `SectionShell`/`Boundary`/`Lazy`/`Stagger(≤8)` · 8 أقسام · بوابة موافقة fail-closed · تعقيم · إخفاء الأعداد والمبالغ · فصل Demo/Real.

---

## 5) طبقة المساعدات (P08)
المحرك النقي (rules→gates→components→bands→flags) · آلة 11 حالة في الخدمة · document-pipeline · مسودة ببصمات · Wizard 8 خطوات · متابعة/استكمال/قرار/اعتراض · محاكي `(dev)/assistance`.

---

## 6) طبقة التمويل (P09)
الفصل الرباعي · آلتا التبرع/الصرف · Maker≠Checker · حد تراكمي · إيصال مشتق · Idempotency حتمية · تقرير أثر real+verified · محاكي `(dev)/finance`.

---

## 7) طبقة الأعراس الجماعية (P10)

### 7.1 البنية
```
engine/    cost-sharing · largest-remainder · withdrawal-impact · discovery
state/     group-machine (6 حالات/10 انتقالات) · roles · poll-rules · approvals
chat/      message-filter · rate-limit · retention · moderation
config/    limits (system_settings.maxGroupSize)
services/  group · poll · budget · chat · service-request · wedding-notifications
hooks/     limits · discovery · group · membership · polls · create-group ·
           budget · chat · services · countdown
components/WeddingScaffold · PollCard · CostSplitBars · GoldConfetti · RingCountdown
screens/   11 شاشة
```

### 7.2 المستودعات الأربعة (⇒ 20)
| المستودع | المحتوى |
|----------|---------|
| `weddingGroups` | أعضاء · طلبات انضمام · دعوات |
| `weddingPolls` | استطلاعات · أصوات (صوت واحد لكل مستخدم) |
| `weddingBudgets` | نسخ · بنود · موافقات · اتفاقات · طلبات خدمة |
| `weddingChat` | رسائل · كتم · **`subscribe`** · `purgeOlderThan` |

### 7.3 المحرك والآلة
- **تقسيم التكاليف:** Equal/Weighted/Custom + Individual/Shared · Largest Remainder صحيح · **المجموع = الإجمالي**. التفصيل في `docs/COST_SHARING.md`.
- **آلة المجموعة:** `draft → open → planning → agreed → completed`، مع `cancelled` من كل حالة غير نهائية، و**`agreed → planning`** عند تعديل الميزانية.
- **الاعتماد:** `adoptBudget` يسلك open→planning→agreed، ويشتق الإذن من **إجماع الأعضاء**.

### 7.4 البث اللحظي (ADR-0041)
`weddingChat.subscribe(groupId, listener)` ⇒ الـhook يكتب في **Query cache** بـ`setQueryData` داخل `useEffect` (مخزن خارجي، ليس `setState`). إلغاء الاشتراك عند التفكيك.

### 7.5 الدردشة المفروضة
`chat-service`: **عضوية/كتم → فلتر → معدل → تخزين**. `mutedUntil: mute ? mute.until : undefined`. تنظيف تلقائي عند القراءة (`purgeOlderThan` + `filterRetained`).

### 7.6 الإسقاط العام (ADR-0050)
غير العضو يرى: الاسم · المنطقة · العدد · **الشهر**. العضو فقط يرى: التاريخ الدقيق · الحلقات · الأسماء · الميزانية · الدردشة · زر الإتمام.

### 7.7 الاحتفال
`GoldConfetti` (Reanimated+SVG) **للإنجاز فقط**؛ `RingCountdown` (حلقتان + Hero3D). Reduce Motion / Tier low ⇒ ثابت.

---

## 8) AppMode

| الوضع | Adapters | Registry |
|-------|----------|----------|
| `demo` | 12 mock (الدفع = Demo Payment) + **20 mock repos** | `mock` → `connected` |
| `backend` (env كامل) | 12 NotConnected + 20 mock repos مؤقتاً | `configured` → `error` |
| `backend` (env ناقص) | نفسه | `disabled` → `error` |

**قيد:** `WeddingChatApi` بلا `refetch` ⇒ شاشة الدردشة تعرض NotConnected بلا إعادة محاولة (§8 في PROJECT_CONTEXT).

---

## 9) Provider Contracts (12)
Auth (15) · Database · Storage · Notification · Payment (ADR-0005) · Email/Sms · Analytics · Maps/Search · Ai (ADR-0006) · Content.
**لا مزوّد 13** — البث اللحظي في المستودع (ADR-0041).

---

## 10) Repository Contracts (20)
4 أنماط أصلية: Crud (9) · ReadOnly (1) · AppendOnly (2) · Custom (4) ⇒ 16، **+ 4 للمجموعة** ⇒ 20.
**توسيعات إضافةً فقط:** Application (P08) · Donation/Disbursement (P09) · Wedding (P10).
**قيود:** AppendOnly دلالة محفوظة · ReadOnly يمنع إنشاء محتوى · Audit بلا فلتر target · Group/Poll/Budget/Chat في الذاكرة حتى P18.

---

## 11) Error Handling
`Result<T, AppError>` في كل المستودعات والمزوّدات. أكواد P10: `INVALID_TRANSITION` · `NOT_MEMBER` · `NO_PERMISSION` · `ALREADY_MEMBER` · `GROUP_FULL` · `GROUP_NOT_JOINABLE` · `GROUP_TOO_LARGE` · `REASON_REQUIRED` · `SINGLE_ORGANIZER` · `ORGANIZER_MUST_CANCEL` · `APPROVALS_INCOMPLETE` · `NO_VERSION` · `VERSION_NOT_FOUND` · `CUSTOM_SUM_MISMATCH` · `INVALID_WEIGHT` · `CHAT_BLOCKED` · `CHAT_CONTENT_BLOCKED` · `CHAT_RATE_LIMITED` · `POLL_CLOSED` · `UNKNOWN_OPTION`.

---

## 12) i18n و RTL
15 namespace · `ar` افتراضية · اللغة محفوظة.
نصوص P10 في `weddings:*`.
**دروس ملزمة:** تطابق صيغة المفاتيح · كل Hook قبل أي `return` مبكر · لا `Date.now()` أثناء render · `rerender` في الاختبارات · **`locales/*.json` خارج فاحص العربية ⇒ مراجعة بشرية**.

---

## 13) الوحدات الحدودية لـSDK (ADR-0022)
token-vault · image-pipeline · biometric · export-file · hash · document-pipeline.
**P10 لم يضف حزمة أصلية** — Confetti/الحلقات بالموجود.

---

## 14) Seed
`mocks/seed/*` خارج `src/`: محتوى مُختلق، `dataOrigin='demo'`، لا PII.
مستقلان لا يمسّان الحزمة: `assistance.ts` (P08) · `wedding-planning.ts` (P10).
`weddings.ts` مُمدّد بحقول المجموعة. **`populateDemoSeed` ما زال يُبلّغ notifications كغير مدعوم** رغم وجود `create`.

---

## 15) أدوات المطور والفحوص
`(dev)/index` · `integrations` · `auth` · `assistance` · `finance` · بوابة إنتاج على كل `(dev)/*`.
`check-hardcoded-arabic.mjs` (`app/` + `src/`, `.ts/.tsx`, عدا `src/locales/`) · `check-dead-buttons.mjs`.

---

## 16) Testing
- **Jest + jest-expo + RNTL v14** — **207 suites · 1270 tests** عند إغلاق P10 (بتقرير المالك).
- اصطلاحات: `__tests__` · `await render/fireEvent/unmount` · **`rerender`** · لا `act` حول fireEvent · `invalidateQueries({queryKey:[feature]})` · `setQueryData` للجلسة قبل render · `jest.mock` بعد الـimports · **الساعة المحقونة توافق ساعة التخزين**.
- **غير مغطى بـJest:** الحركة الفعلية، Blur، الخطوط، EXIF، البصمة، رفع المستندات، Carousel RTL، **Confetti/الحلقات بصرياً**، التدفق الكامل ⇒ P20/P21.

---

## 17) CI
`npm ci` → Expo Doctor → audit (informational) → `lint` (يشمل العربية) → **Dead Buttons Check** → `typecheck` → `test --ci` → `web:export`.

---

## 18) الحالات الحرجة التي يجب عدم كسرها

1. `PaymentProvider` بلا charge/capture/refund/createIntent/createPaymentMethod.
2. `AiProvider` بلا decide/approve/reject/block.
3. `dataOrigin='demo'` على كل كائنات Seed.
4. لا `service_role` ولا أسرار في العميل.
5. `backend` لا ينكسر عند غياب env.
6. `@/` aliases عبر resolver-typescript.
7. لا زر بلا وظيفة.
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
31. العميل لا يكتب `verified`.
32. لا إيصال قبل `verified`.
33. Maker ≠ Checker + إثبات + حد تراكمي + تأكيد المستفيد.
34. بيانات Demo لا تدخل تقرير الأثر.
35. لا تأكيد دفع مُختَرع.
36. دلالة AppendOnly محفوظة.
37. **مجموع حصص التكاليف = الإجمالي دائماً، وبأعداد صحيحة.**
38. **لا اعتماد ميزانية بلا إجماع؛ أي تعديل يصفّر الموافقات.**
39. **الخدمة تسلك مسار الآلة المعلن ولا تقفز حالتين.**
40. **كل مسار بلا `RequireAuth` يُسقط إسقاطاً عاماً — والحلقات مع التاريخ.**
41. **اسم العرض داخل المجموعة بموافقة صاحبه فقط.**
42. **قواعد الدردشة مفروضة في الخدمة، والاحتفاظ محدود.**
