# FINANCE_ARCHITECTURE — البنية المالية غير الحافظة للأموال

> أُنشئ في **P09** تنفيذاً لبند الاكتمال في HRD.
> **عام المستودع:** لا أسرار، لا بيانات بطاقات، لا بيانات شخصية حقيقية.
> **قاعدة حاكمة:** Non-Custodial (ADR-0005). لا محفظة، لا Escrow، لا تحويل داخلي، لا أرصدة.

آخر تحديث: 2026-11-16 (إغلاق P09).

---

## 1) الضمانات غير القابلة للتفاوض

| # | الضمان | موضع enforcement |
|---|--------|------------------|
| 1 | لا `charge/capture/refund/createIntent/createPaymentMethod` في عقد الدفع | `providers/contracts/payment.ts` + مُختبَر |
| 2 | لا حقل بطاقة ولا CVV ولا IBAN في أي شاشة أو مخطط | مُختبَر (غياب الحقول) |
| 3 | لا محفظة ولا رصيد ولا تحويل داخلي | لا كيان رصيد في النموذج أصلاً |
| 4 | لا إقراض داخل التطبيق | القرض الحسن = معلومات + إحالة فقط |
| 5 | `verified` لا يكتبه العميل أبداً | حدّ الكتابة في `donation-machine` + الخدمة |
| 6 | لا إيصال قبل `verified` | `receipt-service.toReceiptView` |
| 7 | لا صرف دون طلب معتمد ومراجع بشري مختلف عن المقترح | `guards` + `disbursement-service` |
| 8 | بيانات Demo لا تدخل تقرير الأثر أبداً | `impact-service` (real + verified فقط) |
| 9 | هوية المستفيد لا تظهر للمتبرع | لا حقل ربط في نموذج التبرع أصلاً |
| 10 | كل انتقال مسجَّل في سجل تدقيق Append-only | `finance-audit` |

---

## 2) الفصل الرباعي (جوهر P09)

| المرحلة | المعنى الصادق | من يكتبها | ما تُعرض للمستخدم |
|---------|----------------|-----------|--------------------|
| **Donation Intent** | نية تبرع مسجّلة، **لا مبلغ مستلم** | العميل (المتبرع) | «نية تبرع غير مؤكدة» |
| **Provider Confirmation** | المزوّد سجّل/أكّد النية لديه، **ليس تحويلاً مؤكداً مالياً** | مزوّد (Demo موسوم / خادم P18) | «مؤكدة من المزوّد — بانتظار التحقق المالي» |
| **Verified Payment** | جهة مالية مخوّلة تحقّقت من الدفع فعلياً | **فاعل مالي / Webhook خادمي فقط** | «مؤكدة ومتحقق منها مالياً» + إيصال |
| **Disbursement** | صرف مساعدة لمستفيد بإثبات، ثم تأكيده | Maker → Checker → مالي → المستفيد | سجل الصرف بحالته |

**لا يُشتق أي مرحلة من أخرى تلقائياً.** خصوصاً: `provider_confirmed ≠ verified`، و`paid_recorded ≠ confirmed_by_beneficiary`.

---

## 3) آلة حالة التبرع (6 حالات · 6 انتقالات)

| من | إلى | الفاعل |
|---|---|---|
| `intent_created` | `provider_pending` | provider |
| `intent_created` | `cancelled` | **donor** |
| `provider_pending` | `provider_confirmed` | provider |
| `provider_pending` | `declined` | provider |
| `provider_confirmed` | `verified` | finance_officer |
| `provider_confirmed` | `declined` | finance_officer |
| `verified` · `declined` · `cancelled` | — (نهائية) | — |

- كل زوج غير مُعلَن **مرفوض** ويُختبَر استقصائياً.
- الفاعل يُفحص عند تمريره.
- **قراءة legacy:** `pending → provider_pending` · `confirmed → provider_confirmed` · `declined → declined`. **لا تُشتق `verified` من أي قيمة قديمة.**

### 3.1 حدّ كتابة العميل
`CLIENT_WRITABLE_DONATION_STATUSES = ['intent_created']`، و`assertClientDonationWrite` يرفض أي كتابة بعدها بـ**Forbidden** (لا Conflict ولا تجاهل صامت).Cliente يستطيع فقط: إنشاء نية، أو إلغاءها قبل التسليم.

---

## 4) آلة حالة الصرف (6 حالات · 6 انتقالات)

| من | إلى | الفاعل | حارس |
|---|---|---|---|
| `proposed` | `approved` | checker | **Checker ≠ Maker** |
| `proposed` | `rejected` | checker | سبب مسجَّل |
| `approved` | `paid_recorded` | finance_officer | **مرجع إثبات إلزامي** |
| `paid_recorded` | `confirmed_by_beneficiary` | beneficiary | ملكية الطلب |
| `paid_recorded` | `disputed` | beneficiary | سبب غير فارغ |
| `disputed` | `paid_recorded` | finance_officer | إثبات جديد |
| `confirmed_by_beneficiary` · `rejected` | — (نهائية) | — | — |

**قراءة legacy:** `pending → proposed` · `confirmed → paid_recorded` (**وليس** تأكيد المستفيد).

### 4.1 الحراس النقية (`state-machines/guards.ts`)
| الحارس | الرفض |
|--------|-------|
| `assertDistinctMakerChecker` | `MAKER_REQUIRED` (maker مفقود) · `CHECKER_REQUIRED` · `MAKER_EQUALS_CHECKER` (Forbidden) |
| `assertProofReference` | `PROOF_REQUIRED` · `PROOF_TOO_LONG` (>200) |
| `assertPositiveIntegerAmount` | `INVALID_AMOUNT` (صفر/سالب/كسري) |
| `assertAmountWithinCap` | `AMOUNT_CAP_EXCEEDED` — المجموع التراكمي ≤ `requestedAmount` |
| `assertApplicationDisbursable` | `APPLICATION_NOT_APPROVED` — يُسمح فقط بـ`approved`/`disbursing`/`disbursed` (legacy) |
| `committedTotal` | يستثني `rejected` من استهلاك الحد |

---

## 5) Idempotency

- المفتاح **حتمي ومشتق**: `intent:{donorId}:{programId}:{amount}:{anonymous?1:0}`.
- لا `Date.now()` ولا عشوائية ⇒ نفس المدخلات = نفس المفتاح = **نفس النية** (لا تكرار عند إعادة المحاولة).
- تغيير المبلغ أو الإخفاء ⇒ نية جديدة (سلوك صحيح ومُختبَر).
- المزوّد يُرجع السجل الموجود عند تطابق `donorId + idempotencyKey`؛ وغياب المفتاح يُنشئ سجلاً جديداً (توافق P03).

---

## 6) الإيصال (مشتق، لا كيان)

- `toReceiptView(donation)` يعيد `null` إلا إذا كان `status === 'verified'` **و**`receiptNumber` موجود.
- الرقم يُولَّد **عند التحقق** مرة واحدة: `AZIB-DEMO-RCP-{year}-{tail}` — **موسوم تجريبي**.
- عرض الإيصال يحمل: الرقم · المبلغ · العملة · البرنامج · تاريخ الإصدار · علم الإخفاء · أصل البيانات. **لا هوية متبرع ولا هوية مستفيد.**
- لا كيان إيصال منفصل ⇒ لا ازدواج ولا حالة إيصال مستقلة عن التبرع.

---

## 7) مزوّد Demo Payment

`src/providers/mock/demo-payment.ts` — **العقد كما هو** (ADR-0005)، ودوال الـdemo مسبوقة بـ`__`:

| العضو | السلوك |
|-------|--------|
| `recordPledge` | ينشئ pledge بحالة `pending` و`dataOrigin='demo'`؛ يرفض صفر/سالب/كسري |
| `verifyExternalPayment(ref)` | يُرجع السجل **فقط إن كان `confirmed`** في مخزن الـdemo، وإلا `null`. **لا يخترع تأكيداً** |
| `__confirmPledge(id)` | يمثّل	callback الجهة المرخّصة (demo فقط) |
| `__declinePledge(id)` | رفض المزوّد (demo فقط) |
| `__pledges()` | قراءة داخلية للاختبارات |

- تسوية مكرّرة ⇒ `PLEDGE_ALREADY_SETTLED`.
- `isDemoPaymentProvider` type-guard يمنع محاكاة الـdemo مع مزوّد غير demo ⇒ `NotConnected`.
- الحاوية تستخدمه في وضع demo فقط؛ وضع الخادم يبقى `NotConnectedPaymentProvider`.

---

## 8) متطلبات الربط بجهة مرخّصة (تُعرض في شاشة صادقة)

| # | المتطلب |
|---|---------|
| 1 | جهة دفع **مرخّصة قانونياً** في السوق المستهدف، مع اتفاقية موقّعة |
| 2 | اتفاقية استخدام تحدّد المسؤوليات والرسوم إن وجدت وسياسة الاسترجاع |
| 3 | مفاتيح المزوّد **على الخادم فقط** — لا في التطبيق ولا في المستودع |
| 4 | **Webhook خادمي بتوقيع مُتحقَّق منه** لاستقبال تأكيد الدفع |
| 5 | التحقق المالي وكتابة `verified` **على الخادم فقط**، مع سجل تدقيق |

حتى استيفائها: لا تبرع حقيقي، لا إيصال رسمي، وشاشة `Not Connected` تسرد المتطلباتinstead من ادعاء نجاح.

---

## 9) كتالوج أنواع البرامج

| النوع | يقبل نوايا تبرع | ملاحظة |
|-------|------------------|--------|
| `grant` | ✅ | منح غير مستردة بعد تحقق بشري |
| `partial` | ✅ | مساعدات جزئية |
| `qard_hasan` | ❌ | **معلومات + إحالة لجهة مرخّصة فقط** — لا إقراض ولا تحصيل داخل التطبيق |
| `in_kind` | ❌ | عيني عبر سوق الخير (P12) |
| `donor_contribution` | ✅ | مساهمات فاعلي الخير |

- `Program.kind` **اختياري**؛ غيابه ⇒ `grant` (افتراض معلن).
- شاشة التفاصيل تمنع زر التبرع لغير القابل أو غير المفتوح، وتعرض السبب.

---

## 10) تقرير الأثر

`computeImpactReport` يفلتر **`dataOrigin === 'real'`** ثم:
- التبرعات: `status === 'verified'`
- الصرف: `status === 'confirmed_by_beneficiary'`

| المقياس | التعريف |
|---------|---------|
| `verifiedDonations` | عدد ومجموع التبرعات الحقيقية المتحقق منها مالياً فقط |
| `confirmedDisbursements` | عدد ومجموع الصرف الحقيقي الذي أكّده المستفيد فقط |
| `assistedCases` | عدد الطلبات الحقيقية التي وصلها صرف مؤكَّد من المستفيد |

- **حجب الأعداد والمبالغ:** إعادة استخدام `SMALL_NUMBER_THRESHOLD = 10` و`buildStatCell` من P07 ⇒ المبلغ يُحجب مع العدد.
- **في Demo كل شيء فارغ** لأن كل البيانات demo — سلوك مقصود ومُختبَر، مع نص صريح.
- كل مقياس يحمل `definitionKey` معروضاً للمستخدم.

---

## 11) الشاشات والمسارات

```
app/programs/
├─ index                     → كتالوج الأنواع + البرامج المفتوحة
├─ [id]                      → تفاصيل البرنامج + زر التبرع المشروط
├─ kind/[kind]               → معلومات النوع (إحالة/سوق/كتالوج)
├─ donate/[id]               → نية تبرع (RequireAuth)
├─ donations                 → تبرعاتي (RequireAuth)
├─ receipts                  → الإيصالات (RequireAuth)
├─ disbursements             → سجل صرف المستفيد (RequireAuth)
├─ impact                    → تقرير الأثر (عام)
└─ provider-requirements     → متطلبات الجهة المرخّصة (عام)
app/(dev)/finance            → محاكي Maker/Checker (demo فقط)
```

**اليقين بأيقونة + نص + لون** في `CertaintyBadge` و`DisbursementStatusBadge` — لا لون وحده.

---

## 12) سجل التدقيق

`appendFinanceAudit` يكتب: `actorId` · `action` · `target` (`donation:{id}` / `disbursement:{id}`) · `meta` limited إلى `from`/`to`.
**بلا مبالغ، بلا هويات متبرعين أو مستفيدين، بلا payload.** مُختبَر أن الميتاداتا لا تحوي المبلغ.

---

## 13) القيم المؤقتة

| البند | القيمة | الوسم |
|-------|--------|-------|
| حد إخفاء الأثر | 10 (من P07) | `PENDING_POLICY` — `PRODUCT_POLICIES #8` |
| سياسة المزوّد المرخّص | غير معتمدة | بند جديد #11 |
| مدة الاحتفاظ بالسجلات المالية | 24 شهراً مؤقتة | `PRODUCT_POLICIES #7` |

**لا قيم مالية مؤقتة جديدة في P09** — المبالغ مدخلات مستخدم، والحدود من الطلب المعتمد.

---

## 14) ما يُبنى لاحقاً

| المرحلة | البند |
|---------|-------|
| P17 | لوحة Maker/Checker حقيقية بصلاحيات وفصل مراجعين |
| P18 | مزوّد مرخّص + Webhook بتوقيع + كتابة `verified` خادمياً + انتقال ذرّي + رقم إيصال رسمي |
| P15/P18 | توحيد إحصاءات الرئيسية مع `verified` بدل `confirmed` القديمة |
| P19 | مراجعة أمنية للنوايا والإيصالات وسجل التدقيق |
| P20/P21 | تحقق على الأجهزة + E2E للتدفق المالي الكامل |

---

## 15) التغطية الاختبارية عند إغلاق P09

- آلتا الحالة: كل انتقالة صالحة مقبولة، وكل زوج غير مُعلَن مرفوض استقصائياً، والحالات النهائية لا تخرج، وفحص الفاعل.
- حدّ العميل: `Forbidden` بعد `intent_created`، ولا كتابة `verified` من مساره.
- Maker ≠ Checker: مرفوض عند التطابق وعند غياب Maker.
- الحد التراكمي + استثناء `rejected` + إثبات إلزامي + حالة الطلب.
- Idempotency: نفس المفتاح ⇒ نفس النية؛ مفتاح/متبرع مختلف ⇒ سجل جديد؛ بلا مفتاح ⇒ سلوك P03.
- الإيصال: لا شيء قبل `verified`، ورقم حتمي موسوم، ولا هويات في العرض.
- الأثر: استبعاد demo تماماً، واستبعاد غير المؤكد، وحجب المبلغ مع العدد، وتعريف كل مقياس.
- المزوّد: لا دالة محرّمة، ولا تأكيد مُختَرع، ولا تسوية مكرّرة.
- الشاشات: Loading/Empty/Error/NotConnected/Data + محاكي Maker/Checker من الواجهة.
