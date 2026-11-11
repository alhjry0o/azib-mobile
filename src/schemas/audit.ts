import { z } from 'zod';

import { DataOriginSchema, IdSchema, IsoDateSchema } from './common';

export const AuditEntrySchema = z.object({
  id: IdSchema,
  actorId: IdSchema,
  action: z.string().min(1).max(200),
  target: z.string().min(1).max(200),
  meta: z.record(z.string(), z.unknown()),
  createdAt: IsoDateSchema,
  updatedAt: IsoDateSchema,
  dataOrigin: DataOriginSchema,
});

export const CreateAuditEntryInputSchema = z.object({
  actorId: IdSchema,
  action: z.string().min(1).max(200),
  target: z.string().min(1).max(200),
  meta: z.record(z.string(), z.unknown()).optional(),
});
