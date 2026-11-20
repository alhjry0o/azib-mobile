// Wizard step schemas (P08.2). Money is integer YER. Messages are i18n keys.
import { z } from 'zod';
import { AppError } from '@/core/errors';
import type { Result } from '@/core/result';
import {
  ApplicationDocumentSchema,
  ApplicationPayloadSchema,
  EmploymentStatusSchema,
  EngagementProofTypeSchema,
  EngagementStatusSchema,
  IncomeSourceSchema,
} from '@/schemas/application-payload';
import type { ApplicationPayload } from '@/repositories/contracts/application';
import type { AssistanceDraftState } from '@/stores';

const Money = z.number().int().nonnegative();
const Fingerprint = z.string().min(16);

export const ApplicantStepSchema = z.object({
  governorateId: z.string().min(1, 'assistance:wizard.validation.governorate'),
  districtId: z.string().nullable(),
  birthYear: z.number().int().min(1900, 'assistance:wizard.validation.birthYear').max(2100, 'assistance:wizard.validation.birthYear'),
  householdSize: z.number().int().min(1, 'assistance:wizard.validation.household').max(30, 'assistance:wizard.validation.household'),
  identityHash: Fingerprint.refine((v) => v.length >= 16, 'assistance:wizard.validation.identity'),
  phoneHash: Fingerprint.refine((v) => v.length >= 16, 'assistance:wizard.validation.phone'),
});

export const IncomeStepSchema = z.object({
  employmentStatus: EmploymentStatusSchema,
  incomeSource: IncomeSourceSchema,
  monthlyIncome: Money,
  stabilityMonths: z.number().int().nonnegative().max(600),
});

export const AssetsStepSchema = z.object({
  availableAssets: Money,
  restrictedAssets: Money,
  unreceivedInheritance: Money,
  savings: Money,
});

export const ObligationsStepSchema = z.object({
  monthlyRent: Money,
  monthlyDebtPayments: Money,
  monthlyEssentials: Money,
  dependentsCount: z.number().int().nonnegative().max(30),
});

export const EngagementStepSchema = z.object({
  engagementStatus: EngagementStatusSchema,
  engagementProofType: EngagementProofTypeSchema,
});

export const DocumentsStepSchema = z.object({
  documents: z
    .array(ApplicationDocumentSchema)
    .min(1, 'assistance:wizard.validation.documents')
    .max(12),
});

export const ReviewStepSchema = z.object({
  requestedAmount: z.number().int().positive('assistance:wizard.validation.amount'),
  notes: z.string().max(1000),
  truthful: z.boolean().refine((v) => v, 'assistance:wizard.validation.truthful'),
  verificationConsent: z.boolean().refine((v) => v, 'assistance:wizard.validation.verification'),
  processingConsent: z.boolean().refine((v) => v, 'assistance:wizard.validation.processing'),
  publicationConsent: z.boolean(),
});

export type FieldErrors = Readonly<Record<string, string>>;

/** Maps Zod issues to a flat field -> message-key map for inline errors. */
export function collectFieldErrors(issues: readonly { path: readonly (string | number | symbol)[]; message: string }[]): FieldErrors {
  const out: Record<string, string> = {};
  for (const issue of issues) {
    const key = String(issue.path[0] ?? 'form');
    if (out[key] === undefined) out[key] = issue.message;
  }
  return out;
}

export type DraftSnapshot = Pick<
  AssistanceDraftState,
  | 'applicant'
  | 'income'
  | 'assets'
  | 'obligations'
  | 'engagement'
  | 'documents'
  | 'declarations'
>;

export function buildPayload(draft: DraftSnapshot): Result<ApplicationPayload> {
  const parsed = ApplicationPayloadSchema.safeParse({
    applicant: draft.applicant,
    income: draft.income,
    assets: draft.assets,
    obligations: draft.obligations,
    engagement: draft.engagement,
    documents: draft.documents,
    declarations: draft.declarations,
  });
  if (!parsed.success) {
    return { ok: false, error: AppError.validation({ cause: parsed.error }) };
  }
  return { ok: true, value: parsed.data };
}
