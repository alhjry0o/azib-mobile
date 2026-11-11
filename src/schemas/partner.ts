import { z } from 'zod';

import { DataOriginSchema, IdSchema, IsoDateSchema } from './common';

export const PartnerStatusSchema = z.enum(['draft', 'verified', 'suspended']);

export const PartnerSchema = z.object({
  id: IdSchema,
  displayName: z.string().min(1).max(200),
  category: z.string().min(1).max(100),
  status: PartnerStatusSchema,
  createdAt: IsoDateSchema,
  updatedAt: IsoDateSchema,
  dataOrigin: DataOriginSchema,
});

export const CreatePartnerInputSchema = z.object({
  displayName: z.string().min(1).max(200),
  category: z.string().min(1).max(100),
});

export const UpdatePartnerInputSchema = z.object({
  displayName: z.string().min(1).max(200).optional(),
  category: z.string().min(1).max(100).optional(),
  status: PartnerStatusSchema.optional(),
});
