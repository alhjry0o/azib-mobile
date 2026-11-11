import { CreateJobInputSchema, UpdateJobInputSchema } from '@/schemas/job';

import type {
  CreateJobInput,
  Job,
  JobRepository,
  UpdateJobInput,
} from '../contracts/job';
import { createMockCrudRepository } from './crud-factory';
import type { MockRepositoryOptions } from './profile';

export function createMockJobRepository(
  options: MockRepositoryOptions = {},
): JobRepository {
  return createMockCrudRepository<Job, CreateJobInput, UpdateJobInput>({
    idPrefix: 'mock-job',
    schemaCreate: CreateJobInputSchema,
    schemaUpdate: UpdateJobInputSchema,
    buildEntity: ({ id, input, nowIso }) => ({
      id,
      titleKey: input.titleKey,
      partnerId: input.partnerId,
      status: 'draft',
      createdAt: nowIso,
      updatedAt: nowIso,
      dataOrigin: 'demo',
    }),
    applyUpdate: ({ existing, patch, nowIso }) => ({
      ...existing,
      ...(patch.titleKey !== undefined && { titleKey: patch.titleKey }),
      ...(patch.status !== undefined && { status: patch.status }),
      updatedAt: nowIso,
    }),
    delayMs: options.delayMs,
    forceErrorKind: options.forceErrorKind ?? null,
  });
}
