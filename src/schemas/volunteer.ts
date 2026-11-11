import { z } from 'zod';

import { DataOriginSchema, IdSchema, IsoDateSchema } from './common';

export const VolunteerStatusSchema = z.enum(['active', 'inactive']);

export const VolunteerSchema = z.object({
  id: IdSchema,
  userId: IdSchema,
  skillKey: z.string().min(1),
  status: VolunteerStatusSchema,
  createdAt: IsoDateSchema,
  updatedAt: IsoDateSchema,
  dataOrigin: DataOriginSchema,
});

export const CreateVolunteerInputSchema = z.object({
  userId: IdSchema,
  skillKey: z.string().min(1),
});

export const UpdateVolunteerInputSchema = z.object({
  skillKey: z.string().min(1).optional(),
  status: VolunteerStatusSchema.optional(),
});
