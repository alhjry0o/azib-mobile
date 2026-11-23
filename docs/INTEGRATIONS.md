# INTEGRATIONS — عقود المزوّدين وحالة الربط

> أُنشئ في **P06**، وحُدّث في **P09** بتفصيل مزوّد الدفع ومتطلبات الربط.
> **عام المستودع:** لا أسرار، لا مفاتيح، لا بيانات شخصية.
> **قاعدة الصدق:** لا يُكتب «متصل» إلا بعد تشغيل فعلي على بيئة محددة مع ذكر من تحقق.

آخر تحديث: 2026-11-16 (إغلاق P09).

---

## 1) حالة الربط الفعلية

| المزوّد | demo | backend | متصل فعلياً؟ | التحقق |
|---------|------|---------|---------------|--------|
| Auth | Mock كامل (15 capability) | NotConnected | **لا** | CI فقط |
| Storage | Mock في الذاكرة | NotConnected | **لا** | CI فقط |
| **Payment** | **Demo Payment (دورة حياة النية)** | **NotConnected** | **لا** | CI فقط |
| Database | marker | NotConnected | **لا** | — |
| Notification / Email / Sms | Mock يسجّل فقط | NotConnected | **لا** | لا إرسال حقيقي |
| Analytics / Maps / Search / Ai / Content | Mock | NotConnected | **لا** | Ai = advisory (ADR-0006) |

**لا مشروع Supabase ولا مزوّد دفع مرخّص بعد.** كل الربط الحقيقي في **P18**.

---

## 2) عقد `AuthProvider` (15 capability)

| # | الدالة | المخرج | ملاحظات |
|---|--------|--------|---------|
| 1 | `signIn` | `Result<AuthSession>` | يقبل أي زوج غير فارغ لبريد مجهول؛ Known يتحقق ويقفل بعد 5 إخفاقات |
| 2 | `signOut` | `Result<void>` | يمسح الجلسة الحالية |
| 3 | `getSession` | `Result<AuthSession \| null>` | مصدر الحقيقة للـGate عبر Query |
| 4 | `refreshSession` | `Result<AuthSession \| null>` | يمدد الصلاحية ويحدّث `lastSeenAt` |
| 5 | `signUp` | `Result<AuthSession>` | مستخدم غير موثّق + موافقات بنسخ + تحدي |
| 6 | `requestVerification` | `Result<AuthChallenge>` | كولداون 30 ثانية |
| 7 | `verify` | `Result<AuthSession>` | 5 محاولات؛ يزيل `pendingVerification` |
| 8 | `requestPasswordReset` | `Result<AuthChallenge>` | منع تعداد |
| 9 | `resetPassword` | `Result<void>` | `ACCOUNT_NOT_FOUND` عند الغياب |
| 10 | `changePassword` | `Result<void>` | إعادة مصادقة داخلية |
| 11 | `listSessions` | `Result<readonly AuthSessionInfo[]>` | واحدة `current` |
| 12 | `revokeSession` | `Result<void>` | إنهاء الحالية يصفّر الجلسة |
| 13 | `requestAccountDeletion` | `Result<AccountDeletionRequest>` | إعادة مصادقة + جدولة |
| 14 | `cancelAccountDeletion` | `Result<void>` | `NO_DELETION_REQUEST` |
| 15 | `exportAccountData` | `Result<AccountExport>` | بلا كلمات مرور أو توكنات |

**القنوات:** `['email']` في demo — لا افتراض SMS.
**الأدوار (14)** و**أدوار الفريق (7)** كما في P06؛ نية التسجيل ليست دور فريق.

---

## 3) التوكنات والجلسة

| الجانب | الحالي | P18 |
|--------|--------|-----|
| تخزين refresh | SecureStore (`WHEN_UNLOCKED`) | كما هو |
| الويب | **ذاكرة فقط** (ADR-0017) | يُراجع |
| القراءة | Query بمفتاح `['auth','session',mode]` | كما هو |
| التجديد | مؤقّت بهامش 60s عند وجود توكنات | ربط بـSupabase |
| الاستعادة عند الإقلاع | **غير منفَّذة** (§8 #36) | تُنفَّذ |
| المسح عند الخروج | `vault.clear()` + `queryClient.clear()` | كما هو |

**ممنوع:** توكنات في Zustand/AsyncStorage/الروابط/السجلات/التصدير.

---

## 4) `FileStorageProvider`

```
uploadFile(localUri, { contentType?, path? }) → Result<UploadedFile>
deleteFile(fileId) → Result<void>
getPublicUrl(fileId) → Result<string>
```
- مستخدم فعلياً في صورة Avatar ومستندات الطلب.
- Mock يحفظ في الذاكرة ويعيد `memory://<id>` بـ`dataOrigin='demo'`.
- **لا callback تقدّم** ⇒ شريط غير محدد في الواجهة (لا نسبة وهمية).
- رابط الصورة يبقى في Query cache حتى P18 (§8 #27).

---

## 5) عقد `PaymentProvider` — Non-Custodial (ADR-0005)

### 5.1 المسموح والممنوع

| مسموح | ممنوع (بالغياب من العقد) |
|-------|--------------------------|
| `recordPledge(pledge)` | `charge` · `capture` · `refund` |
| `verifyExternalPayment(ref)` | `createIntent` · `createPaymentMethod` |
| — | أي метод يمسّ بيانات بطاقة/IBAN/رصيد |

`DonationPledge = { amount, currency:'YER', note? }`
`PledgeRecord = { id, amount, currency, status:'pending'|'confirmed'|'declined', createdAt, dataOrigin }`

### 5.2 المزوّد التجريبي (`providers/mock/demo-payment.ts`)

| العضو | السلوك |
|-------|--------|
| `recordPledge` | pledge بحالة `pending` + `dataOrigin='demo'`؛ يرفض صفر/سالب/كسري |
| `verifyExternalPayment(ref)` | السجل **فقط إن كان `confirmed`**، وإلا `null` — **لا يختلق تأكيداً** |
| `__confirmPledge(id)` | يمثّل callback الجهة المرخّصة (demo فقط) |
| `__declinePledge(id)` | رفض المزوّد (demo فقط) |
| `__pledges()` | قراءة داخلية |

- تسوية مكرّرة ⇒ `PLEDGE_ALREADY_SETTLED`.
- `isDemoPaymentProvider` type-guard؛ المحاكاة ترفض العمل مع مزوّد غير demo.
- الحاوية: demo ⇒ Demo Payment · backend ⇒ NotConnected.

### 5.3 متطلبات الربط بجهة مرخّصة (تُعرض في شاشة صادقة)

| # | المتطلب | الحالة |
|---|---------|--------|
| 1 | جهة دفع مرخّصة قانونياً + اتفاقية موقّعة | **غير مُنفَّذ** |
| 2 | اتفاقية استخدام (مسؤوليات/رسوم/استرجاع) | **غير مُنفَّذ** |
| 3 | مفاتيح المزوّد على الخادم فقط | **غير مُنفَّذ** |
| 4 | Webhook خادمي بتوقيع مُتحقَّق منه | **غير مُنفَّذ** |
| 5 | التحقق وكتابة `verified` خادمياً + تدقيق | **غير مُنفَّذ** |

حتى استيفائها: **لا تبرع حقيقي، لا إيصال رسمي**، وشاشة `Not Connected` تسرد المتطلبات (ADR-0034/0035).

### 5.4 خطة P18

1. Edge Function تستقبل Webhook المزوّد وتتحقق من التوقيع.
2. مطابقة `providerReference` بالنية، ثم كتابة `verified` + `verifiedAt` + `verifiedBy`.
3. توليد رقم إيصال رسمي (غير `AZIB-DEMO-*`).
4. انتقال ذرّي + قيد فريد على `idempotencyKey`.
5. HMAC على محتوى المستند بدل البصمة الوصفية.
6. لا مفاتيح في التطبيق ولا في المستودع — GitHub Secrets / `.env.local` فقط.

---

## 6) وحدات حدود SDK (ADR-0022)

| الوحدة | الحزمة | الواجهة المستخدمة فعلياً |
|--------|--------|--------------------------|
| `features/auth/token-vault.ts` | expo-secure-store | `setItemAsync/getItemAsync/deleteItemAsync/WHEN_UNLOCKED` |
| `features/profile/image-pipeline.ts` | expo-image-picker · manipulator | `launchImageLibraryAsync` · **`manipulateAsync`** |
| `features/settings/biometric.ts` | expo-local-authentication | `hasHardwareAsync/isEnrolledAsync/authenticateAsync` |
| `features/settings/export-file.ts` | expo-file-system · sharing | **`File`/`Paths`** · `isAvailableAsync/shareAsync` |
| `features/assistance/services/hash.ts` | expo-crypto | `digestStringAsync(SHA256, …)` |
| `features/assistance/services/document-pipeline.ts` | expo-document-picker · picker · manipulator | `getDocumentAsync` · `manipulateAsync` |

**سجل الانحرافات الفعلية:** (1) manipulator تُصدّر `manipulateAsync` لا الكائنية. (2) file-system تُصدّر الصنفية والكلاسيكية في `/legacy`.
**الدرس:** لا تُشتق واجهة من إرشاد سابق؛ تحقّق من المثبت أو اعزل الاستدعاء.

---

## 7) التصدير والخصوصية

`AccountExport` + `Profile` + التفضيلات ⇒ JSON (`schemaVersion: 1`).
- **لا يحتوي:** كلمات مرور، توكنات، بيانات مستخدمين آخرين.
- الجهاز: `Paths.document` ثم `Sharing` (أو حفظ فقط). الويب: Blob + تنزيل.
- الاختبارات تؤكد غياب `accessToken`/`refreshToken`/`password`.

---

## 8) سجل التدقيق المالي (P09)

`appendFinanceAudit` يكتب `actorId` · `action` · `target` (`donation:{id}` / `disbursement:{id}`) · `meta`限于 `from`/`to`.
**بلا مبالغ، بلا هويات متبرعين أو مستفيدين.** مُختبَر أن الميتاداتا لا تحوي المبلغ.
</parameter>
