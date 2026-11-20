// Assistance application payload + workflow records (P08.1).
// Data minimization: no other-party details, no raw national id / phone —
// only their hashes. Relatives' wealth and unreceived inheritance are
// recorded for context ONLY and are excluded from scoring (ADR-0006).
import { z } from 'zod';
import { IdSchema, IsoDateSchema } from './common';

const Money = z.number().int().nonnegative();
const Hash = z.string().min(16).max(128);

export const EmploymentStatusSchema = z.enum([
  'employed',
  'self_employed',
  'irregular',
  'unemployed',
]);
export const IncomeSourceSchema = z.enum(['salary', 'business', 'daily_wage', 'none']);
export const EngagementStatusSchema = z.enum(['official_engagement', 'serious_family_approval']);
export const EngagementProofTypeSchema = z.enum([
  'engagement_certificate',
  'family_letter',
  'guardian_statement',
]);
export const ApplicationDocumentKindSchema = z.enum([
  'identity',
  'income_proof',
  'engagement_proof',
  'other',
]);

export const ApplicantInfoSchema = z.object({
  governorateId: IdSchema,
  districtId: IdSchema.nullable(),
  birthYear: z.number().int().min(1900).max(2100),
  householdSize: z.number().int().min(1).max(30),
  identityHash: Hash,
  phoneHash: Hash,
});

export const IncomeInfoSchema = z.object({
  employmentStatus: EmploymentStatusSchema,
  incomeSource: IncomeSourceSchema,
  monthlyIncome: Money,
  stabilityMonths: z.number().int().nonnegative().max(600),
});

export const AssetsInfoSchema = z.object({
  /** The ONLY asset figure used by the engine. */
  availableAssets: Money,
  /** Context only — never scored. */
  restrictedAssets: Money,
  /** Context only — never scored (not received). */
  unreceivedInheritance: Money,
  savings: Money,
});

export const ObligationsInfoSchema = z.object({
  monthlyRent: Money,
  monthlyDebtPayments: Money,
  monthlyEssentials: Money,
  dependentsCount: z.number().int().nonnegative().max(30),
});

export const EngagementInfoSchema = z.object({
  engagementStatus: EngagementStatusSchema,
  engagementProofType: EngagementProofTypeSchema,
});

export const ApplicationDocumentSchema = z.object({
  id: IdSchema,
  kind: ApplicationDocumentKindSchema,
  fileId: IdSchema,
  fileName: z.string().min(1).max(200),
  mimeType: z.string().min(1).max(100),
  size: z.number().int().nonnegative(),
  sha256: Hash,
  uploadedAt: IsoDateSchema,
});

export const DeclarationsSchema = z.object({
  truthful: z.boolean(),
  verificationConsent: z.boolean(),
  processingConsent: z.boolean(),
  /** Optional, revocable. Gates public support-case cards (ADR-0024). */
  publicationConsent: z.boolean(),
});

export const ApplicationPayloadSchema = z.object({
  applicant: ApplicantInfoSchema,
  income: IncomeInfoSchema,
  assets: AssetsInfoSchema,
  obligations: ObligationsInfoSchema,
  engagement: EngagementInfoSchema,
  documents: z.array(ApplicationDocumentSchema).max(12),
  declarations: DeclarationsSchema,
});

export const EvaluationGateSchema = z.object({
  key: z.string().min(1).max(60),
  passed: z.boolean(),
  reasonKey: z.string().min(1).max(160),
});

export const EvaluationComponentSchema = z.object({
  key: z.string().min(1).max(60),
  weight: z.number().int().nonnegative().max(100),
  normalized: z.number().min(0).max(1),
  points: z.number().int().nonnegative().max(100),
  explanationKey: z.string().min(1).max(160),
});

export const EvaluationFlagSchema = z.object({
  key: z.string().min(1).max(60),
  labelKey: z.string().min(1).max(160),
});

export const AdvisoryEvaluationSchema = z.object({
  ruleVersion: z.string().min(1).max(40),
  advisory: z.literal(true),
  gatePassed: z.boolean(),
  gates: z.array(EvaluationGateSchema).max(12),
  breakdown: z.array(EvaluationComponentSchema).max(12),
  totalScore: z.number().int().min(0).max(100),
  bandId: z.string().min(1).max(40),
  bandLabelKey: z.string().min(1).max(160),
  recommendationKey: z.string().min(1).max(160),
  flags: z.array(EvaluationFlagSchema).max(12),
  evaluatedAt: IsoDateSchema,
});

export const InfoRequestItemSchema = z.object({
  fieldKey: z.string().min(1).max(120),
  reasonKey: z.string().min(1).max(160),
});

export const InfoRequestSchema = z.object({
  items: z.array(InfoRequestItemSchema).min(1).max(12),
  requestedAt: IsoDateSchema,
  reviewerId: IdSchema.nullable(),
});

export const ReviewDecisionSchema = z.object({
  outcome: z.enum(['approved', 'rejected']),
  reasonKeys: z.array(z.string().min(1).max(160)).min(1).max(8),
  reviewerId: IdSchema,
  decidedAt: IsoDateSchema,
  note: z.string().max(1000).nullable(),
});

export const AppealResolutionSchema = z.object({
  outcome: z.enum(['approved', 'rejected']),
  reasonKeys: z.array(z.string().min(1).max(160)).min(1).max(8),
  reviewerId: IdSchema,
  decidedAt: IsoDateSchema,
});

export const AppealRecordSchema = z.object({
  submittedAt: IsoDateSchema,
  statement: z.string().min(1).max(2000),
  documentIds: z.array(IdSchema).max(6),
  status: z.enum(['pending', 'resolved']),
  resolution: AppealResolutionSchema.nullable(),
});

export const PublicationConsentRecordSchema = z.object({
  grantedAt: IsoDateSchema,
  revokedAt: IsoDateSchema.nullable(),
  version: z.string().min(1).max(40),
});

export type ApplicationPayloadInput = z.infer<typeof ApplicationPayloadSchema>;
