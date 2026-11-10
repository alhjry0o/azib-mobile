import { z } from 'zod';

import { CurrencySchema, DataOriginSchema, IdSchema, IsoDateSchema } from './common';

export const ApplicationStatusSchema = z.enum([
  'draft',
  'submitted',
  'reviewing',
  'approved',
  'rejected',
  'disbursed',
]);

export const ApplicationSchema = z.object({
  id: IdSchema,
  applicantId: IdSchema,
  programId: IdSchema,
  status: ApplicationStatusSchema,
  requestedAmount: z.number().nonnegative(),
  currency: CurrencySchema,
  notes: z.string().max(1000).nullable(),
  reviewerNote: z.string().max(1000).nullable(),
  createdAt: IsoDateSchema,
  updatedAt: IsoDateSchema,
  dataOrigin: DataOriginSchema,
});

export const CreateApplicationInputSchema = z.object({
  applicantId: IdSchema,
  programId: IdSchema,
  requestedAmount: z.number().nonnegative(),
  notes: z.string().max(1000).nullable().optional(),
});

export const ApplicationListQuerySchema = z.object({
  limit: z.number().int().positive().optional(),
  offset: z.number().int().nonnegative().optional(),
  status: ApplicationStatusSchema.optional(),
  programId: IdSchema.optional(),
  applicantId: IdSchema.optional(),
});
