import { z } from 'zod';

import { DataOriginSchema, IdSchema, IsoDateSchema } from './common';

export const SoukStatusSchema = z.enum(['available', 'reserved', 'claimed']);

export const SoukItemSchema = z.object({
  id: IdSchema,
  titleKey: z.string().min(1),
  category: z.string().min(1).max(100),
  status: SoukStatusSchema,
  createdAt: IsoDateSchema,
  updatedAt: IsoDateSchema,
  dataOrigin: DataOriginSchema,
});

export const CreateSoukItemInputSchema = z.object({
  titleKey: z.string().min(1),
  category: z.string().min(1).max(100),
});

export const UpdateSoukItemInputSchema = z.object({
  titleKey: z.string().min(1).optional(),
  category: z.string().min(1).max(100).optional(),
  status: SoukStatusSchema.optional(),
});
