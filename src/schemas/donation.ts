import { z } from 'zod';

import { CurrencySchema, DataOriginSchema, IdSchema, IsoDateSchema } from './common';

export const DonationStatusSchema = z.enum(['pending', 'confirmed', 'declined']);

export const DonationSchema = z.object({
  id: IdSchema,
  donorId: IdSchema,
  amount: z.number().positive(),
  currency: CurrencySchema,
  status: DonationStatusSchema,
  note: z.string().max(1000).nullable(),
  createdAt: IsoDateSchema,
  updatedAt: IsoDateSchema,
  dataOrigin: DataOriginSchema,
});

export const CreateDonationInputSchema = z.object({
  donorId: IdSchema,
  amount: z.number().positive(),
  note: z.string().max(1000).nullable().optional(),
});
