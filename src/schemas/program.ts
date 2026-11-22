import { z } from 'zod';
import { CurrencySchema, DataOriginSchema, IdSchema, IsoDateSchema } from './common';

export const ProgramStatusSchema = z.enum(['draft', 'open', 'closed', 'archived']);

/** P09.1 (D-2): additive optional taxonomy. */
export const ProgramKindSchema = z.enum([
  'grant',
  'partial',
  'qard_hasan',
  'in_kind',
  'donor_contribution',
]);

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
  kind: ProgramKindSchema.optional(),
});

export const CreateProgramInputSchema = z.object({
  nameKey: z.string().min(1),
  descriptionKey: z.string().min(1),
  status: ProgramStatusSchema.default('draft'),
  minAmount: z.number().nonnegative(),
  maxAmount: z.number().nonnegative(),
  kind: ProgramKindSchema.optional(),
});

export const UpdateProgramInputSchema = z.object({
  nameKey: z.string().min(1).optional(),
  descriptionKey: z.string().min(1).optional(),
  status: ProgramStatusSchema.optional(),
  minAmount: z.number().nonnegative().optional(),
  maxAmount: z.number().nonnegative().optional(),
  kind: ProgramKindSchema.optional(),
});
