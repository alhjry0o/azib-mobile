import type { Result } from '@/core/result';
import type { BaseEntity, ListQuery, PagedResult } from '../types';

export type JobReportStatus = 'open' | 'reviewing' | 'resolved' | 'dismissed';

export interface JobSave extends BaseEntity {
  readonly userId: string;
  readonly jobId: string;
}

export interface JobReport extends BaseEntity {
  readonly jobId: string;
  readonly reporterId: string;
  readonly reasonKey: string;
  readonly detail: string;
  readonly status: JobReportStatus;
  readonly resolvedBy?: string | null;
  readonly resolvedAt?: string | null;
  readonly resolutionKey?: string | null;
}

export interface CreateJobReportInput {
  readonly jobId: string;
  readonly reporterId: string;
  readonly reasonKey: string;
  readonly detail: string;
}

export interface JobEngagementRepository {
  save(userId: string, jobId: string): Promise<Result<JobSave>>;
  unsave(userId: string, jobId: string): Promise<Result<void>>;
  listSaved(userId: string): Promise<Result<readonly JobSave[]>>;
  getReport(id: string): Promise<Result<JobReport | null>>;
  listReportsByJob(jobId: string): Promise<Result<readonly JobReport[]>>;
  listReports(query?: ListQuery): Promise<Result<PagedResult<JobReport>>>;
  createReport(input: CreateJobReportInput): Promise<Result<JobReport>>;
  updateReportStatus(
    id: string,
    status: JobReportStatus,
    actorId: string,
    resolutionKey?: string | null,
  ): Promise<Result<JobReport>>;
}
