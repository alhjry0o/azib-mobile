import { z } from 'zod';

import { DataOriginSchema, IdSchema, IsoDateSchema } from './common';

export const OfferStatusSchema = z.enum(['draft', 'active', 'expired']);

export const OfferSchema = z.object({
  id: IdSchema,
  partnerId: IdSchema,
  titleKey: z.string().min(1),
  discountPercent: z.number().int().min(0).max(100),
  status: OfferStatusSchema,
  createdAt: IsoDateSchema,
  updatedAt: IsoDateSchema,
  dataOrigin: DataOriginSchema,
});

export const CreateOfferInputSchema = z.object({
  partnerId: IdSchema,
  titleKey: z.string().min(1),
  discountPercent: z.number().int().min(0).max(100),
});

export const UpdateOfferInputSchema = z.object({
  titleKey: z.string().min(1).optional(),
  discountPercent: z.number().int().min(0).max(100).optional(),
  status: OfferStatusSchema.optional(),
});
