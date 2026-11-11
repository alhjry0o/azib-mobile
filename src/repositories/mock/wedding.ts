import { CreateWeddingInputSchema, UpdateWeddingInputSchema } from '@/schemas/wedding';

import type {
  CreateWeddingInput,
  UpdateWeddingInput,
  Wedding,
  WeddingRepository,
} from '../contracts/wedding';
import { createMockCrudRepository } from './crud-factory';
import type { MockRepositoryOptions } from './profile';

export function createMockWeddingRepository(
  options: MockRepositoryOptions = {},
): WeddingRepository {
  return createMockCrudRepository<Wedding, CreateWeddingInput, UpdateWeddingInput>({
    idPrefix: 'mock-wedding',
    schemaCreate: CreateWeddingInputSchema,
    schemaUpdate: UpdateWeddingInputSchema,
    buildEntity: ({ id, input, nowIso }) => ({
      id,
      titleKey: input.titleKey,
      scheduledDate: input.scheduledDate,
      capacity: input.capacity,
      status: 'draft',
      createdAt: nowIso,
      updatedAt: nowIso,
      dataOrigin: 'demo',
    }),
    applyUpdate: ({ existing, patch, nowIso }) => ({
      ...existing,
      ...(patch.titleKey !== undefined && { titleKey: patch.titleKey }),
      ...(patch.scheduledDate !== undefined && { scheduledDate: patch.scheduledDate }),
      ...(patch.capacity !== undefined && { capacity: patch.capacity }),
      ...(patch.status !== undefined && { status: patch.status }),
      updatedAt: nowIso,
    }),
    delayMs: options.delayMs,
    forceErrorKind: options.forceErrorKind ?? null,
  });
}
