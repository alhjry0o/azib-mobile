import type { Result } from '@/core/result';
import type { BaseEntity, ListQuery, PagedResult } from '../types';

export type JobApplicationStatus =
  | 'submitted'
  | 'viewed'
  | 'shortlisted'
  | 'rejected'
  | 'hired'
  | 'withdrawn';

export interface JobApplication extends BaseEntity {
  readonly jobId: string;
  readonly applicantId: string;
  /** Short profile headline. No phone, no email. */
  readonly headline: string;
  readonly message: string;
  /** Private. Readable only by the concerned employer via an explicit call. */
  readonly cvFileId?: string | null;
  readonly status: JobApplicationStatus;
  readonly submittedAt: string;
  readonly viewedAt?: string | null;
  readonly shortlistedAt?: string | null;
  readonly rejectedAt?: string | null;
  readonly hiredAt?: string | null;
  readonly withdrawnAt?: string | null;
  readonly reasonKey?: string | null;
  readonly decidedBy?: string | null;
}

export interface CreateJobApplicationInput {
  readonly jobId: string;
  readonly applicantId: string;
  readonly headline: string;
  readonly message: string;
  readonly cvFileId?: string | null;
}

export interface UpdateJobApplicationInput {
  readonly status?: JobApplicationStatus;
  readonly headline?: string;
  readonly message?: string;
  readonly cvFileId?: string | null;
  readonly viewedAt?: string | null;
  readonly shortlistedAt?: string | null;
  readonly rejectedAt?: string | null;
  readonly hiredAt?: string | null;
  readonly withdrawnAt?: string | null;
  readonly reasonKey?: string | null;
  readonly decidedBy?: string | null;
}

export interface JobApplicationRepository {
  getById(id: string): Promise<Result<JobApplication | null>>;
  listByJob(jobId: string): Promise<Result<readonly JobApplication[]>>;
  listByApplicant(applicantId: string): Promise<Result<readonly JobApplication[]>>;
  list(query?: ListQuery): Promise<Result<PagedResult<JobApplication>>>;
  create(input: CreateJobApplicationInput): Promise<Result<JobApplication>>;
  update(id: string, input: UpdateJobApplicationInput): Promise<Result<JobApplication>>;
}
