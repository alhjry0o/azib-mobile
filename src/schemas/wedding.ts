import { z } from 'zod';

import { DataOriginSchema, IdSchema, IsoDateSchema } from './common';

export const WeddingStatusSchema = z.enum(['draft', 'open', 'closed', 'completed']);

export const WeddingSchema = z.object({
  id: IdSchema,
  titleKey: z.string().min(1),
  scheduledDate: IsoDateSchema,
  capacity: z.number().int().positive(),
  status: WeddingStatusSchema,
  createdAt: IsoDateSchema,
  updatedAt: IsoDateSchema,
  dataOrigin: DataOriginSchema,
});

export const CreateWeddingInputSchema = z.object({
  titleKey: z.string().min(1),
  scheduledDate: IsoDateSchema,
  capacity: z.number().int().positive(),
});

export const UpdateWeddingInputSchema = z.object({
  titleKey: z.string().min(1).optional(),
  scheduledDate: IsoDateSchema.optional(),
  capacity: z.number().int().positive().optional(),
  status: WeddingStatusSchema.optional(),
});
