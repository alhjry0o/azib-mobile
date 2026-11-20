// Pure orchestration: dedup → advisory score → create → attach → submit+audit.
// Never writes a decision. The advisory result is attached for reviewers only.
import { AppError } from '@/core/errors';
import type { Result } from '@/core/result';
import type {
  Application,
  ApplicationPayload,
  ApplicationRepository,
} from '@/repositories/contracts/application';
import type { AuditRepository } from '@/repositories/contracts/audit';
import type { EligibilityRules } from '../engine/rules.types';
import { scoreApplication } from '../engine/score-application';
import { createMockDedupService, type DedupService } from './dedup-service';
import { applyTransition } from './workflow-service';

const PRIOR_STATUSES: readonly string[] = ['approved', 'disbursed', 'completed'];

export interface SubmissionDeps {
  readonly applications: ApplicationRepository;
  readonly audit: AuditRepository;
  readonly dedup?: DedupService;
}

export interface SubmissionInput {
  readonly applicantId: string;
  readonly programId: string;
  readonly requestedAmount: number;
  readonly notes: string | null;
  readonly payload: ApplicationPayload;
  readonly rules: EligibilityRules;
  readonly now?: Date;
}

export async function submitAssistance(
  deps: SubmissionDeps,
  input: SubmissionInput,
): Promise<Result<Application>> {
  const existing = await deps.applications.listByApplicant(input.applicantId);
  if (!existing.ok) return existing;

  const priorAssistanceCount = existing.value.filter((a) =>
    PRIOR_STATUSES.includes(a.status),
  ).length;

  const dedup = deps.dedup ?? createMockDedupService();
  const signals = await dedup.inspect(
    {
      applicantId: input.applicantId,
      identityHash: input.payload.applicant.identityHash,
      phoneHash: input.payload.applicant.phoneHash,
      documentHashes: input.payload.documents.map((d) => d.sha256),
      now: input.now,
    },
    existing.value,
    input.rules.thresholds.rapidResubmissionWindowDays,
  );

  const evaluation = scoreApplication(
    {
      payload: input.payload,
      requestedAmount: input.requestedAmount,
      priorAssistanceCount,
      signals,
      now: input.now,
    },
    input.rules,
  );

  const created = await deps.applications.create({
    applicantId: input.applicantId,
    programId: input.programId,
    requestedAmount: input.requestedAmount,
    notes: input.notes,
    payload: input.payload,
  });
  if (!created.ok) return created;

  const attached = await deps.applications.update(created.value.id, { evaluation });
  if (!attached.ok) return attached;

  const submitted = await applyTransition(
    { applications: deps.applications, audit: deps.audit },
    {
      applicationId: created.value.id,
      to: 'submitted',
      actor: 'applicant',
      actorId: input.applicantId,
      now: input.now,
    },
  );
  if (!submitted.ok) return submitted;
  if (!submitted.value.referenceNumber) {
    return { ok: false, error: AppError.unknown({ code: 'REFERENCE_NOT_MINTED' }) };
  }
  return submitted;
}
