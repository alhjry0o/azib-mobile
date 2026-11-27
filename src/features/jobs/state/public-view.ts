// Projections. Data minimisation happens HERE, at the hook boundary,
// never only in the UI (ADR-0065).
import type { Job } from '@/repositories/contracts/job';
import type { JobApplication } from '@/repositories/contracts/job-application';
import type { JobSchedule, JobWorkType, JobApplicationMethod } from '@/repositories/contracts/job';

export interface PublicJobView {
  readonly id: string;
  readonly title: string | null;
  readonly titleKey: string;
  readonly description: string | null;
  readonly category: string | null;
  readonly governorateId: string | null;
  readonly districtId: string | null;
  readonly workType: JobWorkType;
  readonly schedule: JobSchedule;
  /** Always rendered with the "declared, unverified" label (D-4). */
  readonly salaryMin: number | null;
  readonly salaryMax: number | null;
  readonly requirements: readonly string[];
  readonly applicationMethod: JobApplicationMethod;
  readonly applicationInstructions: string | null;
  readonly deadline: string | null;
  readonly expiresAt: string | null;
  readonly status: Job['status'];
  readonly partnerId: string | null;
  readonly publisherName: string | null;
  readonly dataOrigin: Job['dataOrigin'];
}

/** Strips publisherId. There is NO verified flag anywhere (ADR-0052). */
export function toPublicJobView(job: Job): PublicJobView {
  return Object.freeze({
    id: job.id,
    title: job.title ?? null,
    titleKey: job.titleKey,
    description: job.description ?? null,
    category: job.category ?? null,
    governorateId: job.governorateId ?? null,
    districtId: job.districtId ?? null,
    workType: job.workType ?? 'professional',
    schedule: job.schedule ?? 'full_time',
    salaryMin: job.salaryMin ?? null,
    salaryMax: job.salaryMax ?? null,
    requirements: job.requirements ?? [],
    applicationMethod: job.applicationMethod ?? 'in_app',
    applicationInstructions: job.applicationInstructions ?? null,
    deadline: job.deadline ?? null,
    expiresAt: job.expiresAt ?? null,
    status: job.status,
    partnerId: job.partnerId ?? null,
    publisherName: job.publisherName ?? null,
    dataOrigin: job.dataOrigin,
  });
}

export interface EmployerApplicantView {
  readonly id: string;
  readonly headline: string;
  readonly message: string;
  readonly status: JobApplication['status'];
  readonly submittedAt: string;
  readonly viewedAt: string | null;
  readonly shortlistedAt: string | null;
  readonly rejectedAt: string | null;
  readonly hiredAt: string | null;
  /** Existence only. The file id is NEVER projected (D-5). */
  readonly hasCv: boolean;
}

/** Minimum data: no applicantId, no phone, no email, no CV id. */
export function toEmployerApplicantView(application: JobApplication): EmployerApplicantView {
  return Object.freeze({
    id: application.id,
    headline: application.headline,
    message: application.message,
    status: application.status,
    submittedAt: application.submittedAt,
    viewedAt: application.viewedAt ?? null,
    shortlistedAt: application.shortlistedAt ?? null,
    rejectedAt: application.rejectedAt ?? null,
    hiredAt: application.hiredAt ?? null,
    hasCv: Boolean(application.cvFileId),
  });
}

export interface ApplicantOwnView {
  readonly id: string;
  readonly jobId: string;
  readonly status: JobApplication['status'];
  readonly submittedAt: string;
  readonly viewedAt: string | null;
  readonly shortlistedAt: string | null;
  readonly rejectedAt: string | null;
  readonly hiredAt: string | null;
  readonly withdrawnAt: string | null;
  readonly reasonKey: string | null;
}

export function toApplicantOwnView(application: JobApplication): ApplicantOwnView {
  return Object.freeze({
    id: application.id,
    jobId: application.jobId,
    status: application.status,
    submittedAt: application.submittedAt,
    viewedAt: application.viewedAt ?? null,
    shortlistedAt: application.shortlistedAt ?? null,
    rejectedAt: application.rejectedAt ?? null,
    hiredAt: application.hiredAt ?? null,
    withdrawnAt: application.withdrawnAt ?? null,
    reasonKey: application.reasonKey ?? null,
  });
}
