import { z } from 'zod';
import { IdSchema } from '@/schemas/common';
import { PARTNER_CATEGORIES } from '../lib/categories';
import { MAX_PARTNER_IMAGES, MAX_VERIFICATION_DOCUMENTS } from '../config/limits';

export const PartnerRegistrationSchema = z.object({
  displayName: z.string().trim().min(3, 'marketplace:validation.businessName').max(200),
  category: z.enum(PARTNER_CATEGORIES),
  description: z.string().trim().min(10, 'marketplace:validation.description').max(1000),
  governorateId: IdSchema,
  districtId: IdSchema.nullable(),
  city: z.string().trim().max(100).nullable(),
  contactPhone: z.string().trim().min(1, 'marketplace:validation.phone'),
  whatsapp: z.string().trim().nullable(),
  imageFileIds: z.array(IdSchema).max(MAX_PARTNER_IMAGES),
  documentFileIds: z
    .array(IdSchema)
    .min(1, 'marketplace:validation.documents')
    .max(MAX_VERIFICATION_DOCUMENTS),
  termsAccepted: z.boolean().refine((v) => v, 'marketplace:validation.terms'),
});

export const AmbassadorApplySchema = z.object({
  governorateIds: z.array(IdSchema).min(1, 'marketplace:validation.regions').max(5),
  motivation: z.string().trim().min(20, 'marketplace:validation.motivation').max(1000),
});

export const AmbassadorTaskSubmitSchema = z
  .object({
    nominatedPartnerId: IdSchema.nullable(),
    photoFileIds: z.array(IdSchema).max(MAX_PARTNER_IMAGES),
  })
  .refine((v) => v.nominatedPartnerId !== null || v.photoFileIds.length > 0, {
    message: 'marketplace:validation.taskEvidence',
    path: ['photoFileIds'],
  });

export type PartnerRegistrationValues = z.infer<typeof PartnerRegistrationSchema>;
export type AmbassadorApplyValues = z.infer<typeof AmbassadorApplySchema>;
export type AmbassadorTaskSubmitValues = z.infer<typeof AmbassadorTaskSubmitSchema>;
