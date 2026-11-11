import { z } from 'zod';

import { CurrencySchema, DataOriginSchema, IdSchema, IsoDateSchema } from './common';

export const DisbursementStatusSchema = z.enum(['pending', 'confirmed']);

export const DisbursementSchema = z.object({
  id: IdSchema,
  applicationId: IdSchema,
  amount: z.number().positive(),
  currency: CurrencySchema,
  status: DisbursementStatusSchema,
  providerReference: z.string().max(200).nullable(),
  createdAt: IsoDateSchema,
  updatedAt: IsoDateSchema,
  dataOrigin: DataOriginSchema,
});

export const CreateDisbursementInputSchema = z.object({
  applicationId: IdSchema,
  amount: z.number().positive(),
});
