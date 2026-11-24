import { z } from 'zod';
import { DataOriginSchema, IdSchema, IsoDateSchema } from './common';

export const OfferStatusSchema = z.enum([
  'draft',
  'active',
  'expired',
  'in_review',
  'approved',
  'rejected',
  'cancelled',
]);

export const DiscountTypeSchema = z.enum(['percent', 'fixed', 'gift', 'service']);
export const OfferAudienceSchema = z.enum(['everyone', 'beneficiaries', 'engaged']);

const optionalId = IdSchema.nullable().optional();
const optionalText = z.string().min(1).max(2000).nullable().optional();

export const OfferSchema = z.object({
  id: IdSchema,
  partnerId: IdSchema,
  titleKey: z.string().min(1),
  discountPercent: z.number().int().min(0).max(100),
  status: OfferStatusSchema,
  createdAt: IsoDateSchema,
  updatedAt: IsoDateSchema,
  dataOrigin: DataOriginSchema,
  title: z.string().min(1).max(200).nullable().optional(),
  discountType: DiscountTypeSchema.optional(),
  discountValue: z.number().int().nonnegative().nullable().optional(),
  discountPlaceholder: z.boolean().optional(),
  audience: OfferAudienceSchema.optional(),
  products: z.array(z.string().min(1).max(120)).max(20).optional(),
  terms: optionalText,
  validFrom: IsoDateSchema.nullable().optional(),
  validUntil: IsoDateSchema.nullable().optional(),
  imageFileIds: z.array(IdSchema).max(8).optional(),
  category: z.string().min(1).max(100).nullable().optional(),
  governorateId: optionalId,
  rejectionReasonKey: optionalId,
  publishedAt: IsoDateSchema.nullable().optional(),
  reviewRequestedAt: IsoDateSchema.nullable().optional(),
});

export const CreateOfferInputSchema = z.object({
  partnerId: IdSchema,
  titleKey: z.string().min(1),
  discountPercent: z.number().int().min(0).max(100),
  title: z.string().min(1).max(200).nullable().optional(),
  discountType: DiscountTypeSchema.optional(),
  discountValue: z.number().int().nonnegative().nullable().optional(),
  discountPlaceholder: z.boolean().optional(),
  audience: OfferAudienceSchema.optional(),
  products: z.array(z.string().min(1).max(120)).max(20).optional(),
  terms: optionalText,
  validFrom: IsoDateSchema.nullable().optional(),
  validUntil: IsoDateSchema.nullable().optional(),
  imageFileIds: z.array(IdSchema).max(8).optional(),
  category: z.string().min(1).max(100).nullable().optional(),
  governorateId: optionalId,
});

export const UpdateOfferInputSchema = z.object({
  titleKey: z.string().min(1).optional(),
  discountPercent: z.number().int().min(0).max(100).optional(),
  status: OfferStatusSchema.optional(),
  title: z.string().min(1).max(200).nullable().optional(),
  discountType: DiscountTypeSchema.optional(),
  discountValue: z.number().int().nonnegative().nullable().optional(),
  discountPlaceholder: z.boolean().optional(),
  audience: OfferAudienceSchema.optional(),
  products: z.array(z.string().min(1).max(120)).max(20).optional(),
  terms: optionalText,
  validFrom: IsoDateSchema.nullable().optional(),
  validUntil: IsoDateSchema.nullable().optional(),
  imageFileIds: z.array(IdSchema).max(8).optional(),
  category: z.string().min(1).max(100).nullable().optional(),
  governorateId: optionalId,
  rejectionReasonKey: optionalId,
  publishedAt: IsoDateSchema.nullable().optional(),
  reviewRequestedAt: IsoDateSchema.nullable().optional(),
});
