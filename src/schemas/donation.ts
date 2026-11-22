import { z } from 'zod';
import { CurrencySchema, DataOriginSchema, IdSchema, IsoDateSchema } from './common';

// P09.1: union extended additively; legacy values stay valid.
export const DonationStatusSchema = z.enum([
  'pending',
  'confirmed',
  'declined',
  'intent_created',
  'provider_pending',
  'provider_confirmed',
  'verified',
  'cancelled',
]);

export const DonationSchema = z.object({
  id: IdSchema,
  donorId: IdSchema,
  amount: z.number().int().positive(),
  currency: CurrencySchema,
  status: DonationStatusSchema,
  note: z.string().max(1000).nullable(),
  createdAt: IsoDateSchema,
  updatedAt: IsoDateSchema,
  dataOrigin: DataOriginSchema,
  programId: IdSchema.nullable().optional(),
  anonymous: z.boolean().optional(),
  idempotencyKey: z.string().min(1).max(120).nullable().optional(),
  providerReference: z.string().min(1).max(200).nullable().optional(),
  receiptNumber: z.string().min(1).max(60).nullable().optional(),
  verifiedAt: IsoDateSchema.nullable().optional(),
  verifiedBy: IdSchema.nullable().optional(),
});

export const CreateDonationInputSchema = z.object({
  donorId: IdSchema,
  amount: z.number().int().positive(),
  note: z.string().max(1000).nullable().optional(),
  programId: IdSchema.nullable().optional(),
  anonymous: z.boolean().optional(),
  idempotencyKey: z.string().min(1).max(120).nullable().optional(),
});
