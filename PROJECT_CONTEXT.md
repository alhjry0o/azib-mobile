# PROJECT_CONTEXT — السياق الدائم لمشروع عازب | AZIB

> هذا الملف يُقرأ في بداية كل مرحلة. يُحدَّث في نهاية كل مرحلة قبل إعلانها Done.
> **عام المستودع:** لا أسرار، لا بيانات شخصية حقيقية.

آخر تحديث: P01 — Requirements, Architecture & Agent Governance.

---

## 1) القرارات التقنية

| القرار | القيمة المعتمدة | الحالة | المرجع |
|--------|------------------|--------|--------|
| مدير الحزم | npm | مُعتمد | `docs/DECISIONS.md#adr-0001` |
| إطار العمل | Expo + React Native + TypeScript (strict) + Expo Router | مُعتمد | HRD |
| حالة العميل | Zustand | مُعتمد | `docs/DECISIONS.md#adr-0002` |
| حالة الخادم | TanStack Query | مُعتمد | `docs/DECISIONS.md#adr-0002` |
| النماذج والتحقق | React Hook Form + Zod | مُعتمد | HRD |
| الترجمة | i18next (لغة افتراضية `ar`, RTL) | مُعتمد | HRD |
| الحركة | Reanimated + Gesture Handler | مُعتمد | HRD |
| الخادم | Supabase خلف Provider Abstraction | مُعتمد | HRD |
| الاختبارات | Jest + RNTL، Playwright (Web E2E)، pgTAP (DB) | مُعتمد | HRD, ADR-0004 |
| CI | GitHub Actions | مُعتمد | HRD |
| نموذج الأموال | Non-Custodial (لا محفظة، لا Escrow) | مُعتمد | ADR-0005 |
| تقييم الأهلية | Advisory فقط + مراجعة بشرية نهائية | مُعتمد | ADR-0006 |
| أسلوب 3D | ثلاث طبقات | مُعتمد | ADR-0003 |

---

## 2) إصدارات الأدوات

> تُملأ في **P02 (Init)** من مصادر حقيقية، لا من التخمين. المصادر: `package.json` بعد `npx expo install`، ومخرجات `npx expo-doctor`.

| الأداة | الإصدار | مصدر التحقق | تاريخ |
|--------|---------|--------------|-------|
| Node.js | (يُملأ في P02) | `node -v` | — |
| npm | (يُملأ في P02) | `npm -v` | — |
| Expo SDK | (يُملأ في P02) | `npx expo --version` | — |
| React Native | (يُملأ في P02) | `package.json` | — |
| React | (يُملأ في P02) | `package.json` | — |
| TypeScript | (يُملأ في P02) | `package.json` | — |
| expo-router | (يُملأ في P02) | `package.json` | — |
| zustand | (يُملأ في P02) | `package.json` | — |
| @tanstack/react-query | (يُملأ في P02) | `package.json` | — |
| react-hook-form | (يُملأ في P02) | `package.json` | — |
| zod | (يُملأ في P02) | `package.json` | — |
| i18next | (يُملأ في P02) | `package.json` | — |
| react-native-reanimated | (يُملأ في P02) | `package.json` | — |
| react-native-gesture-handler | (يُملأ في P02) | `package.json` | — |
| @supabase/supabase-js | (يُملأ في P02) | `package.json` | — |
| jest / @testing-library/react-native | (يُملأ في P02) | `package.json` | — |
| @playwright/test | (يُملأ في P02) | `package.json` | — |

---

## 3) بنية المجلدات

> البنية الهدف. المجلدات لا تُنشأ فعلياً إلا في المرحلة المعنية (P02+).

```
azib-mobile/
├─ docs/
│  ├─ AGENT_RULES.md
│  ├─ DECISIONS.md
│  ├─ PRODUCT_POLICIES.md
│  ├─ GLOSSARY.md
│  ├─ ASSET_LICENSES.md
│  └─ THREAT_MODEL.md
├─ PROJECT_CONTEXT.md
├─ DEVELOPMENT_PROGRESS.md
├─ README.md
├─ app/                    # Expo Router (P05+)
├─ src/
│  ├─ features/            # كل ميزة مجلد مستقل
│  ├─ components/          # مكوّنات مشتركة
│  ├─ design/              # توكنز الثيم (P04)
│  ├─ i18n/                # ملفات اللغات
│  ├─ lib/                 # أدوات صغيرة مشتركة
│  ├─ providers/           # Provider Abstraction (Supabase خلف واجهة)
│  ├─ store/               # Zustand
│  └─ types/               # أنواع مشتركة
├─ supabase/               # migrations, RLS, pgTAP (P18+)
├─ e2e/                    # Playwright (Web)
├─ assets/
└─ .github/workflows/
```

**قاعدة عامة:** لا عمق مجلدات > 4 مستويات، ولا ملف > الحد الموصى به في `AGENT_RULES.md §1 #11`.

---

## 4) الوظائف المكتملة

| # | الوظيفة | المرحلة | ملاحظات |
|---|---------|---------|---------|
| 1 | ملفات الحوكمة (AGENT_RULES, DECISIONS, PRODUCT_POLICIES, GLOSSARY, ASSET_LICENSES, THREAT_MODEL) | P01 | وثائق فقط، لا كود تطبيق. |
| 2 | السياق الدائم (PROJECT_CONTEXT, DEVELOPMENT_PROGRESS, README) | P01 | جاهزة للتحديث مع كل مرحلة. |

> لا شيء آخر مكتمل. أي جدول آخر يكون فارغاً حتى المرحلة المعنية.

---

## 5) غير المكتملة

- كل شيء ابتداءً من P02 (Init) حتى P24 (Final Integration).
- لا يوجد `package.json`، لا كود، لا اختبارات، لا CI، لا قاعدة بيانات.

---

## 6) الخدمات المتصلة

> لا شيء متصل حالياً. لا يوجد مشروع Supabase، لا مزوّد دفع، لا تخزين، لا بريد، لا Push.

عند ربط أي خدمة في مرحلة لاحقة، يجب أن يُضاف صف هنا يحوي: اسم الخدمة، ما الذي يتصل بها، بيئة (dev/staging/prod)، طريقة التحقق، تاريخ التحقق، **من تحقق**.

---

## 7) الخدمات التجريبية

> لا شيء. لن يُعتمد أي Mock في التطبيق إلا بشرطين:
> 1. أن يكون واضحاً للمستخدم (وسم Demo/Not Connected).
> 2. أن يُمثِّل البيانات عبر نفس `Provider` المستخدم في الإنتاج، لا بمسار موازٍ.

---

## 8) المشكلات المعروفة

| # | المشكلة | التأثير | الحالة | ملاحظات |
|---|---------|---------|--------|---------|
| 1 | لا توجد قرارات بشرية معتمدة بعد في `docs/PRODUCT_POLICIES.md` | تحجب P08/P09/P10/P11/P15 | Open | مطلوبة قبل تنفيذ المراحل المعنية. |
| 2 | إصدارات الأدوات غير مثبتة | تحجب P02 | Open | تُملأ في P02 من مصادر حقيقية. |
| 3 | لا يوجد تحقق آلي من وجود ملفات الحوكمة | منخفض | Open | قائمة تحقق يدوية في `AGENT_RULES.md §6`. |

---

## 9) الخطوة التالية

**P02 — Init**: تهيئة مشروع Expo، إعداد TypeScript strict، ESLint، Jest، بنية المجلدات الأساسية، i18n مع `ar` وRTL، وتثبيت الإصدارات فعلياً وتعبئة §2 من هذا الملف، مع تحديث `DEVELOPMENT_PROGRESS.md` عند الاكتمال.
```
