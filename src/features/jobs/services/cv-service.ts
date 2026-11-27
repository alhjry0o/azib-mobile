// Reuses the proven P08 upload pipeline with JOB-OWNED limits (D-6/D-10).
// The CV is private: only the concerned employer may read its file id (D-5).
import { AppError } from '@/core/errors';
import { ok, type Result } from '@/core/result';
import type { FileStorageProvider } from '@/providers/contracts/storage';
import type { JobRepository } from '@/repositories/contracts/job';
import type { JobApplicationRepository } from '@/repositories/contracts/job-application';
import {
  pickImageDocument,
  pickPdfDocument,
  prepareDocument,
} from '@/features/assistance/services/document-pipeline';
import { JOB_CV_LIMITS } from '../state/limits';
import { canViewApplicantCv, type JobRole } from '../state/permissions';

export interface UploadedCv {
  readonly fileId: string;
  readonly fileName: string;
  readonly mimeType: string;
  readonly size: number;
}

export async function pickPrepareUploadCv(
  storage: FileStorageProvider,
  source: 'image' | 'pdf',
): Promise<Result<UploadedCv | null>> {
  const picked = source === 'image' ? await pickImageDocument() : await pickPdfDocument();
  if (!picked.ok) return picked;
  if (!picked.value) return { ok: true, value: null };

  const prepared = await prepareDocument(picked.value, JOB_CV_LIMITS);
  if (!prepared.ok) return prepared;

  const uploaded = await storage.uploadFile(prepared.value.uri, {
    contentType: prepared.value.mimeType,
  });
  if (!uploaded.ok) return uploaded;

  return ok({
    fileId: uploaded.value.id,
    fileName: prepared.value.name,
    mimeType: prepared.value.mimeType,
    size: prepared.value.size,
  });
}

export interface CvReadDeps {
  readonly jobs: JobRepository;
  readonly jobApplications: JobApplicationRepository;
}

/** Explicit, audited-by-caller read. Never projected into any list. */
export async function readApplicantCvFileId(
  deps: CvReadDeps,
  applicationId: string,
  viewerId: string,
  viewerRole: JobRole,
): Promise<Result<string>> {
  const found = await deps.jobApplications.getById(applicationId);
  if (!found.ok) return found;
  const application = found.value;
  if (!application) {
    return { ok: false, error: AppError.notFound({ code: 'APPLICATION_NOT_FOUND' }) };
  }
  const job = await deps.jobs.getById(application.jobId);
  if (!job.ok) return job;
  if (!job.value) return { ok: false, error: AppError.notFound({ code: 'JOB_NOT_FOUND' }) };
  const isPublisher = job.value.publisherId === viewerId;
  if (!canViewApplicantCv(viewerRole, isPublisher)) {
    return { ok: false, error: AppError.forbidden({ code: 'NO_PERMISSION' }) };
  }
  const fileId = application.cvFileId ?? null;
  if (!fileId) return { ok: false, error: AppError.notFound({ code: 'CV_NOT_FOUND' }) };
  return ok(fileId);
}
