# ELIGIBILITY_ENGINE — محرك الأهلية وآلة حالات الطلب

> أُنشئ في **P08** تنفيذاً لبند الاكتمال في HRD.
> **عام المستودع:** لا أسرار، لا بيانات شخصية حقيقية.
> **قاعدة حاكمة:** التقييم **Advisory فقط** (ADR-0006). لا يُكتب قرار نهائي من المحرك أبداً.

آخر تحديث: 2026-11-16 (إغلاق P08).

---

## 1) الضمانات غير القابلة للتفاوض

| # | الضمان | موضع enforcement |
|---|--------|------------------|
| 1 | المحرك دالة نقية بلا React وبلا IO | `engine/score-application.ts` |
| 2 | النتيجة تحمل `advisory: true` و`ruleVersion` دائماً | نوع `AdvisoryEvaluation` |
| 3 | لا حقل قرار في مخرجات المحرك | مُختبَر (`Object.keys` لا تحوي decision/approved) |
| 4 | القرار النهائي لمراجع بشري عبر `workflow-service` | P08.3 + P17 |
| 5 | النقاط التفصيلية **لا تُعرض للمتقدم** | `rules.scoreVisibility = 'hidden'` + شاشة القرار |
| 6 | ثروة الأقارب والميراث غير المستلم والأصول غير المتاحة **لا تدخل الحساب** | مُختبَر صراحةً |
| 7 | كل عتبة ونطاق من ملف القواعد حصراً | لا أرقام نطاقات في المحرك أو الواجهة أو الاختبارات |

---

## 2) مصدر القواعد القابل للتبديل

- `engine/rules.types.ts` يعرّف `EligibilityRules` و`RulesSource`.
- `engine/rules.v1.ts` هو النسخة السارية: `version = 'eligibility-v1'`، `policyStatus = 'pending-human-approval'`.
- `engine/rules-source.ts` يوفّر `createStaticRulesSource` + `get/set/resetRulesSource` (نمط ADR-0023 المثبت في HomeConfig).
- الواجهة تقرأ عبر `useEligibilityRules()`؛ لا مكوّن يستورد `RULES_V1` مباشرة إلا أداة المطور.
- **P18:** يُستبدل المصدر بجدول قواعد مُصدَّر بنسخ على الخادم دون تغيير المستهلكين.

---

## 3) الأوزان (محدَّدة من HRD — ليست مؤقتة)

| المكوّن | المفتاح | الوزن |
|---------|---------|-------|
| شدة الحاجة | `needSeverity` | 30 |
| انخفاض الدخل مقابل الاحتياجات | `incomeToNeeds` | 20 |
| الالتزامات المعيشية | `obligations` | 15 |
| عدم امتلاك أصول متاحة | `availableAssets` | 15 |
| جدية الإجراءات | `seriousness` | 10 |
| استقرار العمل | `jobStability` | 10 |
| **المجموع** | | **100** |

`TOTAL_WEIGHT` مُصدَّر ومُختبَر بأنه يساوي 100 دائماً.

### 3.1 التطبيع (كل مكوّن يُنتج قيمة 0..1)

| المكوّن | الصيغة |
|---------|--------|
| `needSeverity` | نصف ضغط المعالين `(dependents+1)/householdSizeMax` + نصف ضغط الدخل `1 − (incomePerPerson/incomePerPersonHigh)` |
| `incomeToNeeds` | `1 − coverage/needsCoverageRatioHigh` حيث `coverage = income / max(1, obligationsTotal)` |
| `obligations` | `obligationsTotal / max(1, income) / obligationsRatioHigh` |
| `availableAssets` | `1 − availableAssets / gates.availableAssetsThreshold` |
| `seriousness` | خطبة رسمية = 1.0 · موافقة أسرية = 0.6 · +0.2 عند وجود مستند إثبات ارتباط (بحد 1) |
| `jobStability` | `stabilityMonths / stabilityMonthsMax` · صفر إذا كان بلا عمل |

- `incomePerPerson = monthlyIncome / max(1, householdSize)`.
- `obligationsTotal = monthlyRent + monthlyDebtPayments + monthlyEssentials`.
- كل قيمة تُقصَر إلى `[0,1]`؛ غير المنتهي ⇒ 0.
- `points = round(weight × normalized)`، والمجموع يُقصَر إلى `[0,100]` ثم يُقرَّب.

---

## 4) البوابات (Pass/Fail قبل أي تقييم)

| البوابة | المفتاح | الشرط |
|---------|---------|-------|
| مصدر دخل حقيقي | `real_income_source` | `incomeSource ≠ none` **و** `monthlyIncome > 0` |
| عدم اليُسر | `not_wealthy` | `availableAssets < availableAssetsThreshold` (عند الحد ⇒ فشل) |
| لا مساعدة سابقة | `no_prior_assistance` | `priorAssistanceCount = 0` إلا إذا فتحت القاعدة الاستثناء |
| إقرار الصحة | `truth_declaration` | `declarations.truthful = true` |

**عند فشل أي بوابة:** `gatePassed=false` · `breakdown=[]` · `totalScore=0` · `bandId='gates_failed'` · التوصية «تُحال لمراجع بشري». تُبلَّغ **كل** البوابات الفاشلة لا الأولى فقط.

**مستبعد صراحةً من كل بوابة ومن كل مكوّن:** ثروة الوالدين/الأقارب · الميراث غير المستلم · الأصول غير المتاحة للتصرف · أي تفاصيل عن الطرف الآخر.

---

## 5) النطاقات (Bands) — قيم مؤقتة موسومة

| النطاق | المعرّف | المدى | التوصية |
|--------|---------|-------|---------|
| غير مستحق | `not_eligible` | 0–30 | لا أهلية كافية؛ المراجعة البشرية هي الفيصل |
| مراجعة إضافية | `additional_review` | 31–55 | يلزم تحقق إضافي قبل أي قرار |
| مستحق جزئي | `partial` | 56–75 | قد تناسب مساعدة جزئية بعد المراجعة |
| مستحق كامل | `full` | 76–100 | قد تناسب مساعدة كاملة بعد المراجعة |
| لم تُستوفَ البوابة | `gates_failed` | — | إحالة لمراجع بشري |

- النقاط تُقرَّب لعدد صحيح **قبل** تحديد النطاق ⇒ لا فراغ بين 30 و31.
- الاختبارات تغطي الحدود 30/31 · 55/56 · 75/76، وتثبت أن النطاقات تُقرأ من القواعد (تغيير القواعد يغيّر النتيجة).

---

## 6) أعلام الاحتيال والتكرار (لا تغيّر النقاط)

| العلم | المفتاح | المصدر |
|-------|---------|--------|
| بصمة هوية مكررة | `identityDuplicate` | `DedupService` — مقدّم آخر بنفس البصمة |
| بصمة هاتف مكررة | `phoneDuplicate` | `DedupService` |
| مستند مُعاد الاستخدام | `documentReused` | `DedupService` — تطابق `sha256` |
| تقديم متكرر | `rapidResubmission` | عدد إرسال نفس المتقدم داخل النافذة ≥ الحد |
| تناقض دخل/التزامات | `incomeObligationMismatch` | `obligationsTotal > income × ratio` (و`income > 0`) |

الأعلام **إشارات للمراجع** فقط، ومُختبَر أنها لا تغيّر `totalScore`.

---

## 7) شكل النتيجة

`AdvisoryEvaluation` يحمل: `ruleVersion` · `advisory:true` · `gatePassed` · `gates[]` (مفتاح/نجاح/سبب i18n) · `breakdown[]` (مفتاح/وزن/تطبيع/نقاط/شرح i18n) · `totalScore` · `bandId` · `bandLabelKey` · `recommendationKey` · `flags[]` · `evaluatedAt`.

يُرفَق بالطلب عبر `applications.update(id, { evaluation })` ويُقرأ في P17 للمراجع. **لا يُعرض للمتقدم** (سياسة `scoreVisibility`).

---

## 8) آلة الحالات (11 حالة · 18 انتقالاً)

| من | إلى | الفاعل |
|---|---|---|
| `draft` | `submitted` · `cancelled` | applicant |
| `submitted` | `in_review` · `info_requested` | reviewer |
| `submitted` | `cancelled` | applicant |
| `in_review` | `approved` · `rejected` · `info_requested` | reviewer |
| `info_requested` | `submitted` · `cancelled` | applicant |
| `approved` | `disbursing` | finance |
| `rejected` | `appealed` · `cancelled` | applicant |
| `appealed` | `appeal_resolved` | reviewer |
| `appeal_resolved` | `approved` · `rejected` · `cancelled` | reviewer |
| `disbursing` | `completed` | finance |
| `completed` · `cancelled` | — (نهائية) | — |

- كل زوج غير مُعلَن **مرفوض** ويُختبَر ذلك استقصائياً لكل الحالات.
- الفاعل يُفحص عند تمريره؛ الحالات النهائية لا تخرج.
- **قيم legacy:** `reviewing → in_review` و`disbursed → disbursing` عند القراءة فقط. تبقى صالحة في العقد чтобы لا تنكسر اختبارات P03.

### 8.1 موضع الفرض
- `ApplicationRepository.updateStatus` يبقى **متساهلاً** (يستخدمه اختبار العقد وP17).
- `workflow-service.applyTransition` هو **الحارس**: يقرأ الحالة، يتحقق عبر الآلة، يطبّق التحديث، ثم يكتب سجل تدقيق.
- `applications.submit(id)` ذرّي في المزوّد: يتحقق من `draft|info_requested`، يضبط الحالة، يولّد الرقم المرجعي **مرة واحدة**، يختم `submittedAt`، يمسح `infoRequest`، ويلتقط موافقة النشر.

### 8.2 قيد معروف
بقية الانتقالات تستخدم `update` + `updateStatus` (نداءان). فشل جزئي قد يترك الحالة والبيانات غير متزامنتين. **P18 يجعل الانتقال ذرّياً على الخادم.**

---

## 9) الاعتراض

- مرة واحدة فقط: `appeal !== null` ⇒ `APPEAL_ALREADY_USED`.
- داخل نافذة `appealWindowDays` من `decision.decidedAt` ⇒ خارجها `APPEAL_WINDOW_CLOSED`.
- نموذج Zod: شرح 20–2000 حرف + مستندات إضافية اختيارية.
- يُحال لمراجع مختلف في P17 (`appeal_resolved` ← reviewer).

---

## 10) كتالوج أسباب القرار

- `config/reason-catalog.ts`: أسباب قبول (3) وأسباب رفض (4) وحقول استكمال (6).
- المخزَّن على القرار هو **مفتاح i18n** ⇒ المتقدم يرى صياغة محترمة مترجمة، لا نصاً خاماً ولا نقاطاً.
- `isKnownReason()` يتحقق من انتماء المفتاح للكتالوج.

---

## 11) المستندات والخصوصية

| البند | القيمة | المصدر |
|-------|--------|--------|
| حد الصورة | 5 MB | `rules.documentLimits.imageMaxBytes` |
| حد PDF | 10 MB | `rules.documentLimits.pdfMaxBytes` |
| الأنواع المسموحة | `image/jpeg` · `image/png` · `application/pdf` | `rules.documentLimits.allowedMimeTypes` |
| معالجة الصور | تصغير عرض 1600 + إعادة ترميز JPEG (يزيل EXIF) | `manipulateAsync` |
| معالجة PDF | **لا معالجة** — فحص نوع/حجم فقط | لا ادعاء بإزالة بيانات وصفية |
| فشل المعالجة | **لا رفع إطلاقاً** | حماية خصوصية افتراضية |
| المعاينة | صورة مصغّرة للصور · بطاقة ملف لـPDF | محلية فقط |
| شريط التقدم | غير محدد | لا نسبة وهمية (المزوّد بلا callback) |

**البصمة:** `sha256(mimeType|size|name)` عبر `expo-crypto`. بصمة **وصفية تجريبية**؛ إعادة تسمية الملف تُفلت من الكشف. البصمة على المحتوى + HMAC داخل Edge Function في **P18**.

**المعرّفات:** لا يُخزَّن رقم الهوية ولا الهاتف خاماً في أي مكان — فقط `identityHash` و`phoneHash`. الحقول الخام عابرة داخل المكوّن وتُمسح البصمة عند «تعديل».

---

## 12) الخط الزمني

- يُبنى من `AuditRepository.list({limit:200})` + ترشيح client-side بـ`meta.applicationId`.
- أول عقدة تُشتق من `application.createdAt` بحالة `draft`.
- **قيد:** عقد التدقيق بلا فلتر `target` ⇒ الترشيح على العميل. يُعالَج في P18.
- سجل التدقيق Append-only، وميتاداتاه محدودة: `applicationId` · `from` · `to` · `ruleVersion`. **بلا payload وبلا مستندات وبلا معرّفات خام.**

---

## 13) Valores المؤقتة بانتظار قرار بشري

| البند | القيمة المستخدمة | الوسم | القرار في `PRODUCT_POLICIES` |
|-------|------------------|-------|------------------------------|
| عتبة الأصول المتاحة | 500,000 YER | `PENDING_POLICY` | #1 |
| نطاقات النقاط | 0–30 / 31–55 / 56–75 / 76–100 | مؤقتة | #2 (سلّم التقييم) |
| حد الصورة / PDF | 5 MB / 10 MB | مؤقت | بند تشغيلي جديد |
| نافذة الاعتراض | 14 يوماً | `PENDING_POLICY` | #3 |
| عرض النقاط للمتقدم | مخفية | `PENDING_POLICY` | #10 (مقترح) |
| استثناء المساعدة السابقة | مغلق | `PENDING_POLICY` | #5 |
| عتبات التطبيع | دخل/فرد 150k · تغطية 2× · التزامات 1.5× · أسرة 12 · استقرار 36 شهراً · نافذة تكرار 30 يوماً · حد تكرار 2 · نسبة تناقض 3× | مؤقتة | #1 / #2 |

**الأوزان ليست مؤقتة** — حدّدها HRD P08.

كل قيمة مؤقتة تحمل وسمها في الكود، وتُعرض للمستخدم ملاحظة «القيم مؤقتة وبانتظار اعتماد الجهة المالكة» في شاشة الشروط.

---

## 14) ما يُبنى لاحقاً

| المرحلة | البند |
|---------|-------|
| P17 | لوحة المراجع الحقيقية: قراءة `evaluation` كاملة، أسباب من الكتالوج، فصل مراجع الاعتراض، صلاحيات RLS |
| P18 | قواعد على الخادم بنسخ · انتقال ذرّي · بصمة محتوى + HMAC · رقم مرجعي رسمي · فلتر تدقيق بـtarget · تنفيذ الصرف |
| P19 | مراجعة أمنية للمستندات والمسودة والبصمات |
| P20/P21 | تحقق على الأجهزة + E2E للتدفق الكامل |

---

## 15) التغطية الاختبارية عند إغلاق P08

- جداول حدّية لكل مكوّن (0 / أقصى / خارج النطاق) + مجموع الأوزان.
- حدود النطاقات الستة + التقريب + قراءة النطاقات من القواعد.
- كل بوابة منفردة + تعدد الفشل + الاستثناء مغلق/مفتوح.
- العدالة: ثروة أقارب ضخمة لا تُسقط ولا تُحتسب · ميراث غير مستلم مستبعد.
- الأعلام الخمسة + عدم تأثيرها على النقاط.
- الآلة: كل انتقال صالح مقبول، وكل زوج غير مُعلَن مرفوض، والحالات النهائية لا تخرج، وفحص الفاعل.
- الاعتراض: مرة واحدة + داخل/خارج النافذة + تحقق Zod.
- المستندات: نوع/حجم من القواعد · فشل المعالجة ⇒ لا رفع · بصمة حتمية · PDF بلا معالجة.
- الخصوصية: لا نقاط في واجهة المتقدم · ملكية الطلب · لا نشر بلا موافقة سارية.
