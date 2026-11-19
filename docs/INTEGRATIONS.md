# INTEGRATIONS — عقود المزوّدين وحالة الربط

> أُنشئ في **P06** تنفيذاً لبند الاكتمال في HRD.
> **عام المستودع:** لا أسرار، لا مفاتيح، لا بيانات شخصية.
> **قاعدة الصدق:** لا يُكتب «متصل» إلا بعد تشغيل فعلي على بيئة محددة مع ذكر من تحقق.

آخر تحديث: 2026-11-16 (إغلاق P06).

---

## 1) حالة الربط الفعلية

| المزوّد | demo | backend | متصل فعلياً؟ | التحقق |
|---------|------|---------|---------------|--------|
| Auth | Mock كامل (15 capability) | NotConnected | **لا** | CI فقط |
| Storage | Mock في الذاكرة | NotConnected | **لا** | CI فقط |
| Database | marker | NotConnected | **لا** | — |
| Notification / Email / Sms | Mock يسجّل فقط | NotConnected | **لا** | لا إرسال حقيقي |
| Payment | سجل نية فقط (ADR-0005) | NotConnected | **لا** | لا حركة أموال |
| Analytics / Maps / Search / Ai / Content | Mock | NotConnected | **لا** | Ai = advisory (ADR-0006) |

**لا يوجد مشروع Supabase بعد.** كل الربط الحقيقي في **P18**.

---

## 2) عقد `AuthProvider` (15 capability)

```ts
readonly name: 'auth';
readonly mode: 'mock' | 'backend';
readonly channels: readonly ('email' | 'phone')[];
readonly capabilities: readonly string[];
healthCheck(): Promise<HealthCheckResult>;
```

| # | الدالة | المدخل | المخرج | ملاحظات |
|---|--------|--------|--------|---------|
| 1 | `signIn` | `SignInCredentials` | `Result<AuthSession>` | يقبل أي زوج غير فارغ لبريد مجهول (توافق P03). للحساب Known: يتحقق من الكلمة ويقفل بعد 5 إخفاقات. |
| 2 | `signOut` | — | `Result<void>` | يمسح الجلسة الحالية. |
| 3 | `getSession` | — | `Result<AuthSession \| null>` | مصدر الحقيقة للـGate عبر Query. |
| 4 | `refreshSession` | — | `Result<AuthSession \| null>` | يمدد الصلاحية ويحدّث `lastSeenAt`. |
| 5 | `signUp` | `SignUpInput` | `Result<AuthSession>` | ينشئ مستخدماً غير موثّق + موافقات بنسخ + تحدي تحقق. |
| 6 | `requestVerification` | `{channel,target}` | `Result<AuthChallenge>` | كولداون 30 ثانية لكل هدف. |
| 7 | `verify` | `{code,challengeId?}` | `Result<AuthSession>` | 5 محاولات كحد أقصى؛ يزيل `pendingVerification`. |
| 8 | `requestPasswordReset` | `{email}` | `Result<AuthChallenge>` | **منع تعداد**: يصدر تحدياً سواء وُجد الحساب أم لا. |
| 9 | `resetPassword` | `{challengeId,code,password}` | `Result<void>` | يفشل بـ`ACCOUNT_NOT_FOUND` إن لم يوجد الحساب. |
| 10 | `changePassword` | `{currentPassword,newPassword}` | `Result<void>` | **إعادة مصادقة داخلية** + تحقق Zod للكلمة الجديدة. |
| 11 | `listSessions` | — | `Result<readonly AuthSessionInfo[]>` | جلسات المستخدم الحالي، واحدة `current`. |
| 12 | `revokeSession` | `sessionId` | `Result<void>` | إنهاء الجلسة الحالية يصفّر الجلسة. |
| 13 | `requestAccountDeletion` | `{password}` | `Result<AccountDeletionRequest>` | إعادة مصادقة + جدولة بفترة تأكيد. |
| 14 | `cancelAccountDeletion` | — | `Result<void>` | `NO_DELETION_REQUEST` إن لم يوجد طلب. |
| 15 | `exportAccountData` | — | `Result<AccountExport>` | **بلا كلمات مرور أو توكنات** (مُختبَر). |

### الأنواع الأساسية

```ts
interface AuthUser {
  id; email: string|null; phone: string|null; displayName;
  dataOrigin: 'real'|'demo'; createdAt: string;
  roles?: readonly AuthRole[];        // اختياري — deny-by-default
  consents?: readonly AuthConsent[];  // {docId, version, acceptedAt}
}
interface AuthSession {
  user: AuthUser; expiresAt: string;
  tokens?: { accessToken; refreshToken; expiresAt };
  pendingVerification?: { channel; target; challengeId?; demoCode? } | null;
}
interface AuthSessionInfo { id; deviceLabel; createdAt; lastSeenAt; current: boolean }
interface AccountDeletionRequest {
  requestedAt; scheduledFor; gracePeriodDays;
  status: 'pending'|'cancelled';
  policyStatus: 'pending-human-approval';
}
```

**الأدوار (14):** guest · member · applicant · donor · partner_owner · ambassador · volunteer · reviewer · moderator · partner_verifier · finance_officer · content_editor · admin · auditor.
**أدوار الفريق (`STAFF_ROLES`):** reviewer · moderator · partner_verifier · finance_officer · content_editor · admin · auditor. نية التسجيل-self-declared **ليست** دور فريق.

### القنوات
`channels` للمزوّد التجريبي = **`['email']` فقط**. لا افتراض لـSMS؛ حقل الهاتف لا يُعرض. الهاتف يُفعَّل عند وجود مزوّد SMS حقيقي (P18+).

### أكواد الأخطاء (`AppError.meta.code`)
`EMPTY_CREDENTIALS` · `INVALID_CREDENTIALS` · `AUTH_TOO_MANY_ATTEMPTS` · `EMAIL_TAKEN` · `OTP_INVALID` · `OTP_EXPIRED` · `OTP_MAX_ATTEMPTS` · `OTP_RESEND_COOLDOWN` · `NO_PENDING_VERIFICATION` · `CHALLENGE_NOT_FOUND` · `ACCOUNT_NOT_FOUND` · `NO_SESSION` · `SESSION_NOT_FOUND` · `NO_DELETION_REQUEST` · `BIOMETRIC_FAILED` · `PROVIDER_NOT_CONNECTED`.
العرض عبر `authErrorKey()` → `auth:codes.*` أو `errors:<kind>`.

---

## 3) التوكنات والجلسة

| الجانب | التنفيذ الحالي | P18 |
|--------|----------------|-----|
| تخزين refresh | `expo-secure-store` (`WHEN_UNLOCKED`) على الجهاز | كما هو |
| الويب | **ذاكرة فقط** — لا تخزين دائم (ADR-0017) | يُراجع مع سياسة الويب |
| القراءة في الواجهة | TanStack Query بمفتاح `['auth','session',mode]` | كما هو |
| التجديد | مؤقّت مجدول عند وجود توكنات (هامش 60s) | ربط بـSupabase refresh |
| الاستعادة عند الإقلاع | **غير منفَّذة** (§8 #35) | تُنفَّذ في P18 |
| المسح عند الخروج | `vault.clear()` + `queryClient.clear()` | كما هو |

**ممنوع:** توكنات في Zustand · في AsyncStorage · في الروابط · في السجلات · في ملف التصدير.

---

## 4) `FileStorageProvider`

```ts
uploadFile(localUri, { contentType?, path? }): Promise<Result<UploadedFile>>
deleteFile(fileId): Promise<Result<void>>
getPublicUrl(fileId): Promise<Result<string>>
```
- يُستخدم فعلياً في رفع صورة Avatar (`contentType: 'image/jpeg'`).
- Mock يحفظ في الذاكرة ويعيد `memory://<id>` بـ`dataOrigin='demo'`.
- **رابط الصورة يبقى في Query cache فقط** حتى يضيف P18 عموداً دائماً (§8 #26).

---

## 5) وحدات حدود SDK (ADR-0022)

كل استدعاء لحزمة Expo أصلية محصور في ملف واحد ليسهل استبداله إذا اختلفت الواجهة المثبتة:

| الوحدة | الحزمة | الواجهة المستخدمة فعلياً |
|--------|--------|--------------------------|
| `features/auth/token-vault.ts` | expo-secure-store | `setItemAsync/getItemAsync/deleteItemAsync/WHEN_UNLOCKED` |
| `features/profile/image-pipeline.ts` | expo-image-picker · expo-image-manipulator | `launchImageLibraryAsync` · **`manipulateAsync`** (الكلاسيكية) |
| `features/settings/biometric.ts` | expo-local-authentication | `hasHardwareAsync/isEnrolledAsync/authenticateAsync` |
| `features/settings/export-file.ts` | expo-file-system · expo-sharing | **`File`/`Paths`** (الصنفية) · `isAvailableAsync/shareAsync` |

**سجل الانحرافات الفعلية:**
1. `expo-image-manipulator`: الواجهة الكائنية غير موجودة ⇒ استُخدمت `manipulateAsync`.
2. `expo-file-system`: الواجهة الكلاسيكية في `/legacy` ⇒ استُخدمت `new File(Paths.document, name)` + `create({overwrite:true})` + `write()` + `uri`.

**الدرس:** لا تُشتق واجهة حزمة من إرشاد سابق؛ تحقّق من المثبت أو اعزل الاستدعاء.

---

## 6) التصدير والخصوصية

`AccountExport` + `Profile` + التفضيلات المحلية ⇒ مستند JSON (`schemaVersion: 1`).
- **لا يحتوي:** كلمات مرور، توكنات، بيانات مستخدمين آخرين.
- الجهاز: كتابة في `Paths.document` ثم مشاركة عبر `Sharing` (أو حفظ فقط إن المشاركة غير متاحة).
- الويب: Blob + تنزيل.
- الاختبارات تؤكد غياب `accessToken`/`refreshToken`/`password` من النص المُسلسل.

---

## 7) خطة P18 (Supabase)

| البند | المطلوب |
|-------|---------|
| Auth | استبدال Mock بـSupabase Auth مع **نفس التواقيع** (لا تغيير عقد) |
| الأدوار | جدول roles + RLS؛ الأدوار تُقرأ من الجلسة لا من العميل |
| الجلسات | أجهزة حقيقية + إنهاء عن بُعد |
| الحذف | مهمة خادم تنفّذ المسح بعد فترة التأكيد المعتمدة + تجهيل السجلات المالية |
| الصورة | عمود دائم لرابط/معرّف الصورة + Storage حقيقي |
| الاستعادة | قراءة refresh من SecureStore عند الإقلاع |
| Repositories | 16 adapter بدل mocks + pgTAP |
| Legal | نصوص معتمدة قانونياً بنسخ نهائية |

**قاعدة ثابتة:** لا `service_role` في العميل، ولا أسرار في المستودع.
