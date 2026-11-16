// Auth schemas (P06.1). Messages are i18n keys, never literal UI text.
// Uses only regex/refine so the code is valid on both zod v3 and v4.
import { z } from 'zod';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const CODE_RE = /^\d{6}$/;

export const AuthEmailSchema = z
  .string()
  .trim()
  .min(1, 'auth:validation.emailRequired')
  .max(254, 'auth:validation.emailMax')
  .regex(EMAIL_RE, 'auth:validation.emailInvalid');

export const AuthPasswordSchema = z
  .string()
  .min(8, 'auth:validation.passwordMin')
  .max(72, 'auth:validation.passwordMax');

export const NewPasswordSchema = AuthPasswordSchema.refine(
  (value) => /[A-Za-z]/.test(value) && /\d/.test(value),
  'auth:validation.passwordWeak',
);

export const DisplayNameSchema = z
  .string()
  .trim()
  .min(2, 'auth:validation.displayNameMin')
  .max(60, 'auth:validation.displayNameMax');

export const OtpCodeSchema = z.string().regex(CODE_RE, 'auth:validation.codeInvalid');

export const RoleIntentSchema = z.enum(['applicant', 'donor', 'partner_owner', 'volunteer']);

const ConsentSchema = z.boolean().refine((v) => v === true, 'auth:validation.consentRequired');

export const SignInSchema = z.object({
  email: AuthEmailSchema,
  password: z.string().min(1, 'auth:validation.passwordRequired'),
});

export const SignUpSchema = z.object({
  displayName: DisplayNameSchema,
  email: AuthEmailSchema,
  password: NewPasswordSchema,
  roleIntent: RoleIntentSchema,
  acceptTerms: ConsentSchema,
  acceptPrivacy: ConsentSchema,
});

export const VerifySchema = z.object({ code: OtpCodeSchema });

export const ForgotPasswordSchema = z.object({ email: AuthEmailSchema });

export const ResetPasswordSchema = z
  .object({
    code: OtpCodeSchema,
    password: NewPasswordSchema,
    confirm: z.string().min(1, 'auth:validation.passwordRequired'),
  })
  .refine((data) => data.password === data.confirm, {
    message: 'auth:validation.passwordMismatch',
    path: ['confirm'],
  });

export type SignInFormValues = z.infer<typeof SignInSchema>;
export type SignUpFormValues = z.infer<typeof SignUpSchema>;
export type VerifyFormValues = z.infer<typeof VerifySchema>;
export type ForgotPasswordFormValues = z.infer<typeof ForgotPasswordSchema>;
export type ResetPasswordFormValues = z.infer<typeof ResetPasswordSchema>;
export type RoleIntent = z.infer<typeof RoleIntentSchema>;

/** Pure password strength score (0..4). No library, honest heuristic. */
export function scorePassword(value: string): number {
  if (value.length === 0) return 0;
  let score = 0;
  if (value.length >= 8) score += 1;
  if (value.length >= 12) score += 1;
  if (/[A-Za-z]/.test(value) && /\d/.test(value)) score += 1;
  if (/[^A-Za-z0-9]/.test(value)) score += 1;
  return Math.min(4, score);
}
