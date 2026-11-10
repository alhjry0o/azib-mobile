import { z } from 'zod';

import { CurrencySchema, DataOriginSchema, IdSchema, IsoDateSchema } from './common';

export const ProgramStatusSchema = z.enum(['draft', 'open', 'closed', 'archived']);

export const ProgramSchema = z.object({
  id: IdSchema,
  nameKey: z.string().min(1),
  descriptionKey: z.string().min(1),
  status: ProgramStatusSchema,
  minAmount: z.number().nonnegative(),
  maxAmount: z.number().nonnegative(),
  currency: CurrencySchema,
  createdAt: IsoDateSchema,
  updatedAt: IsoDateSchema,
  dataOrigin: DataOriginSchema,
});

export const CreateProgramInputSchema = z.object({
  nameKey: z.string().min(1),
  descriptionKey: z.string().min(1),
  status: ProgramStatusSchema.default('draft'),
  minAmount: z.number().nonnegative(),
  maxAmount: z.number().nonnegative(),
});

export const UpdateProgramInputSchema = z.object({
  nameKey: z.string().min(1).optional(),
  descriptionKey: z.string().min(1).optional(),
  status: ProgramStatusSchema.optional(),
  minAmount: z.number().nonnegative().optional(),
  maxAmount: z.number().nonnegative().optional(),
});
