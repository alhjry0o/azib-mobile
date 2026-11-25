import { z } from 'zod';
import { IdSchema } from '@/schemas/common';
import { SoukConditionSchema, SoukDeliveryMethodSchema } from '@/schemas/souk';
import { SOUK_CATEGORIES } from '../state/filters';
import { DEFAULT_MAX_ITEM_IMAGES } from '../state/limits';

export function buildItemDraftSchema(maxImages: number) {
  return z.object({
    title: z.string().trim().min(3, 'marketplace:souk.validation.title').max(200),
    category: z.enum(SOUK_CATEGORIES),
    condition: SoukConditionSchema,
    description: z.string().trim().min(10, 'marketplace:souk.validation.description').max(2000),
    governorateId: IdSchema,
    districtId: IdSchema.nullable(),
    deliveryMethod: SoukDeliveryMethodSchema,
    imageFileIds: z.array(IdSchema).max(maxImages),
    imageFingerprints: z.array(z.string().min(1).max(200)).max(maxImages),
    /** Optional, stats only, never a price. */
    estimatedValue: z.number().int().nonnegative().nullable(),
    noResaleConsent: z.boolean().refine((v) => v, 'marketplace:souk.validation.noResale'),
  });
}

export const ItemDraftSchema = buildItemDraftSchema(DEFAULT_MAX_ITEM_IMAGES);

export const ItemReportSchema = z.object({
  itemId: IdSchema,
  targetKind: z.enum(['item', 'chat_message']),
  targetId: IdSchema,
  reasonKey: z.string().min(1, 'marketplace:souk.validation.reportReason'),
  detail: z.string().trim().min(10, 'marketplace:souk.validation.reportDetail').max(1000),
});

export type ItemDraftValues = z.infer<typeof ItemDraftSchema>;
export type ItemReportValues = z.infer<typeof ItemReportSchema>;
