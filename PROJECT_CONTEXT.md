# PROJECT_CONTEXT — السياق الدائم لمشروع عازب | AZIB

> هذا الملف يُقرأ في بداية كل مرحلة. يُحدَّث في نهاية كل مرحلة قبل إعلانها Done.
> **عام المستودع:** لا أسرار، لا بيانات شخصية حقيقية.

آخر تحديث: P04 — Design System (مغلق — 2026-11-14).
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

> المصدر الأساسي `package.json`. القيم المُعلَّمة `TBD` تُملأ في أول ردّ يصلني فيه `package.json` بعد P02. لا تخمين.

| الأداة | الإصدار | مصدر التحقق | تاريخ |
|--------|---------|--------------|-------|
| Node.js | v26.13.0 | `node -v` (بتقرير المستخدم) | 2026-11-08 |
| npm | 12.2.1 | `npm -v` (بتقرير المستخدم) | 2026-11-08 |
| Expo SDK | ~58.0.23 | `package.json` | 2026-11-08 |
| React Native | 0.88.1 | `package.json` | 2026-11-08 |
| React | 19.3.0 | `package.json` | 2026-11-08 |
| React DOM | 19.3.0 | `package.json` | 2026-11-08 |
| expo-router | ~58.0.30 | `package.json` | 2026-11-08 |
| expo-constants | ~58.0.15 | `package.json` | 2026-11-08 |
| expo-linking | ~58.0.16 | `package.json` | 2026-11-08 |
| expo-status-bar | ~58.0.4 | `package.json` | 2026-11-08 |
| react-native-reanimated | 4.7.1 | `package.json` | 2026-11-08 |
| react-native-gesture-handler | ~3.3.0 | `package.json` | 2026-11-08 |
| react-native-safe-area-context | ~5.11.1 | `package.json` | 2026-11-08 |
| react-native-screens | ~4.30.1 | `package.json` | 2026-11-08 |
| react-native-web | ~0.21.4 | `package.json` | 2026-11-08 |
| react-native-worklets | 0.13.0 | `package.json` | 2026-11-08 |
| TypeScript | ~6.0.3 | `package.json` | 2026-11-08 |
| @types/react | ~19.3.0 | `package.json` | 2026-11-08 |
| ESLint | ^9.0.0 | `package.json` (بتقرير المستخدم) | 2026-11-09 |
| eslint-config-expo | ^58.0.4 | `package.json` | 2026-11-09 |
| eslint-import-resolver-typescript | ^4.4.5 | `package.json` | 2026-11-09 |
| eslint-plugin-import | ^2.32.0 | `package.json` | 2026-11-09 |
| Jest | ^30.5.2 | `package.json` | 2026-11-09 |
| jest-expo | ^58.0.14 | `package.json` | 2026-11-09 |
| @types/jest | ^30.0.0 | `package.json` | 2026-11-09 |
| @types/node | ^26.6.6 | `package.json` | 2026-11-09 |

---

## 3) بنية المجلدات

> البنية الهدف. المجلدات لا تُنشأ فعلياً إلا في المرحلة المعنية (P02+).

```
azib-mobile/
├─ app/ # Routes ONLY (Expo Router)
│ ├─ _layout.tsx
│ └─ index.tsx
├─ src/
│ ├─ lib/ # Small internal helpers (i18n stub, etc.)
│ ├─ components/          # Shared presentational components
│ │ ├─ i18n.ts
│ │ └─ __tests__/
│ ├─ locales/ # Translation JSON (only place allowed for Arabic text)
│ │ ├─ ar.json
│ │ └─ en.json
│ ├─ components/          # Shared presentational components
│ │  ├─ ui/               # Design System components (P04, 42 components)
│ │  └─ brand/            # Brand & motion (ArchHero, Qamariya, DoubleRing, Hero3D)
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
│ ├─ config/ # Runtime config from EXPO_PUBLIC_*
│ ├─ theme/ # Design tokens (P04)
│ ├─ utils/ # Pure utilities
│ └─ core/ # Cross-cutting primitives
├─ tests/tests/ # Cross-cutting tests (scripts, tooling)
├─ mocks/ # Shared test mocks / fixtures
│  └─ seed/                # Demo seed bundle (dataOrigin='demo')
├─ supabase/ # Migrations + RLS + pgTAP (P18)
├─ scripts/ # Dev & lint scripts
├─ assets/images/ # Placeholder icons (P04 replaces)
├─ docs/ # Governance (P01)
├─ docs/DESIGN_SYSTEM.md   # Full reference (finalized in P04)
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


## 4) الوظائف المكتملة

| # | الوظيفة | المرحلة | ملاحظات |
|---|---------|---------|---------|
| 1 | ملفات الحوكمة (AGENT_RULES, DECISIONS, PRODUCT_POLICIES, GLOSSARY, ASSET_LICENSES, THREAT_MODEL) | P01 | وثائق فقط، لا كود تطبيق. |
| 2 | السياق الدائم (PROJECT_CONTEXT, DEVELOPMENT_PROGRESS, README) | P01 | جاهزة للتحديث مع كل مرحلة. |
| 3 | مشروع Expo SDK 58 (TS strict, ESLint, Jest, i18n stub, CI) | P02 | CI أخضر 2026-11-09. |
| 4 | شاشة Index مؤقتة تعرض `t('common.appName')` | P02 | تُستبدل في P05. |
| 5 | Core Platform Layer (Result, AppError, logger, env, AppMode store) | P03 | يستهلكه كل ما بعده. |
| 6 | 12 Provider contracts + NotConnected stubs + Registry | P03 | ADR-0005/0006 محققة. |
| 7 | 12 Mock adapters + ProviderContainer | P03 | `dataOrigin='demo'` على كل سجل. |
| 8 | 16 Repository contracts + mocks + Contract tests | P03 | جاهزة للاستبدال بـSupabase في P18. |
| 9 | i18n كامل (i18next, formatters, RTL) + 14 namespace | P03 | استبدل الـstub من P02. |
| 10 | Demo seed framework + DemoBadge + NotConnectedScreen | P03 | populator يغطي 13/16. |
| 11 | `docs/ARCHITECTURE.md` | P03 | يوثّق كل ما سبق. |
| 12 | Theme tokens + ThemeProvider + 4 hooks (device tier, motion, haptics, direction) | P04 | WCAG AA verified. |
| 13 | Primitives + Forms (16 components) | P04 | Icon, Text, Screen, Button + 12 form components. |
| 14 | Feedback & Display (11 components) | P04 | Toast, Banner, Badge, Card, ListItem, SectionHeader, Divider, Avatar, ProgressBar, RingProgress, Skeleton. |
| 15 | Overlays + Navigation (5 components) | P04 | Dialog, BottomSheet, Tabs, SegmentedControl, Stepper. |
| 16 | Brand & Motion (7 components) | P04 | ArchHero, QamariyaPattern, GlowView, GlassView, DoubleRingLoader, DoubleRingSuccess, Hero3D. |
| 17 | States (3) + StateView base | P04 | EmptyState, ErrorState, NotConnectedState. |
| 18 | `docs/DESIGN_SYSTEM.md` كامل | P04 | Tokens, catalog, rules, tier matrix, RTL + A11y checklists. |
| 19 | Gallery at `/gallery` | P04 | Internal Showcase. Gating deferred to P22. |
> لا شيء آخر مكتمل. أي جدول آخر يكون فارغاً حتى المرحلة المعنية.

---

## 5) غير المكتملة

- ابتداءً من **P05 (Shell + Onboarding)** حتى **P24 (Final Integration)**.
- P18 سيستبدل mocks بـSupabase adapters.
- P05 سيضيف Developer Settings لتبديل AppMode + عرض IntegrationRegistry + بوابة Gallery.

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
| 1 | قرارات `docs/PRODUCT_POLICIES.md` غير معتمدة | تحجب P08/P10/P11/P15 | Open | قرارات بشرية مطلوبة. |
| 2 | `I18nManager.forceRTL` غير مُفعَّل عند تبديل اللغة | تبديل اللغة لا يعكس التخطيط حتى reload | Open | يُفعَّل في P05 Developer Settings. |
| 3 | أيقونات Placeholder من قالب Expo | لا تعكس الهوية البصرية | Open | تُستبدل في P04+؛ تُستكمل في P05. |
| 4 | لا تحقق آلي من وجود ملفات الحوكمة | يدوي فقط | Open | قائمة تحقق في `AGENT_RULES.md §6`. |
| 5 | ESLint مثبّت على 9.x (ADR-0007) | لا تستفيد من ميزات ESLint 10 | Accepted | يُفتح ADR بديل عند دعم `eslint-config-expo` لـ10. |
| 6 | `src/lib/__tests__/i18n.test.ts` يستخدم `// i18n-allow-arabic` | مقبول (نص غير UI)، قابل للتنظيف | Accepted | في P21: استيراد `ar.json` بدل النص الحرفي. |
| 7 | `tsconfig.types = ["jest","node"]` | إن أُضيفت بيئات اختبار جديدة تُحدَّث القائمة | Accepted | إعداد داخلي، لا ADR. |
| 8 | `populateDemoSeed` لا يغطي content/notifications/search | تحتاج factory param غير موجود | Open | تُضاف في P05 عبر `createRepositoryContainer({ seedBundle })`. |
| 9 | backend mode يستخدم mocks للـ16 repo حتى P18 | بيانات demo في وضع backend | Accepted | يُصحَّح في P18. |
| 10 | لا Developer Settings UI بعد | لا يمكن تبديل AppMode من الواجهة | Open | P05. |
| 11 | `RingProgress` بلا animation (قيم فورية) | تجربة أقل نعومة عند التحديث | Accepted | animation في P05+ عبر Reanimated. |
| 12 | `BottomSheet` single-snap فقط | لا يدعم نقاط توقف متعددة | Accepted | multi-snap في P20 إن لزم. |
| 13 | `Tabs` غير scrollable | يقتصر على ≤5 تبويبات مرئية | Accepted | scrollable في P07+ إن لزم. |
| 14 | `Avatar` initials فقط (لا دعم صورة) | لا يستطيع عرض صور المستخدم | Open | image support في P06 (رفع الملفات). |
| 15 | Gallery متاح في الإنتاج عبر `/gallery` | surface للتشويش | Open | بوابة dev-only في P22. |
| 16 | اختبارات Reanimated تستخدم mock static (ADR-0011) | الحركة الحقيقية لا تُختبر في Jest | Accepted | E2E في P21 + device tests.|

## 9) الخطوة التالية

**P05 — Shell + Onboarding:** الهيكل العام (Dock, RootShell)، شاشات Onboarding الأولى (3-4 خطوات)، Developer Settings (تبديل AppMode + عرض IntegrationRegistry)، تفعيل `I18nManager.forceRTL` عند تبديل اللغة، بوابة Gallery (dev-only)، وتحديث §2 من هذا الملف.

**قبل بدء P05:** التأكد من أن قرارات `docs/PRODUCT_POLICIES.md` الحرجة لقرارات Onboarding (مدة الاحتفاظ، حدود الاستحقاق) لا تحجب تصميم الخطوات.

