import { CreateJobInputSchema, UpdateJobInputSchema } from '@/schemas/job';
import type { CreateJobInput, Job, JobRepository, UpdateJobInput } from '../contracts/job';
import { createMockCrudRepository } from './crud-factory';
import type { MockRepositoryOptions } from './profile';

// NOTE: the factory default stays 'draft'. Callers (seed/service) may pass an
// explicit initial status so seeded jobs are browsable without a create→update
// window (P12 lesson).
export function createMockJobRepository(options: MockRepositoryOptions = {}): JobRepository {
  return createMockCrudRepository<Job, CreateJobInput, UpdateJobInput>({
    idPrefix: 'mock-job',
    schemaCreate: CreateJobInputSchema,
    schemaUpdate: UpdateJobInputSchema,
    buildEntity: ({ id, input, nowIso }) => ({
      id,
      titleKey: input.titleKey,
      partnerId: input.partnerId ?? null,
      status: input.status ?? 'draft',
      createdAt: nowIso,
      updatedAt: nowIso,
      dataOrigin: 'demo',
      publisherId: input.publisherId ?? null,
      publisherName: input.publisherName ?? null,
      publisherTermsAcceptedAt: input.publisherTermsAcceptedAt ?? null,
      title: input.title ?? null,
      description: input.description ?? null,
      category: input.category ?? null,
      governorateId: input.governorateId ?? null,
      districtId: input.districtId ?? null,
      workType: input.workType ?? 'professional',
      schedule: input.schedule ?? 'full_time',
      salaryMin: input.salaryMin ?? null,
      salaryMax: input.salaryMax ?? null,
      requirements: input.requirements ?? [],
      applicationMethod: input.applicationMethod ?? 'in_app',
      applicationInstructions: input.applicationInstructions ?? null,
      deadline: input.deadline ?? null,
      expiresAt: input.expiresAt ?? null,
      rejectionReasonKey: null,
    }),
    applyUpdate: ({ existing, patch, nowIso }) => ({
      ...existing,
      ...(patch.titleKey !== undefined && { titleKey: patch.titleKey }),
      ...(patch.partnerId !== undefined && { partnerId: patch.partnerId }),
      ...(patch.status !== undefined && { status: patch.status }),
      ...(patch.publisherId !== undefined && { publisherId: patch.publisherId }),
      ...(patch.publisherName !== undefined && { publisherName: patch.publisherName }),
      ...(patch.publisherTermsAcceptedAt !== undefined && {
        publisherTermsAcceptedAt: patch.publisherTermsAcceptedAt,
      }),
      ...(patch.title !== undefined && { title: patch.title }),
      ...(patch.description !== undefined && { description: patch.description }),
      ...(patch.category !== undefined && { category: patch.category }),
      ...(patch.governorateId !== undefined && { governorateId: patch.governorateId }),
      ...(patch.districtId !== undefined && { districtId: patch.districtId }),
      ...(patch.workType !== undefined && { workType: patch.workType }),
      ...(patch.schedule !== undefined && { schedule: patch.schedule }),
      ...(patch.salaryMin !== undefined && { salaryMin: patch.salaryMin }),
      ...(patch.salaryMax !== undefined && { salaryMax: patch.salaryMax }),
      ...(patch.requirements !== undefined && { requirements: patch.requirements }),
      ...(patch.applicationMethod !== undefined && {
        applicationMethod: patch.applicationMethod,
      }),
      ...(patch.applicationInstructions !== undefined && {
        applicationInstructions: patch.applicationInstructions,
      }),
      ...(patch.deadline !== undefined && { deadline: patch.deadline }),
      ...(patch.expiresAt !== undefined && { expiresAt: patch.expiresAt }),
      ...(patch.rejectionReasonKey !== undefined && {
        rejectionReasonKey: patch.rejectionReasonKey,
      }),
      updatedAt: nowIso,
    }),
    delayMs: options.delayMs,
    forceErrorKind: options.forceErrorKind ?? null,
  });
}
