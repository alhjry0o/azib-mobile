import { z } from 'zod';
import { DataOriginSchema, IdSchema, IsoDateSchema } from './common';

export const JobStatusSchema = z.enum([
  'draft',
  'open',
  'closed',
  'pending_review',
  'expired',
  'rejected',
]);

export const JobWorkTypeSchema = z.enum(['daily', 'professional', 'freelance', 'internship']);
export const JobScheduleSchema = z.enum(['full_time', 'part_time', 'shifts', 'flexible']);
export const JobApplicationMethodSchema = z.enum(['in_app', 'external_instructions']);

const optionalId = IdSchema.nullable().optional();
const optionalText = z.string().min(1).max(2000).nullable().optional();
const optionalMoney = z.number().int().nonnegative().nullable().optional();
const optionalDate = IsoDateSchema.nullable().optional();

const sharedFields = {
  // RELAXED (P13.1): a publisher need not be a registered P11 partner.
  partnerId: optionalId,
  publisherId: optionalId,
  publisherName: z.string().min(1).max(200).nullable().optional(),
  publisherTermsAcceptedAt: optionalDate,
  title: z.string().min(1).max(200).nullable().optional(),
  description: optionalText,
  category: z.string().min(1).max(100).nullable().optional(),
  governorateId: optionalId,
  districtId: optionalId,
  workType: JobWorkTypeSchema.optional(),
  schedule: JobScheduleSchema.optional(),
  salaryMin: optionalMoney,
  salaryMax: optionalMoney,
  requirements: z.array(z.string().min(1).max(200)).max(12).optional(),
  applicationMethod: JobApplicationMethodSchema.optional(),
  applicationInstructions: optionalText,
  deadline: optionalDate,
  expiresAt: optionalDate,
};

export const JobSchema = z.object({
  id: IdSchema,
  titleKey: z.string().min(1),
  status: JobStatusSchema,
  createdAt: IsoDateSchema,
  updatedAt: IsoDateSchema,
  dataOrigin: DataOriginSchema,
  ...sharedFields,
  rejectionReasonKey: optionalId,
});

// titleKey stays the ONLY required field. partnerId '' still fails IdSchema.
export const CreateJobInputSchema = z.object({
  titleKey: z.string().min(1),
  status: JobStatusSchema.optional(),
  ...sharedFields,
});

export const UpdateJobInputSchema = z.object({
  titleKey: z.string().min(1).optional(),
  status: JobStatusSchema.optional(),
  ...sharedFields,
  rejectionReasonKey: optionalId,
});
