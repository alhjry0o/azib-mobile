import { z } from 'zod';
import { IdSchema, IsoDateSchema } from '@/schemas/common';

export const CreateGroupSchema = z.object({
  titleKey: z.string().min(1, 'weddings:validation.title'),
  governorateId: IdSchema,
  districtId: IdSchema.nullable(),
  city: z.string().max(100).nullable(),
  scheduledDate: IsoDateSchema,
  alternateDate: IsoDateSchema.nullable(),
  targetCount: z.number().int().min(2, 'weddings:validation.targetCount'),
  descriptionKey: z.string().max(200).nullable(),
  withdrawalConsent: z.boolean().refine((v) => v, 'weddings:validation.withdrawalConsent'),
});

export const JoinRequestSchema = z.object({
  message: z.string().trim().min(1, 'weddings:validation.message').max(300),
  displayNameConsent: z
    .boolean()
    .refine((v) => v, 'weddings:validation.displayNameConsent'),
});

export const RejectReasonSchema = z.object({
  reasonKey: z.string().min(1, 'weddings:validation.reason'),
});

export const CancelGroupSchema = z.object({
  reasonKey: z.string().min(1, 'weddings:validation.reason'),
});

export type CreateGroupValues = z.infer<typeof CreateGroupSchema>;
export type JoinRequestValues = z.infer<typeof JoinRequestSchema>;
