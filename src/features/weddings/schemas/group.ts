import { z } from 'zod';
import { IdSchema, IsoDateSchema } from '@/schemas/common';
import { DEFAULT_MAX_GROUP_SIZE, MIN_GROUP_SIZE } from '../config/limits';

/** D-5: the ceiling is injected from system_settings, never hardcoded here. */
export function buildCreateGroupSchema(maxGroupSize: number) {
  return z.object({
    title: z.string().trim().min(3, 'weddings:validation.title').max(120),
    governorateId: IdSchema,
    districtId: IdSchema.nullable(),
    city: z.string().max(100).nullable(),
    scheduledDate: IsoDateSchema,
    alternateDate: IsoDateSchema.nullable(),
    targetCount: z
      .number()
      .int()
      .min(MIN_GROUP_SIZE, 'weddings:validation.targetCount')
      .max(maxGroupSize, 'weddings:validation.targetMax'),
    description: z.string().max(1000).nullable(),
    withdrawalConsent: z.boolean().refine((v) => v, 'weddings:validation.withdrawalConsent'),
  });
}

export const CreateGroupSchema = buildCreateGroupSchema(DEFAULT_MAX_GROUP_SIZE);

export const GroupBasicsSchema = z.object({
  title: z.string().trim().min(3, 'weddings:validation.title').max(120),
  governorateId: IdSchema,
  districtId: IdSchema.nullable(),
  city: z.string().max(100).nullable(),
});

export const GroupScheduleSchema = z.object({
  scheduledDate: IsoDateSchema,
  alternateDate: IsoDateSchema.nullable(),
  targetCount: z.number().int().min(MIN_GROUP_SIZE, 'weddings:validation.targetCount'),
});

export const JoinRequestSchema = z.object({
  message: z.string().trim().min(1, 'weddings:validation.message').max(300),
  displayNameConsent: z.boolean().refine((v) => v, 'weddings:validation.displayNameConsent'),
});

export const RejectReasonSchema = z.object({
  reasonKey: z.string().min(1, 'weddings:validation.reason'),
});

export const CancelGroupSchema = z.object({
  reasonKey: z.string().min(1, 'weddings:validation.reason'),
});

export type CreateGroupValues = z.infer<typeof CreateGroupSchema>;
export type JoinRequestValues = z.infer<typeof JoinRequestSchema>;
