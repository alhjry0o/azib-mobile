import { z } from 'zod';
import { DataOriginSchema, IdSchema, IsoDateSchema } from './common';

export const PartnerStatusSchema = z.enum([
  'draft',
  'verified',
  'suspended',
  'pending_verification',
  'rejected',
  'expired',
]);

const optionalId = IdSchema.nullable().optional();
const optionalText = z.string().min(1).max(1000).nullable().optional();
const optionalPhone = z.string().min(1).max(30).nullable().optional();
const optionalCoords = z.number().finite().nullable().optional();

export const PartnerSchema = z.object({
  id: IdSchema,
  displayName: z.string().min(1).max(200),
  category: z.string().min(1).max(100),
  status: PartnerStatusSchema,
  createdAt: IsoDateSchema,
  updatedAt: IsoDateSchema,
  dataOrigin: DataOriginSchema,
  ownerId: optionalId,
  description: optionalText,
  governorateId: optionalId,
  districtId: optionalId,
  city: z.string().min(1).max(100).nullable().optional(),
  contactPhone: optionalPhone,
  whatsapp: optionalPhone,
  imageFileIds: z.array(IdSchema).max(8).optional(),
  termsAcceptedAt: IsoDateSchema.nullable().optional(),
  verificationId: optionalId,
  verifiedAt: IsoDateSchema.nullable().optional(),
  reverifyAfter: IsoDateSchema.nullable().optional(),
  rejectionReasonKey: optionalId,
  suspensionReasonKey: optionalId,
  latitude: optionalCoords,
  longitude: optionalCoords,
});

export const CreatePartnerInputSchema = z.object({
  displayName: z.string().min(1).max(200),
  category: z.string().min(1).max(100),
  ownerId: optionalId,
  description: optionalText,
  governorateId: optionalId,
  districtId: optionalId,
  city: z.string().min(1).max(100).nullable().optional(),
  contactPhone: optionalPhone,
  whatsapp: optionalPhone,
  imageFileIds: z.array(IdSchema).max(8).optional(),
  termsAcceptedAt: IsoDateSchema.nullable().optional(),
  latitude: optionalCoords,
  longitude: optionalCoords,
});

export const UpdatePartnerInputSchema = z.object({
  displayName: z.string().min(1).max(200).optional(),
  category: z.string().min(1).max(100).optional(),
  status: PartnerStatusSchema.optional(),
  ownerId: optionalId,
  description: optionalText,
  governorateId: optionalId,
  districtId: optionalId,
  city: z.string().min(1).max(100).nullable().optional(),
  contactPhone: optionalPhone,
  whatsapp: optionalPhone,
  imageFileIds: z.array(IdSchema).max(8).optional(),
  termsAcceptedAt: IsoDateSchema.nullable().optional(),
  verificationId: optionalId,
  verifiedAt: IsoDateSchema.nullable().optional(),
  reverifyAfter: IsoDateSchema.nullable().optional(),
  rejectionReasonKey: optionalId,
  suspensionReasonKey: optionalId,
  latitude: optionalCoords,
  longitude: optionalCoords,
});
