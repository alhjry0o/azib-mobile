import { z } from 'zod';

import { DataOriginSchema, IdSchema, IsoDateSchema } from './common';

export const ProfileGenderSchema = z.enum(['male', 'female', 'unspecified']);
export const MaritalStatusSchema = z.enum([
  'single',
  'engaged',
  'married',
  'divorced',
  'widowed',
]);

export const ProfileSchema = z.object({
  id: IdSchema,
  userId: IdSchema,
  displayName: z.string().min(1).max(100),
  gender: ProfileGenderSchema,
  maritalStatus: MaritalStatusSchema,
  city: z.string().max(100).nullable(),
  phone: z.string().max(30).nullable(),
  createdAt: IsoDateSchema,
  updatedAt: IsoDateSchema,
  dataOrigin: DataOriginSchema,
});

export const CreateProfileInputSchema = z.object({
  userId: IdSchema,
  displayName: z.string().min(1).max(100),
  gender: ProfileGenderSchema,
  maritalStatus: MaritalStatusSchema,
  city: z.string().max(100).nullable().optional(),
  phone: z.string().max(30).nullable().optional(),
});

export const UpdateProfileInputSchema = z.object({
  displayName: z.string().min(1).max(100).optional(),
  gender: ProfileGenderSchema.optional(),
  maritalStatus: MaritalStatusSchema.optional(),
  city: z.string().max(100).nullable().optional(),
  phone: z.string().max(30).nullable().optional(),
});
