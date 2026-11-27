import { z } from 'zod';
import { IdSchema, IsoDateSchema } from '@/schemas/common';
import {
  JobApplicationMethodSchema,
  JobScheduleSchema,
  JobWorkTypeSchema,
} from '@/schemas/job';
import { JOB_CATEGORIES } from '../state/filters';

const Money = z.number().int().nonnegative();

export const JobDraftSchema = z
  .object({
    title: z.string().trim().min(3, 'jobs:validation.title').max(200),
    publisherName: z.string().trim().min(2, 'jobs:validation.publisherName').max(200),
    category: z.enum(JOB_CATEGORIES),
    description: z.string().trim().min(20, 'jobs:validation.description').max(2000),
    governorateId: IdSchema,
    districtId: IdSchema.nullable(),
    workType: JobWorkTypeSchema,
    schedule: JobScheduleSchema,
    salaryMin: Money.nullable(),
    salaryMax: Money.nullable(),
    requirements: z.array(z.string().trim().min(1).max(200)).max(12),
    applicationMethod: JobApplicationMethodSchema,
    applicationInstructions: z.string().trim().max(2000).nullable(),
    deadline: IsoDateSchema.nullable(),
    publisherTermsAccepted: z.boolean().refine((v) => v, 'jobs:validation.publisherTerms'),
  })
  .refine(
    (v) => v.salaryMin === null || v.salaryMax === null || v.salaryMax >= v.salaryMin,
    { message: 'jobs:validation.salaryRange', path: ['salaryMax'] },
  );

export const JobApplicationSchema = z.object({
  headline: z.string().trim().min(3, 'jobs:validation.headline').max(200),
  message: z.string().trim().min(20, 'jobs:validation.message').max(1000),
});

export const JobReportSchema = z.object({
  jobId: IdSchema,
  reasonKey: z.string().min(1, 'jobs:validation.reportReason'),
  detail: z.string().trim().min(10, 'jobs:validation.reportDetail').max(1000),
});

export type JobDraftValues = z.infer<typeof JobDraftSchema>;
export type JobApplicationValues = z.infer<typeof JobApplicationSchema>;
export type JobReportValues = z.infer<typeof JobReportSchema>;
