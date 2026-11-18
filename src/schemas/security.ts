// Security schemas (P06.3). Messages are i18n keys, never literal UI text.
import { z } from 'zod';
import { NewPasswordSchema } from './auth';

/** Locale-independent confirmation word, shown to the user in the UI copy. */
export const DELETION_PHRASE = 'DELETE';

export const ChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'auth:validation.passwordRequired'),
    newPassword: NewPasswordSchema,
    confirm: z.string().min(1, 'auth:validation.passwordRequired'),
  })
  .refine((data) => data.newPassword === data.confirm, {
    message: 'auth:validation.passwordMismatch',
    path: ['confirm'],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'auth:validation.passwordSameAsOld',
    path: ['newPassword'],
  });

export const DeleteAccountSchema = z
  .object({
    password: z.string().min(1, 'auth:validation.passwordRequired'),
    phrase: z.string().trim().min(1, 'auth:validation.deletionPhraseRequired'),
    acknowledged: z.boolean().refine((v) => v === true, 'auth:validation.deletionAckRequired'),
  })
  .refine((data) => data.phrase === DELETION_PHRASE, {
    message: 'auth:validation.deletionPhraseMismatch',
    path: ['phrase'],
  });

export type ChangePasswordFormValues = z.infer<typeof ChangePasswordSchema>;
export type DeleteAccountFormValues = z.infer<typeof DeleteAccountSchema>;
