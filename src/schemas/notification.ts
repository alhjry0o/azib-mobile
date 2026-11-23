import { z } from 'zod';
import { DataOriginSchema, IdSchema, IsoDateSchema } from './common';

export const InAppNotificationSchema = z.object({
  id: IdSchema,
  userId: IdSchema,
  titleKey: z.string().min(1).max(200),
  bodyKey: z.string().min(1).max(200),
  read: z.boolean(),
  createdAt: IsoDateSchema,
  updatedAt: IsoDateSchema,
  dataOrigin: DataOriginSchema,
});

export const CreateInAppNotificationInputSchema = z.object({
  userId: IdSchema,
  titleKey: z.string().min(1).max(200),
  bodyKey: z.string().min(1).max(200),
});
