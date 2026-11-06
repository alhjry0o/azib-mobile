# تقدّم التطوير: عازب | AZIB

جدول المراحل الـ24 وحالتها الفعلية. يُحدَّث في نهاية كل مرحلة، ولا تُغيَّر الحالة إلى Done إلا بعد استيفاء معايير القبول وتسجيل نتائج الاختبار الفعلية.

## دليل الحالات

الحالات المسموحة ثلاث فقط: `Not Started` لم تبدأ، و`In Progress` قيد التنفيذ، و`Done` اكتملت بمعايير قبولها ونتائج تحقق مسجّلة.

## جدول المراحل

| المرحلة | الاسم | الحالة | التاريخ | ملاحظات |
|---|---|---|---|---|
| P01 | Governance | Done | (يُدخل عند الدمج) | وثائق فقط. لم يشغّل الوكيل أي تحقق؛ التحقق بيد المالك عبر `node scripts/verify-docs.mjs`. lint/typecheck/test غير قابلة للتطبيق (لا package.json). |
| P02 | Init | Not Started | — | |
| P03 | Core Platform | Not Started | — | يحسم ADR المصادقة قبل P18 (انظر PROJECT_CONTEXT). |
| P04 | Design System | Not Started | — | يحتاج تعريف طبقات 3D (ADR-0003). |
| P05 | Shell + Onboarding | Not Started | — | |
| P06 | Auth / Profile / Settings / Legal | Not Started | — | |
| P07 | Home | Not Started | — | |
| P08 | Assistance + Eligibility | Not Started | — | يتوقف على POL-01 وPOL-02 وPOL-03 وPOL-05. |
| P09 | Financial Architecture | Not Started | — | Non-Custodial (ADR-0005). |
| P10 | Group Weddings | Not Started | — | يتوقف على POL-04. |
| P11 | Partners + Ambassadors | Not Started | — | يتوقف على POL-06. |
| P12 | Souk | Not Started | — | |
| P13 | Jobs + Volunteers | Not Started | — | |
| P14 | Calculator + Guide | Not Started | — | |
| P15 | Education + Charter + Impact | Not Started | — | يتوقف على POL-08 لإحصاءات الأثر. |
| P16 | Notifications + Search | Not Started | — | |
| P17 | Staff Console | Not Started | — | |
| P18 | Supabase | Not Started | — | يتوقف على POL-07. |
| P19 | Security | Not Started | — | يراجع THREAT_MODEL. |
| P20 | Offline / Perf / A11y | Not Started | — | |
| P21 | Testing | Not Started | — | |
| P22 | GitHub Actions | Not Started | — | |
| P23 | Docs | Not Started | — | يكمل README. |
| P24 | Final Integration | Not Started | — | |

## سجل التحديثات

كل مدخل يذكر المرحلة وما اكتمل وما لم يكتمل، دون ادّعاء.

- **P01:** أُنشئت وثائق الحوكمة وسكربت التحقق. لم يُنفَّذ أي تحقق بواسطة الوكيل. بانتظار مخرجات تشغيل السكربت من المالك وإدخال التاريخ.

## قواعد التحديث

1. حدّث صف المرحلة وسجل التحديثات في نفس الـcommit الذي ينهيها.
2. لا ترقية إلى Done دون دليل (مخرجات lint/typecheck/test حين تتوفر).
3. إذا لم يكتمل جزء من المرحلة، فاذكره في الملاحظات صراحة وأبقِ الحالة In Progress.
4. لا تحذف صفوفاً أو مراحل. التغييرات في خارطة الطريق تُسجَّل في `docs/DECISIONS.md`.
