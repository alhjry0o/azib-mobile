import { z } from 'zod';
import { DataOriginSchema, IdSchema, IsoDateSchema } from './common';

// P12.1: union extended additively. 'claimed' stays valid (read-only alias).
export const SoukStatusSchema = z.enum([
  'available',
  'reserved',
  'claimed',
  'draft',
  'pending_review',
  'handed_over',
  'withdrawn',
  'expired',
  'rejected',
]);

export const SoukConditionSchema = z.enum(['new', 'good', 'acceptable']);
export const SoukDeliveryMethodSchema = z.enum([
  'self_pickup',
  'donor_delivers',
  'volunteer_help',
]);

const optionalId = IdSchema.nullable().optional();
const optionalText = z.string().min(1).max(2000).nullable().optional();

export const SoukItemSchema = z.object({
  id: IdSchema,
  titleKey: z.string().min(1),
  category: z.string().min(1).max(100),
  status: SoukStatusSchema,
  createdAt: IsoDateSchema,
  updatedAt: IsoDateSchema,
  dataOrigin: DataOriginSchema,
  donorId: optionalId,
  title: z.string().min(1).max(200).nullable().optional(),
  description: optionalText,
  condition: SoukConditionSchema.optional(),
  governorateId: optionalId,
  districtId: optionalId,
  deliveryMethod: SoukDeliveryMethodSchema.optional(),
  imageFileIds: z.array(IdSchema).max(12).optional(),
  imageFingerprints: z.array(z.string().min(1).max(200)).max(12).optional(),
  estimatedValue: z.number().int().nonnegative().nullable().optional(),
  noResaleConsentAt: IsoDateSchema.nullable().optional(),
  reservedForRequestId: optionalId,
  expiresAt: IsoDateSchema.nullable().optional(),
  rejectionReasonKey: optionalId,
  duplicateFlag: z.boolean().optional(),
  saleWordFlag: z.boolean().optional(),
});

// titleKey + category remain the ONLY required fields (P03 contract).
export const CreateSoukItemInputSchema = z.object({
  titleKey: z.string().min(1),
  category: z.string().min(1).max(100),
  donorId: optionalId,
  title: z.string().min(1).max(200).nullable().optional(),
  description: optionalText,
  condition: SoukConditionSchema.optional(),
  governorateId: optionalId,
  districtId: optionalId,
  deliveryMethod: SoukDeliveryMethodSchema.optional(),
  imageFileIds: z.array(IdSchema).max(12).optional(),
  imageFingerprints: z.array(z.string().min(1).max(200)).max(12).optional(),
  estimatedValue: z.number().int().nonnegative().nullable().optional(),
  noResaleConsentAt: IsoDateSchema.nullable().optional(),
  expiresAt: IsoDateSchema.nullable().optional(),
});

export const UpdateSoukItemInputSchema = z.object({
  titleKey: z.string().min(1).optional(),
  category: z.string().min(1).max(100).optional(),
  status: SoukStatusSchema.optional(),
  donorId: optionalId,
  title: z.string().min(1).max(200).nullable().optional(),
  description: optionalText,
  condition: SoukConditionSchema.optional(),
  governorateId: optionalId,
  districtId: optionalId,
  deliveryMethod: SoukDeliveryMethodSchema.optional(),
  imageFileIds: z.array(IdSchema).max(12).optional(),
  imageFingerprints: z.array(z.string().min(1).max(200)).max(12).optional(),
  estimatedValue: z.number().int().nonnegative().nullable().optional(),
  noResaleConsentAt: IsoDateSchema.nullable().optional(),
  reservedForRequestId: optionalId,
  expiresAt: IsoDateSchema.nullable().optional(),
  rejectionReasonKey: optionalId,
  duplicateFlag: z.boolean().optional(),
  saleWordFlag: z.boolean().optional(),
});
