import { z } from 'zod';
import { DataOriginSchema, IdSchema, IsoDateSchema } from './common';

export const WeddingStatusSchema = z.enum([
  'draft',
  'open',
  'closed',
  'completed',
  'planning',
  'agreed',
  'cancelled',
]);

const optionalId = IdSchema.nullable().optional();
const optionalKey = z.string().min(1).max(200).nullable().optional();
const optionalText = z.string().min(1).max(200).nullable().optional();

export const WeddingSchema = z.object({
  id: IdSchema,
  titleKey: z.string().min(1),
  scheduledDate: IsoDateSchema,
  capacity: z.number().int().positive(),
  status: WeddingStatusSchema,
  createdAt: IsoDateSchema,
  updatedAt: IsoDateSchema,
  dataOrigin: DataOriginSchema,
  title: optionalText,
  description: z.string().min(1).max(1000).nullable().optional(),
  organizerId: optionalId,
  coOrganizerIds: z.array(IdSchema).max(4).optional(),
  governorateId: optionalId,
  districtId: optionalId,
  city: optionalText,
  alternateDate: IsoDateSchema.nullable().optional(),
  targetCount: z.number().int().positive().nullable().optional(),
  descriptionKey: optionalKey,
  withdrawalPolicyVersion: optionalKey,
  maxGroupSize: z.number().int().positive().nullable().optional(),
  budgetVersion: z.number().int().positive().nullable().optional(),
  agreementId: optionalId,
  cancellationReasonKey: optionalKey,
});

export const CreateWeddingInputSchema = z.object({
  titleKey: z.string().min(1),
  scheduledDate: IsoDateSchema,
  capacity: z.number().int().positive(),
  title: optionalText,
  description: z.string().min(1).max(1000).nullable().optional(),
  organizerId: optionalId,
  coOrganizerIds: z.array(IdSchema).max(4).optional(),
  governorateId: optionalId,
  districtId: optionalId,
  city: optionalText,
  alternateDate: IsoDateSchema.nullable().optional(),
  targetCount: z.number().int().positive().nullable().optional(),
  descriptionKey: optionalKey,
  withdrawalPolicyVersion: optionalKey,
  maxGroupSize: z.number().int().positive().nullable().optional(),
});

export const UpdateWeddingInputSchema = z.object({
  titleKey: z.string().min(1).optional(),
  scheduledDate: IsoDateSchema.optional(),
  capacity: z.number().int().positive().optional(),
  status: WeddingStatusSchema.optional(),
  title: optionalText,
  description: z.string().min(1).max(1000).nullable().optional(),
  organizerId: optionalId,
  coOrganizerIds: z.array(IdSchema).max(4).optional(),
  governorateId: optionalId,
  districtId: optionalId,
  city: optionalText,
  alternateDate: IsoDateSchema.nullable().optional(),
  targetCount: z.number().int().positive().nullable().optional(),
  descriptionKey: optionalKey,
  withdrawalPolicyVersion: optionalKey,
  maxGroupSize: z.number().int().positive().nullable().optional(),
  budgetVersion: z.number().int().positive().nullable().optional(),
  agreementId: optionalId,
  cancellationReasonKey: optionalKey,
});
