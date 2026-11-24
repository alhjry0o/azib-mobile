# DEVELOPMENT_PROGRESS — حالة المراحل

> يُحدَّث في نهاية كل مرحلة. الحالات: `Not Started` / `In Progress` / `Blocked` / `Done`.
> **Done** = تنفيذ + اختبار + تحديث وثائق + تقرير صادق.
> **عام المستودع:** لا أسرار ولا بيانات حقيقية.

---

## جدول المراحل (24)

| # | المرحلة | الحالة | تاريخ الإنجاز | ملاحظات |
|---|---------|--------|----------------|---------|
| P01 | Governance | Done | 2026-11-08 | وثائق فقط. |
| P02 | Init | Done | 2026-11-09 | SDK 58 · React 19.3 · RN 0.88.1 · Node 26 · ESLint 9. |
| P03 | Core Platform | Done | 2026-11-12 | 12 providers · 16 repos · seed · ARCHITECTURE. |
| P04 | Design System | Done | 2026-11-14 | 42 مكوّناً · 565 اختباراً · 71 suite. |
| P05 | Shell + Onboarding | Done | 2026-11-16 | 3 أجزاء · 623 اختباراً · ADR-0012…0015. |
| P06 | Auth / Profile / Settings / Legal | Done | 2026-11-16 | 3 أجزاء · 780 / 110 · ADR-0016…0022. |
| P07 | Home Dashboard & Discovery | Done | 2026-11-16 | جزءان · 869 / 129 · ADR-0023…0026. |
| P08 | Assistance & Eligibility Engine | Done | 2026-11-16 | 3 أجزاء · 1020 / 155 · ADR-0027…0032. |
| P09 | Financial Assistance Architecture | Done | 2026-11-16 | 3 أجزاء · 1138 / 178 · ADR-0033…0039. |
| P10 | **Group Weddings** | **Done** | **2026-11-16** | 3 أجزاء · **207/207 suites · 1270/1270 tests** · lint/typecheck نظيفان · CI أخضر (بتقرير المالك) · ADR-0040…0050 + `docs/COST_SHARING.md`. |
| P11 | Partners + Ambassadors | **Blocked** | — | **محجوب** حتى `PRODUCT_POLICIES #6`؛ يضيف ربط حساب↔شريك. |
| P12 | Souk | Not Started | — | عيني فقط؛ يخدم `in_kind`. |
| P13 | Jobs + Volunteers | Not Started | — | مهام تطوع حقيقية. |
| P14 | Calculator + Guide | Not Started | — | إرشادي فقط. |
| P15 | Education + Charter + Impact | Not Started | — | **محجوب** حتى حد الإحصاءات؛ يوحّد الأثر. |
| P16 | Notifications + Search | Not Started | — | مصدر شارة Dock وجرس الرئيسية. |
| P17 | Staff Console | Not Started | — | لوحة Maker/Checker ومراجع وإدارة مجموعات. |
| P18 | Supabase | Not Started | — | RLS للمجموعة/الدردشة/الميزانية + انتقال ذرّي. |
| P19 | Security | Not Started | — | يستهلك `THREAT_MODEL.md` (محدَّث بـP10). |
| P20 | Offline / Perf / A11y | Not Started | — | تحقق الأجهزة المؤجل (P05–P10). |
| P21 | Testing | Not Started | — | Playwright + pgTAP. |
| P22 | GitHub Actions | Not Started | — | الفاحص أُضيف مبكراً في P05. |
| P23 | Docs | Not Started | — | يُستكمل README. |
| P24 | Final Integration | Not Started | — | مسار كامل حقيقي. |

---

## قوائم التحقق السابقة (مختصرة)

### P01
- [x] `AGENT_RULES` (HRD + 22 قاعدة) · `PROJECT_CONTEXT` (9 أقسام) · `DEVELOPMENT_PROGRESS` (24 مرحلة).
- [x] `DECISIONS` · `PRODUCT_POLICIES` · `GLOSSARY` · `ASSET_LICENSES` · `THREAT_MODEL` · `README`.
- [x] لا كود تطبيق. تأكيد المالك بأوامر التحقق.

### P02
- [x] Expo SDK 58 · TS strict + `noUncheckedIndexedAccess` + alias `@/*`.
- [x] ESLint flat + Prettier + سكربتات · Jest + اختبارات حقيقية · فاحص العربية مربوط بـ`lint`.
- [x] `app.config.ts` · CI أخضر.

### P03
- [x] `Result` · `AppError` · `logger` مع redaction · `env` بـZod.
- [x] i18next + 14 namespace + formatters + RTL + plurals.
- [x] 12 contracts + mocks + NotConnected + Registry + Container · 16 repos + Contract tests · seed.

### P04
- [x] Tokens + ThemeProvider + 4 hooks + 17 زوج WCAG AA · 42 مكوّناً + Gallery + `DESIGN_SYSTEM.md`.

### P05
- [x] الهيكل · Splash + Onboarding + حفظ اللغة · Dev + Integrations + فاحص الأزرار · 623 اختباراً.

### P06
- [x] نواة المصادقة · الملف/الإعدادات/الصورة · الأمان/الجلسات/الحذف/التصدير/Legal · 780 / 110.

### P07
- [x] HomeConfig + 8 أقسام + بوابة الموافقة + إخفاء الأعداد والمبالغ + فصل Demo/Real · 869 / 129.

### P08
- [x] العقود/المحرك/الآلة · المستندات/المسودة/Wizard · المتابعة/الاعتراض/المحاكي · 1020 / 155.

### P09
- [x] عقدا التمويل/الآلتان/الحراس · الكتالوج/النية/الإيصالات · الصرف/الأثر/المحاكي · 1138 / 178.

---

## قائمة تحقق P10 (تفصيل)

### P10.1 — النواة النقية (14 suites · +81 اختباراً)
- [x] قراءة `crud.contract.ts` أولاً: لا يمنع حقولاً إضافية ⇒ تمديد Wedding آمن.
- [x] `WeddingStatus` → 7 قيم (legacy محفوظ) + `title`/`description` + حقول المجموعة (منطقة/تاريخ بديل/عدد مستهدف/وصف/نسخة السياسة/سقف).
- [x] **4 مستودعات جديدة**: `WeddingGroupRepository` (أعضاء/طلبات/دعوات) · `WeddingPollRepository` (استطلاعات/أصوات) · `WeddingBudgetRepository` (نسخ/بنود/موافقات/اتفاقات/طلبات خدمة) · `WeddingChatRepository` (رسائل/كتم/`subscribe`/تنظيف).
- [x] `Notification.create` + `schemas/notification.ts` — إضافة فقط؛ اختباراتها لم تُمسّ.
- [x] `engine/largest-remainder.ts`: حساب صحيح، كسر تعادل بترتيب معلن، رفض المدخلات الفاسدة.
- [x] `engine/cost-sharing.ts`: Equal/Weighted/Custom + Individual/Shared + **المجموع = الإجمالي**.
- [x] `engine/withdrawal-impact.ts`: إعادة القسمة + نافذة السياسة + `groupEmpty`.
- [x] `state/group-machine.ts`: 6 حالات · انتقالات معلنة · فحص الفاعل · legacy mapping.
- [x] `state/roles.ts`: مصفوفة صلاحيات + `toPublicGroupView` + `toMemberView` (موافقة الاسم).
- [x] `state/poll-rules.ts`: نصاب صحيح (`votes×100 ≥ eligible×percent`) · كسر تعادل معلن · موعد نهائي.
- [x] `state/approvals.ts`: `requiredApprovals` · `allApproved` · `missingApprovals` · `bumpVersion` · `agreementComplete`.
- [x] `chat/*`: فلتر (هاتف/رابط/صورة) · معدل · احتفاظ · كتم/إشراف.
- [x] `config/limits.ts`: `system_settings.maxGroupSize` + افتراض مؤقت + دلاء الحجم.
- [x] seed: تمديد `weddings.ts` + `wedding-planning.ts` مستقل.
- [x] اختبارات: المحرك بجداول · الآلة استقصائياً · الأدوار · التصويت · الموافقات · الدردشة · الحدود · المخططات.

### P10.2 — الاكتشاف والإنشاء والأعضاء والتصويت (8 suites · +29 اختباراً)
- [x] `engine/discovery.ts` + `useWeddingDiscovery` بفلاتر (محافظة/مديرية/حالة/حجم/شهر).
- [x] `WeddingDiscoveryScreen` (تبويب `/weddings`) — **بلا `app/weddings/index.tsx`**.
- [x] `CreateGroupScreen` (3 خطوات) + `useCreateGroup` + `buildCreateGroupSchema(max)` — السقف مفروض.
- [x] `GroupDetailScreen` · `GroupMembersScreen` (طلبات/دعوات/أدوار) · `GroupPollsScreen` + `PollCard`.
- [x] `WeddingScaffold` (بوابة backend + شارة demo) · `useWeddingGroup`/`useWeddingMembership`/`useWeddingPolls`.
- [x] `services/group-service.ts` (إنشاء/طلب/قرار/دعوة/دور/انسحاب/انتقال) + `poll-service.ts`.
- [x] نصوص `weddings:*` (ar/en) + `ROUTES.weddings` + Allowlist.
- [x] اختبارات: الاكتشاف/الإنشاء/الأعضاء/التصويت + السقف من الإعدادات.

### P10.3 — الميزانية والاتفاق والدردشة والاحتفال (7 suites · +22 اختباراً)
- [x] `services/budget-service.ts`: نسخ vN · بنود · موافقات · اعتماد بالإجماع · إعادة فتح · إعادة إصدار.
- [x] **مسار الآلة الكامل**: `adoptBudget` يسلك open→planning→agreed (لا قفز حالتين).
- [x] `agreed → planning` عند تعديل نسخة معتمدة.
- [x] `services/chat-service.ts`: عضوية/كتم → فلتر → معدل → تخزين · بلاغ/حذف/كتم/تنظيف.
- [x] `services/service-request-service.ts`: طلبات حجز بلا دفع ولا تتبّع.
- [x] `useWeddingBudget`/`useWeddingChat`/`useWeddingServices`/`useWeddingCountdown`.
- [x] **البث اللحظي**: `subscribe` يكتب في Query cache (لا `setState` في effect).
- [x] `CostSplitBars` (SVG) · `GoldConfetti` (Reanimated+SVG) · `RingCountdown` (حلقتان).
- [x] `GroupBudgetScreen` (**9 فئات كلها**) · `GroupAgreementScreen` · `GroupChatScreen` · `GroupServicesScreen` · `GroupCountdownScreen` · `GroupCompletionScreen`.
- [x] **الإسقاط العام**: `RequireAuth` على العد التنازلي · الحلقات والتاريخ الدقيق للأعضاء فقط · الشهر التقريبي لغيرهم.
- [x] الإشعارات (دعوة/تصويت/ميزانية/موعد) + 6 مسارات + Allowlist.
- [x] اختبارات: الميزانية/الدردشة/الاتفاق/طلبات الخدمة/الاحتفال.

### النتيجة النهائية
- [x] **207/207 test suites · 1270/1270 tests · lint وtypecheck نظيفان · CI أخضر بالكامل** (بتقرير المالك).
- [x] صفر انحدار في P03–P10.2 (1248 اختباراً).
- [x] **الإجمالي التراكمي لـP10: +29 suite · +132 اختباراً.**

### إصلاحات P10 (8 مجموعات)
- [x] **P10.1: لا أخطاء** — أخضر من أول تشغيل.
- [x] **P10.2 (مراجعة قبل CI):** `GROUP_FULL` كان يقرأ السقف العام بدل المقاعد ⇒ `Math.min(capacity, maxGroupSize)`؛ تحديث fixture اختبار مخطط الميزة؛ تسرّب لغوي في `ar/weddings.json`؛ نقل حساب نافذة الانسحاب إلى معالج الحدث.
- [x] **P10.2 (CI):** `exhaustive-deps` (اشتقاق `[]` خارج `useMemo`) · `import/no-duplicates` ×2.
- [x] **P10.3 (مراجعة قبل CI):** `import/first` في `use-wedding-countdown` · قفز `open→agreed` · 4 فئات من 9 · تسريب التاريخ الدقيق والحلقات لغير الأعضاء.
- [x] **P10.3 (CI):** `import/no-unresolved` ×3 (**ملف غائب** لا خطأ استيراد) · `TS18047` ×2 (تضييق لا يصمد داخل callback) · خطأ متابعة بوضع `snapshot` في دالة خاطئة (`TS2304`×2 + `TS7006`×2) · فشل اختبار معدل الدردشة (**الساعة المحقونة ≠ ساعة التخزين**).

---

## الدروس المُلزِمة (تراكمية — تُطبَّق في كل مرحلة قادمة)

### الاختبارات (RNTL v14 + Query + الساعة)
- [ ] `await render(...)` · `await fireEvent.xxx(...)` · `await view.unmount()`.
- [ ] **`rerender` إلزامي** بعد تحديث متغيّر خارجي تقرأه الواجهة.
- [ ] **الساعة المحقونة يجب أن توافق ساعة التخزين.** إن كان المستودع يختم بـ`new Date()` فلا تحقن تاريخاً ماضياً لاختبار نافذة زمنية (معدل/احتفاظ). اشتقّ الساعة من أحدث طابع مخزَّن، أو اجعل المستودع يقبل طابعاً محقوناً. ينطبق على `purgeOlderThan`/`filterRetained`.
- [ ] **لا** تغليف `fireEvent` داخل `act` · `await act(() => {...})` للمتاجر.
- [ ] كل `it` فيه `await` هو `async` · مجلد **`__tests__`** دائماً.
- [ ] **`invalidateQueries({ queryKey: ['<feature>'] })` دائماً** · `setQueryData` للجلسة **قبل** render.
- [ ] mock للمكونات المعتمدة على `Modal`/`Select`/`DatePicker`.
- [ ] `waitFor` على الحالة النهائية · `user.id` من الجلسة · `jest.mock` **بعد** الـimports.

### React 19 / React Compiler
- [ ] لا `useRef().current` أثناء render · لا `Date.now()` أثناء render (الحساب في معالج حدث أو `queryFn`).
- [ ] **كل Hook قبل أي `return` مبكر** · لا `setState` مباشر في `useEffect` ⇒ `useQuery` أو مخزن خارجي.
- [ ] الكائنات المُمرَّرة كـ dependency تُغلَّف بـ`useMemo` · **لا `[]`/`{}` خارج `useMemo`**.
- [ ] `useWatch` بدل `watch` · `override` في Class Component · `eslint-disable react-hooks/immutability` لتعديل `SharedValue`.

### TypeScript / ESLint
- [ ] **التضييق لا يصمد داخل callback** للوصول إلى خاصية (`x.value`) ⇒ `const snapshot = x.value` بعد الحارس.
- [ ] **كل الاستيرادات في أعلى الملف** (`import/first`) · لا استيراد مكرر من نفس المسار.
- [ ] **فشل حلّ نفس المسار من عدة مستهلكين = ملف غائب/مُسمّى خطأً**، لا خطأ استيرادات.
- [ ] `StyleSheet` صريح · `!`/`?? default` للفهرسة · لا `as const Type[]` بعد `Object.freeze`.
- [ ] `tabBar` prop مباشر · `refreshing`/`onRefresh` على `FlatList`.

### النطاق والآلة
- [ ] **الخدمة تسلك المسار المعلن في الآلة** ولا تقفز حالتين؛ ولا تُوسَّع الآلة للالتفاف على ترتيبها.
- [ ] **كل مسار بلا `RequireAuth` يُسقط إسقاطاً عاماً:** شهر لا يوم، **ولا حلقات عد تنازلي**، ولا أي بيانات بدقة الأعضاء. حجب النص وحده لا يكفي.
- [ ] **لا تُنشئ قيمة افتراضية داخل مسار يعتمد عليه `useMemo`.**

### العملية والتحرير
- [ ] **عند تكرار سطر الحارس في عدة دوال، حدّد مرساة فريدة** قبل طلب الاستبدال.
- [ ] **عند تغيير أسماء حقول مخطط ميزة، حدّث اختبار تلك الميزة في نفس الجزء.**
- [ ] **فاحص العربية:** `app/` + `src/` فقط، `.ts/.tsx`، باستثناء `src/locales/`؛ التعليقات تُستثنى؛ `// i18n-allow-arabic` **لكل سطر**؛ **`locales/*.json` خارج الفحص ⇒ مراجعة بشرية إلزامية**.
- [ ] لا تعديل على عقود المستودعات إلا إضافةً وبموافقة (ADR)؛ ولا مساس بـContract Tests.
- [ ] كل قرار معماري ⇒ ADR · كل قيمة سياسة غير معتمدة ⇒ وسم `PENDING_POLICY` ظاهر.
- [ ] **لا ادعاء مالي:** نية ≠ تأكيد مزوّد ≠ تحقق مالي ≠ صرف مؤكَّد.

---

## مؤجلات P10 (في PROJECT_CONTEXT §8)
- [ ] إعادة إعلان الحصص في `custom` بعد الانسحاب ⇒ قرار بشري (#64).
- [ ] `chat-unmute` يرفع أول كتم فقط ⇒ P17/P18 (#65).
- [ ] `WeddingChatApi.refetch` ⇒ P11 (#66).
- [ ] مفتاح `budget.errors.INVALID_TOTAL` ⇒ P11 (#67).
- [ ] تنظيف `styles` الميت في `GroupBudgetScreen` (#68).
- [ ] حفظ دائم + RLS للميزانية/الموافقات/الدردشة ⇒ P18 (#69).
- [ ] ربط `populateDemoSeed` بـ`Notification.create` ⇒ P16 (#14).
- [ ] تحقق الأجهزة (Confetti/الحلقات/RTL) ⇒ P20/P21 (#26).
- [ ] اعتماد سقف المجموعة/النصاب/كسر التعادل/المعدل/الاحتفاظ ⇒ المالك (#4, #7, #70).
- [ ] تنفيذ #33 · حذف `SignInPlaceholder` (#34) · توحيد الإحصاءات (#58) · ضم الفاحص لـ`lint` (#24) · إعلان `zod` (#37).

---

## القرارات البشرية المفتوحة (Blockers)

| # | القرار | يحجب |
|---|--------|------|
| 1 | حدود الاستحقاق ونطاقات الدخل | P15 · اعتماد المحرك |
| 2 | سلّم النطاقات (الأوزان محسومة) | اعتماد المحرك |
| 3 | مدة الاعتراض | P17 |
| 4 | سياسة الانسحاب (30 يوماً استُخدمت مؤقتاً) | الاعتماد النهائي |
| 5 | الاستثناء من مساعدة واحدة | P17 |
| 6 | **الفئة المستفيدة من خصومات الشركاء** | **P11** |
| 7 | مدة الاحتفاظ + فترة الحذف + احتفاظ الدردشة | P19 / P23 |
| 8 | الحد الأدنى لإخفاء الإحصاءات | P15 / P17 |
| 9 | مراجعة قانونية لنصوص Legal | الإطلاق |
| 10 | سياسة عرض النقاط وموافقة النشر | P15 / P17 |
| 11 | سياسة المزوّد المرخّص | P18 · تبرع حقيقي |
| 12 | **إعادة توزيع الحصص المخصصة بعد الانسحاب** | إتمام `custom` |
