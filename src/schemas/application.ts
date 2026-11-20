import { z } from 'zod';
import {
  AdvisoryEvaluationSchema,
  AppealRecordSchema,
  ApplicationPayloadSchema,
  InfoRequestSchema,
  PublicationConsentRecordSchema,
  ReviewDecisionSchema,
} from './application-payload';
import { CurrencySchema, DataOriginSchema, IdSchema, IsoDateSchema } from './common';

// P08.1 extends the union additively. 'reviewing' and 'disbursed' are legacy
// values kept readable so P03 contract tests and P17 keep working.
export const ApplicationStatusSchema = z.enum([
  'draft',
  'submitted',
  'reviewing',
  'approved',
  'rejected',
  'disbursed',
  'in_review',
  'info_requested',
  'appealed',
  'appeal_resolved',
  'disbursing',
  'completed',
  'cancelled',
]);

export const ApplicationSchema = z.object({
  id: IdSchema,
  applicantId: IdSchema,
  programId: IdSchema,
  status: ApplicationStatusSchema,
  requestedAmount: z.number().nonnegative(),
  currency: CurrencySchema,
  notes: z.string().max(1000).nullable(),
  reviewerNote: z.string().max(1000).nullable(),
  createdAt: IsoDateSchema,
  updatedAt: IsoDateSchema,
  dataOrigin: DataOriginSchema,
  referenceNumber: z.string().max(40).nullable().optional(),
  submittedAt: IsoDateSchema.nullable().optional(),
  payload: ApplicationPayloadSchema.nullable().optional(),
  evaluation: AdvisoryEvaluationSchema.nullable().optional(),
  infoRequest: InfoRequestSchema.nullable().optional(),
  decision: ReviewDecisionSchema.nullable().optional(),
  appeal: AppealRecordSchema.nullable().optional(),
  publicationConsent: PublicationConsentRecordSchema.nullable().optional(),
});

export const CreateApplicationInputSchema = z.object({
  applicantId: IdSchema,
  programId: IdSchema,
  requestedAmount: z.number().nonnegative(),
  notes: z.string().max(1000).nullable().optional(),
  payload: ApplicationPayloadSchema.optional(),
});

/** Applicant-editable fields + workflow metadata. Status is NOT patchable here. */
export const UpdateApplicationInputSchema = z.object({
  requestedAmount: z.number().nonnegative().optional(),
  notes: z.string().max(1000).nullable().optional(),
  payload: ApplicationPayloadSchema.optional(),
  evaluation: AdvisoryEvaluationSchema.nullable().optional(),
  infoRequest: InfoRequestSchema.nullable().optional(),
  decision: ReviewDecisionSchema.nullable().optional(),
  appeal: AppealRecordSchema.nullable().optional(),
  publicationConsent: PublicationConsentRecordSchema.nullable().optional(),
});

export const ApplicationListQuerySchema = z.object({
  limit: z.number().int().positive().optional(),
  offset: z.number().int().nonnegative().optional(),
  status: ApplicationStatusSchema.optional(),
  programId: IdSchema.optional(),
  applicantId: IdSchema.optional(),
});
