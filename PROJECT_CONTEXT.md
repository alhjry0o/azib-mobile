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
| Node.js | v26.13.0 | `node -v` | 2026-11-08 |
| npm | 12.2.1 | `npm -v` | 2026-11-08 |
| Expo SDK | ~58.0.23 | `package.json` | 2026-11-08 |
| React Native | 0.88.1 | `package.json` | 2026-11-08 |
| React | 19.3.0 | `package.json` | 2026-11-08 |
| React DOM | 19.3.0 | `package.json` | 2026-11-08 |
| expo-router | ~58.0.30 | `package.json` | 2026-11-08 |
| TypeScript | ~6.0.3 | `package.json` | 2026-11-08 |
| react-native-reanimated | 4.7.1 | `package.json` | 2026-11-08 |
| react-native-gesture-handler | ~3.3.0 | `package.json` | 2026-11-08 |
| react-native-safe-area-context | ~5.11.1 | `package.json` | 2026-11-08 |
| react-native-screens | ~4.30.1 | `package.json` | 2026-11-08 |
| react-native-web | ~0.21.4 | `package.json` | 2026-11-08 |
| react-native-worklets | 0.13.0 | `package.json` | 2026-11-08 |
| eslint / eslint-config-expo | (يُقرأ من `package.json` بعد التثبيت) | `npm run lint:js` | 2026-11-08 |
| jest / jest-expo | (يُقرأ من `package.json` بعد التثبيت) | `npm test -- --ci` | 2026-11-08 |
| prettier | (يُقرأ من `package.json` بعد التثبيت) | `npm run format:check` | 2026-11-08 |
---

## 3) بنية المجلدات

> البنية الهدف. المجلدات لا تُنشأ فعلياً إلا في المرحلة المعنية (P02+).

```
azib-mobile/
├─ app/ # Routes ONLY (Expo Router)
│ ├─ layout.tsx
│ └─ index.tsx
├─ src/
│ ├─ lib/ # Small internal helpers (i18n stub, etc.)
│ │ ├─ i18n.ts
│ │ └─ tests/
│ ├─ locales/ # Translation JSON (only place allowed for Arabic text)
│ │ ├─ ar.json
│ │ └─ en.json
│ ├─ components/ # Shared presentational components
│ ├─ features/ # Feature modules
│ ├─ hooks/ # Shared hooks
│ ├─ services/ # Use-case services
│ ├─ repositories/ # Data-access boundary
│ ├─ providers/ # Provider Abstraction (Supabase behind interface)
│ ├─ adapters/ # Third-party SDK adapters
│ ├─ stores/ # Zustand stores (client state only)
│ ├─ schemas/ # Zod schemas
│ ├─ types/ # Shared domain types
│ ├─ constants/ # Constants (no Arabic strings)
│ ├─ config/ # Runtime config from EXPO_PUBLIC*
│ ├─ theme/ # Design tokens (P04)
│ ├─ utils/ # Pure utilities
│ └─ core/ # Cross-cutting primitives
├─ tests/tests/ # Cross-cutting tests (scripts, tooling)
├─ mocks/ # Shared test mocks / fixtures
├─ supabase/ # Migrations + RLS + pgTAP (P18)
├─ scripts/ # Dev & lint scripts
├─ assets/images/ # Placeholder icons (P04 replaces)
├─ docs/ # Governance (P01)
├─ .github/workflows/ # CI
├─ app.config.ts
├─ eslint.config.js
├─ jest.config.js
├─ jest.setup.ts
├─ .prettierrc.json
├─ tsconfig.json
├─ package.json
├─ .nvmrc
└─ .env.example
```

**قاعدة عامة:** Routes in `app/` only. Features in `src/features/`. No business logic in `app/*.tsx`. 
```

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

**قبل بدء P02:** يجب أن يقرر المالك أولوية قرارات `docs/PRODUCT_POLICIES.md` التي تحجب P08/P10/P11/P15 — حتى لو تأخر التنفيذ، يُفضَّل تثبيت قرارات P08 مبكراً.
```
