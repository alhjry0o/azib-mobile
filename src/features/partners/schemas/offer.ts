// Domain-level validation for offer submission and offer reports.
// Money/discount values are integers; validity is an ISO window.
import { z } from 'zod';
import { IdSchema, IsoDateSchema } from '@/schemas/common';
import { DiscountTypeSchema, OfferAudienceSchema } from '@/schemas/offer';
import { PARTNER_CATEGORIES } from '../lib/categories';

export const OfferDraftSchema = z
  .object({
    title: z.string().trim().min(3, 'marketplace:validation.title').max(200),
    category: z.enum(PARTNER_CATEGORIES),
    governorateId: IdSchema,
    discountType: DiscountTypeSchema,
    discountValue: z.number().int().nonnegative('marketplace:validation.discountValue'),
    audience: OfferAudienceSchema,
    products: z.array(z.string().trim().min(1).max(120)).max(20),
    terms: z.string().trim().max(2000).nullable(),
    validFrom: IsoDateSchema,
    validUntil: IsoDateSchema,
    imageFileIds: z.array(IdSchema).max(8),
  })
  .refine((v) => Date.parse(v.validUntil) > Date.parse(v.validFrom), {
    message: 'marketplace:validation.validityWindow',
    path: ['validUntil'],
  })
  .refine((v) => v.discountType !== 'percent' || v.discountValue <= 100, {
    message: 'marketplace:validation.percentRange',
    path: ['discountValue'],
  })
  .refine((v) => v.discountType === 'gift' || v.discountType === 'service' || v.discountValue > 0, {
    message: 'marketplace:validation.discountValue',
    path: ['discountValue'],
  });

export const OfferReportSchema = z.object({
  offerId: IdSchema,
  reasonKey: z.string().min(1, 'marketplace:validation.reportReason'),
  detail: z.string().trim().min(10, 'marketplace:validation.reportDetail').max(1000),
});

export type OfferDraftValues = z.infer<typeof OfferDraftSchema>;
export type OfferReportValues = z.infer<typeof OfferReportSchema>;
