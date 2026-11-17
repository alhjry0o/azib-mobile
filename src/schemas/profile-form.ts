// Profile edit form schema (P06.2). Messages are i18n keys.
// Reuses the existing enums from ./profile — no duplication, no contract change.
import { z } from 'zod';
import { MaritalStatusSchema, ProfileGenderSchema } from './profile';

export const ProfileFormSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(2, 'profile:validation.displayNameMin')
    .max(60, 'profile:validation.displayNameMax'),
  gender: ProfileGenderSchema,
  maritalStatus: MaritalStatusSchema,
  governorateId: z.string().min(1, 'profile:validation.governorateRequired'),
  districtId: z.string().min(1, 'profile:validation.districtRequired'),
  areaId: z.string().nullable(),
});

export type ProfileFormValues = z.infer<typeof ProfileFormSchema>;
