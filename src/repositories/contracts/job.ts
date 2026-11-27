import type { CrudRepository, BaseEntity } from '../types';

// P13.1 extends additively and RELAXES partnerId to optional/nullable so a
// lightly-verified publisher (not necessarily a P11 partner) can post a job.
// Existing callers stay valid: partnerId is still accepted, and '' still fails.
// There is NO `verified` field a client can write (ADR-0052).
export type JobStatus = 'draft' | 'open' | 'closed' | 'pending_review' | 'expired' | 'rejected';

export type JobWorkType = 'daily' | 'professional' | 'freelance' | 'internship';
export type JobSchedule = 'full_time' | 'part_time' | 'shifts' | 'flexible';
export type JobApplicationMethod = 'in_app' | 'external_instructions';

export interface Job extends BaseEntity {
  readonly titleKey: string;
  readonly partnerId?: string | null;
  readonly status: JobStatus;
  readonly publisherId?: string | null;
  readonly publisherName?: string | null;
  readonly publisherTermsAcceptedAt?: string | null;
  readonly title?: string | null;
  readonly description?: string | null;
  readonly category?: string | null;
  readonly governorateId?: string | null;
  readonly districtId?: string | null;
  readonly workType?: JobWorkType;
  readonly schedule?: JobSchedule;
  /** Declared by the publisher, UNVERIFIED. No payment, no tracking. */
  readonly salaryMin?: number | null;
  readonly salaryMax?: number | null;
  readonly requirements?: readonly string[];
  readonly applicationMethod?: JobApplicationMethod;
  readonly applicationInstructions?: string | null;
  readonly deadline?: string | null;
  readonly expiresAt?: string | null;
  readonly rejectionReasonKey?: string | null;
}

export interface CreateJobInput {
  readonly titleKey: string;
  readonly partnerId?: string | null;
  readonly status?: JobStatus;
  readonly publisherId?: string | null;
  readonly publisherName?: string | null;
  readonly publisherTermsAcceptedAt?: string | null;
  readonly title?: string | null;
  readonly description?: string | null;
  readonly category?: string | null;
  readonly governorateId?: string | null;
  readonly districtId?: string | null;
  readonly workType?: JobWorkType;
  readonly schedule?: JobSchedule;
  readonly salaryMin?: number | null;
  readonly salaryMax?: number | null;
  readonly requirements?: readonly string[];
  readonly applicationMethod?: JobApplicationMethod;
  readonly applicationInstructions?: string | null;
  readonly deadline?: string | null;
  readonly expiresAt?: string | null;
}

export interface UpdateJobInput {
  readonly titleKey?: string;
  readonly partnerId?: string | null;
  readonly status?: JobStatus;
  readonly publisherId?: string | null;
  readonly publisherName?: string | null;
  readonly publisherTermsAcceptedAt?: string | null;
  readonly title?: string | null;
  readonly description?: string | null;
  readonly category?: string | null;
  readonly governorateId?: string | null;
  readonly districtId?: string | null;
  readonly workType?: JobWorkType;
  readonly schedule?: JobSchedule;
  readonly salaryMin?: number | null;
  readonly salaryMax?: number | null;
  readonly requirements?: readonly string[];
  readonly applicationMethod?: JobApplicationMethod;
  readonly applicationInstructions?: string | null;
  readonly deadline?: string | null;
  readonly expiresAt?: string | null;
  readonly rejectionReasonKey?: string | null;
}

export type JobRepository = CrudRepository<Job, CreateJobInput, UpdateJobInput>;
