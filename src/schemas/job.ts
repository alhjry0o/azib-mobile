import { z } from 'zod';

import { DataOriginSchema, IdSchema, IsoDateSchema } from './common';

export const JobStatusSchema = z.enum(['draft', 'open', 'closed']);

export const JobSchema = z.object({
  id: IdSchema,
  titleKey: z.string().min(1),
  partnerId: IdSchema,
  status: JobStatusSchema,
  createdAt: IsoDateSchema,
  updatedAt: IsoDateSchema,
  dataOrigin: DataOriginSchema,
});

export const CreateJobInputSchema = z.object({
  titleKey: z.string().min(1),
  partnerId: IdSchema,
});

export const UpdateJobInputSchema = z.object({
  titleKey: z.string().min(1).optional(),
  status: JobStatusSchema.optional(),
});
