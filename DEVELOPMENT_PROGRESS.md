# DEVELOPMENT_PROGRESS — حالة المراحل

> يُحدَّث في نهاية كل مرحلة. الحالات المسموحة: `Not Started` / `In Progress` / `Blocked` / `Done`.
> **Done** لا تعني «تم التصميم» بل «تم التنفيذ + الاختبار + تحديث الوثائق + تقرير صادق».
> **عام المستودع:** لا أسرار ولا بيانات حقيقية.

---

## جدول المراحل (24)

| # | المرحلة | الحالة | تاريخ الإنجاز | ملاحظات |
|---|---------|--------|----------------|---------|
| P01 | Requirements, Architecture & Agent Governance | Done | 2026-11-08 | وثائق فقط (`AGENT_RULES §6`). |
| P02 | Init (Expo + TS strict + ESLint + Jest + i18n + بنية) | Done | 2026-11-09 | SDK 58، React 19.3، RN 0.88.1، Node 26، ESLint 9. |
| P03 | Core Platform | Done | 2026-11-12 | 12 providers، 16 repos، seed، ARCHITECTURE. |
| P04 | Design System | Done | 2026-11-14 | 42 مكوّناً، 565 اختباراً، 71 suite. |
| P05 | Shell + Onboarding | Done | 2026-11-16 | 3 أجزاء. 623 اختباراً. ADR-0012…0015. |
| P06 | **Auth / Profile / Settings / Legal** | **Done** | **2026-11-16** | 3 أجزاء. **110/110 suites · 780/780 tests · CI أخضر بلا تحذيرات** (بتقرير المالك). ADR-0016…0022 + `docs/INTEGRATIONS.md`. |
| P07 | Home | Not Started | — | كل بلاطة إما تعمل أو `Not Connected`. |
| P08 | Assistance + Eligibility | Not Started | — | **محجوب** حتى قرارات الاستحقاق والدخل والأوزان. |
| P09 | Financial Architecture | Not Started | — | Non-Custodial، لا دفع تجريبي. |
| P10 | Group Weddings | Not Started | — | **محجوب** حتى سياسة الانسحاب. |
| P11 | Partners + Ambassadors | Not Started | — | **محجوب** حتى فئة خصومات الشركاء. |
| P12 | Souk | Not Started | — | تبرعات عينية فقط. |
| P13 | Jobs + Volunteers | Not Started | — | لا بيانات تواصل عامة. |
| P14 | Calculator + Guide | Not Started | — | إرشادي فقط. |
| P15 | Education + Charter + Impact | Not Started | — | **محجوب** حتى حد إخفاء الإحصاءات. |
| P16 | Notifications + Search | Not Started | — | يربط مصدر شارة Dock. |
| P17 | Staff Console | Not Started | — | يستفيد من أدوار P06 وحارسه. |
| P18 | Supabase (Schema + RLS + pgTAP) | Not Started | — | ينفّذ الحذف، يحفظ الصورة، يستعيد الجلسة. |
| P19 | Security | Not Started | — | يستهلك `THREAT_MODEL.md`. |
| P20 | Offline / Perf / A11y | Not Started | — | يشمل تحقق الأجهزة المؤجل. |
| P21 | Testing | Not Started | — | Playwright + pgTAP. |
| P22 | GitHub Actions | Not Started | — | الفاحص أُضيف مبكراً في P05. |
| P23 | Docs | Not Started | — | يُستكمل README. |
| P24 | Final Integration | Not Started | — | مسار كامل حقيقي. |

---

## قائمة تحقق P01 (تفصيل)
- [x] `docs/AGENT_RULES.md` (HRD + 22 قاعدة + حلقة العمل + بيئة التنفيذ).
- [x] `PROJECT_CONTEXT.md` (9 أقسام) · `DEVELOPMENT_PROGRESS.md` (24 مرحلة).
- [x] `docs/DECISIONS.md` (قالب + 6 قرارات) · `PRODUCT_POLICIES` (8 قرارات بشرية).
- [x] `GLOSSARY` · `ASSET_LICENSES` · `THREAT_MODEL` · `README` مبدئي.
- [x] لا كود تطبيق. تأكيد المستخدم بأوامر التحقق (2026-11-08).

## قائمة تحقق P02 (تفصيل)
- [x] Expo SDK 58 · TS strict + `noUncheckedIndexedAccess` + alias `@/*`.
- [x] ESLint flat + Prettier + سكربتات lint/format/typecheck/test/web:export/doctor.
- [x] Jest (jest-expo) + اختبارات وحدة حقيقية.
- [x] `.env.example` + `.gitignore` يمنع `.env` وkeystores.
- [x] `check-hardcoded-arabic.mjs` مربوط بـ`lint`.
- [x] `app.config.ts`: `allowBackup=false`, `supportsRTL=true`, scheme `azib`.
- [x] CI: `npm ci` → lint → typecheck → test.
- [x] تأكيد المستخدم بـdoctor وweb:export (2026-11-09).

## قائمة تحقق P03 (تفصيل)
- [x] `Result<T,E>` · `AppError` (8 kinds) · `logger` مع redaction · `env` بـZod.
- [x] i18next + 14 namespace + formatters + RTL helpers + plurals عربية.
- [x] 12 contracts + 12 mocks + 12 NotConnected stubs + Registry + Container.
- [x] 16 repository contracts + mocks + Contract tests + crud factory.
- [x] 15 مجموعة seed (`dataOrigin='demo'`, بلا PII) + populator (13/16).
- [x] `ARCHITECTURE.md` + تحديث الملفين + README. CI أخضر بعد كل جزء.

## قائمة تحقق P04 (تفصيل)
- [x] Tokens كاملة + ThemeProvider + 4 hooks + 17 زوج WCAG AA.
- [x] 42 مكوّناً (4 primitives · 12 forms · 3 feedback · 8 display · 2 overlays · 3 nav · 7 brand · 3 states).
- [x] Gallery + `DESIGN_SYSTEM.md` + ADR-0009/0010/0011.
- [x] P04.1 … P04.6b — كلها خضراء (565 اختباراً).

## قائمة تحقق P05 (تفصيل)
- [x] P05.1: routes · Gate · FloatingDock · Hosts · Banners · ErrorBoundary · NotFound · Maintenance · Deep Links · حارس Staff · Placeholders · بوابة `(dev)`.
- [x] P05.2: AnimatedSplash (تخطي + Reduce Motion) · Onboarding 5 خطوات · حفظ اللغة + forceRTL + Bootstrap · namespace `onboarding`.
- [x] P05.3: DevSettings · Integrations (healthCheckAll حقيقي) · `check-dead-buttons.mjs` + خطوة CI.
- [x] 623 اختباراً ناجحاً، CI أخضر (بتقرير المالك).

---

## قائمة تحقق P06 (تفصيل)

### P06.1 — نواة المصادقة
- [x] `src/schemas/auth.ts`: بريد/كلمة مرور/اسم/رمز/نية دور + موافقتان، الرسائل مفاتيح i18n.
- [x] توسيع `AuthProvider` بـ5 دوال (signUp · requestVerification · verify · requestPasswordReset · resetPassword) + `channels` — **إضافة فقط**.
- [x] تنفيذ الدوال في Mock وNotConnected معاً؛ لا كسر لأي Contract Test.
- [x] Mock Auth كامل: مستخدمون، تحديات، عدّاد محاولات، قفل بعد 5 محاولات فاشلة، كولداون إعادة إرسال 30s، أدوار، موافقات بنسخ.
- [x] `auth-machine.ts` نقية: 5 حالات + كل الانتقالات الصالحة وغير الصالحة + `deriveAuthPhase`.
- [x] `token-vault.ts`: SecureStore (`WHEN_UNLOCKED`) على الجهاز · **ذاكرة فقط على الويب** · fallback عند فشل Keychain · لا تسجيل للتوكن.
- [x] `use-auth.ts`: signIn/signUp/verify/resend/requestReset/resetPassword/guest/signOut + تجديد تلقائي مجدول عند وجود توكنات.
- [x] 6 شاشات: Welcome (3 مداخل + شرح حدود الضيف) · SignIn · SignUp (مؤشر قوة + موافقات + نية دور) · Verify · Forgot (منع تعداد) · Reset.
- [x] `use-otp.ts`: محاولات + كولداون + helpers نقية.
- [x] `auth.store`: علم الضيف (persist) + challenge وredirect في الذاكرة — **بلا توكنات**.
- [x] `RequireAuth` + تحديث Gate → Welcome + حارسا Tabs/Staff + حالة `verify`.
- [x] `hasStaffRole` يقرأ أدوار الجلسة (deny-by-default عند غيابها).
- [x] `(dev)/auth`: مبدّل أدوار + عارض جلسة + رمز تجريبي.
- [x] Deep Links: welcome/sign-up/verify/forgot/reset مسموحة.
- [x] اختبارات: schemas · machine · vault · otp · mock flows · 4 شاشات · RequireAuth · routing-auth · DevAuth · GateScreen (محدَّث).

### P06.2 — الملف الشخصي والإعدادات
- [x] `mocks/seed/locations.ts`: 6 محافظات + 10 مديريات + 7 مناطق، `nameKey` i18n، `dataOrigin='demo'`، `verificationStatus='pending-human-review'`.
- [x] `locations.ts` نقية: childrenOf / locationChain / selectionFromId / deepestId / isValidChain.
- [x] `use-profile.ts` عبر `ProfileRepository` — **بلا تعديل عقد**؛ الموقع في `city`.
- [x] `image-pipeline.ts`: اختيار + قص مربع مركزي + إعادة ترميز JPEG (واجهة `manipulateAsync` المثبتة) — **فشل المعالجة ⇒ لا رفع**.
- [x] `use-avatar-upload.ts`: رفع عبر `FileStorageProvider` + الرابط في Query cache + إزالة.
- [x] `Avatar` يقبل `uri` (خاصية إضافية، رجوع للأحرف الأولى).
- [x] `LocationCascade` (3 قوائم متتالية + إعادة ضبط الأبناء).
- [x] شاشتا Profile (عرض بحالاته الثمانية) وEditProfile (RHF + Zod + أخطاء Inline).
- [x] `settings.store`: أرقام · مظهر · رؤية الاسم · موافقة القصص · إشعارات (persist).
- [x] Module 20: فهرس + account + language + appearance + numbers + notifications + privacy + help + about.
- [x] `SignOutButton` بتأكيد عبر DialogHost + مسح الجلسة.
- [x] مسارات `profile/*` (RequireAuth) و`settings/*` (حارس جزئي) + تحديث Allowlist.
- [x] اختبارات: profile-form · locations · image-pipeline · ProfileScreen · EditProfileScreen · SettingsIndex · SettingsPreferences · settings.store.

### P06.3 — الأمان والحذف والتصدير والقانوني
- [x] توسيع العقد بـ6 دوال → **15 capability**: changePassword · listSessions · revokeSession · requestAccountDeletion · cancelAccountDeletion · exportAccountData.
- [x] Mock: سجل جلسات + تمييز الحالية + إنهاء + طلب حذف بإعادة مصادقة + إلغاء + تصدير بلا أسرار.
- [x] `schemas/security.ts`: تغيير كلمة المرور (رفض المطابقة للقديمة) + تأكيد الحذف (كلمة مرور + `DELETE` + إقرار).
- [x] `use-security.ts` · `use-account-deletion.ts` · `use-data-export.ts`.
- [x] `biometric.ts` + `use-biometric-lock.ts` + `BiometricGate` (قفل فعلي لشاشة الأمان، تعطيل بسبب معلن).
- [x] شاشة الأمان: نموذج تغيير كلمة المرور + مفتاح البيومتري + رابط الأجهزة.
- [x] شاشة الأجهزة: قائمة + تمييز الحالية + إنهاء (الحالية تُخرج إلى Welcome).
- [x] شاشة الحذف: 3 خطوات + شرح المحذوف/المجهَّل/المحتفظ + جدولة بتاريخ + إلغاء فعلي + وسم المدة غير المعتمدة.
- [x] `export-service.ts` نقية (بناء + تسلسل + اسم ملف) و`export-file.ts` حدودية.
- [x] **ترحيل التصدير إلى الواجهة الصنفية**: `new File(Paths.document, fileName)` + `create({overwrite:true})` + `write(json)` + `file.uri`؛ حذف حارس `NO_DOCUMENT_DIRECTORY` والاستيراد غير المستخدم.
- [x] مسار الويب: Blob + تنزيل (بلا حزم أصلية).
- [x] `legal-documents.ts`: 5 وثائق بنسخ `draft-1` + `requiresLegalReview: true` + مفاتيح i18n فقط.
- [x] `LegalDocScreen` + `app/legal/[doc].tsx` + حالة مجهول صادقة.
- [x] نصوص قانونية كاملة في `locales/{ar,en}/legal.json` + وسم مراجعة ظاهر.
- [x] تحديث Allowlist بمسارات settings الأربعة وlegal الخمسة.
- [x] اختبارات: security schemas · mock-auth-security · legal registry · LegalDocScreen · export-service · Security · Devices · DeleteAccount · ExportData.

### النتيجة النهائية
- [x] **110/110 test suites · 780/780 tests · CI أخضر بالكامل بلا أخطاء أو تحذيرات** (بتقرير المالك 2026-11-16).
- [x] لا انحدار في P03/P04/P05 (كل Contract Tests والاختبارات السابقة خضراء).
- [x] `lint` · `typecheck` · `expo-doctor (20/20)` · `test` · `web:export` — كلها خضراء.

### إصلاحات P06.1 (سجّلها المالك)
- [x] التقاط الحاوية داخل `useEffect` لا أثناء render (تفادي overlapping act).
- [x] فهرسة المصفوفات بمتغير `number` محمية بـ`?? default` (`noUncheckedIndexedAccess`).
- [x] عدم استدعاء `requestVerification` بعد `signUp` (كولداون) — بدلاً منه `challengeId`/`demoCode` داخل `pendingVerification`.
- [x] الكولداون المحلي يبدأ عند **محاولة** الإرسال لا عند نجاحه.
- [x] ترحيل كل الاختبارات إلى أسلوب RNTL v14.

### إصلاحات P06.2 (7 دورات CI)
- [x] `manipulateAsync` بدل الواجهة الكائنية غير الموجودة.
- [x] `useWatch` بدل `watch` (React Compiler يفشل على التحذيرات).
- [x] `import { StyleSheet }` صريح في كل ملف فيه `styles`.
- [x] `expo install --fix` لإصلاح 4 patch mismatches في `package.json` + `package-lock.json` معاً (رُفض `install.exclude`).
- [x] اختبارات الشاشات: mock لـ`Select`/`Modal` بدل محاكاة النافذة.
- [x] `user.id` يُقرأ من الجلسة لا قيمة ثابتة.
- [x] `setQueryData` مباشر بدل `invalidateQueries` وحده.
- [x] `waitFor` على الحالة النهائية (busy=false) لا العنصر اللحظي.

### إصلاحات P06.3 (4 مجموعات)
- [x] **lint:** `expo-file-system` تُصدّر الواجهة الصنفية؛ الكلاسيكية في `/legacy`. ترحيل `export-file.ts` + mock ببنية `Paths`/`File` مع بادئة `mock` (شرط jest-hoist)، ونقل فحص اسم الملف إلى أول وسيط لـ`Sharing.shareAsync`.
- [x] **test:** فهرس الإعدادات — `security` أُخرج من الصفوف النشطة، و`deleteAccount` صار بنداً معطّلاً عبر `renderUpcomingRow` (`ListItem disabled` + `subtitle = profile:settings.comingSoon`). `devices` و`exportData` نشطان. **النتيجة: انحراف موثَّق في `PROJECT_CONTEXT §8 #32`.**
- [x] **test:** تلوّث بين اختبارات LegalDocScreen بسبب `unmount()` غير مؤجَّل داخل حلقة → `await view.unmount()` + `await waitFor(...)`. الشاشة والسجل لم يُمسّا ولم يُضعف أي تأكيد.
- [x] **typecheck:** `const view = await render(...)` (لا تفكيك مباشر) + استيراد `waitFor`.

### دروس ملزمة لكل المراحل القادمة
- [x] **RNTL v14:** `await render(...)` · `await fireEvent.xxx(...)` · `await view.unmount()` · **لا** تغليف `fireEvent` داخل `act` · `await act(() => {...})` (callback متزامن) لتحديث المتاجر · كل `it` فيه `await` هو `async`.
- [x] **لا side effects أثناء render** — الالتقاط من hooks داخل `useEffect`.
- [x] **`useWatch` لا `watch`** (React Compiler مفعّل والتحذيرات تفشل CI).
- [x] **`StyleSheet` استيراد صريح** في كل ملف يستخدم `StyleSheet.create`.
- [x] **فهرسة مصفوفة بمتغير number ⇒ `?? default`.**
- [x] **مجلد الاختبار `__tests__`** (بشرطتين سفليتين) دائماً.
- [x] **لا افتراض لواجهة حزمة من الذاكرة** — تحقّق من المثبت (`npm ls` / `expo install --check`) أو اعزل الاستدعاء في وحدة حدودية واحدة (ADR-0022).
- [x] **اختبارات الشاشات:** mock للمكونات المعتمدة على `Modal`/`Select`؛ `setQueryData` مباشر؛ `waitFor` على الحالة النهائية؛ `user.id` من الجلسة.
- [x] **عند تغيير سلوك شاشة، حدّث اختبارها في نفس الجزء** (درس مباشر من انحراف #32).
- [x] **أي helper جديد يُضاف لسطر الاستيراد** (درس TS2304).
- [x] **`expo install --fix` يصلح `package.json` + `package-lock.json` معاً**؛ لا `install.exclude` لإخفاء الانحراف.

### مؤجلات P06 (في PROJECT_CONTEXT §8)
- [ ] حفظ رابط الصورة دائماً → P18 (#26).
- [ ] تحقق إزالة EXIF على جهاز → P20 (#27).
- [ ] تنفيذ مسح الحذف من الخادم + اعتماد المدة → P18 + قرار بشري (#29).
- [ ] أجهزة/جلسات حقيقية وإنهاء عن بُعد → P18 (#30).
- [ ] مراجعة قانونية للنصوص الخمسة → قبل الإطلاق (#31).
- [ ] **قرار تفعيل صفّي الأمان والحذف في الفهرس → المالك (#32).**
- [ ] حذف `SignInPlaceholder` مع اختباره → P07 (#33).
- [ ] استعادة الجلسة عند الإقلاع → P18 (#35).
- [ ] إعلان `zod` في `package.json` + ضم الفاحص لـ`lint` (#36, #23).
- [ ] `seedBundle` → مؤجل بقرار المالك (#8).

---

## القرارات البشرية المفتوحة (Blockers محتملة)

| # | القرار | يحجب |
|---|--------|------|
| 1 | حدود الاستحقاق ونطاقات الدخل | P08 |
| 2 | أوزان التقييم الآلي | P08 / P14 |
| 3 | مدة الاعتراض | P08 |
| 4 | سياسة الانسحاب من العرس الجماعي | P10 |
| 5 | الاستثناء من قاعدة مساعدة واحدة | P08 |
| 6 | الفئة المستفيدة من خصومات الشركاء | P11 |
| 7 | مدة الاحتفاظ بالبيانات + فترة تأكيد الحذف | P06 (#29) / P19 / P23 |
| 8 | الحد الأدنى لإخفاء الإحصاءات | P15 / P17 |
| 9 | مراجعة قانونية لنصوص Legal | الإطلاق |
| 10 | تفعيل صفّي الأمان والحذف في فهرس الإعدادات | P06 (#32) |
