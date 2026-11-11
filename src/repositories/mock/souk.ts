import { CreateSoukItemInputSchema, UpdateSoukItemInputSchema } from '@/schemas/souk';

import type {
  CreateSoukItemInput,
  SoukItem,
  SoukRepository,
  UpdateSoukItemInput,
} from '../contracts/souk';
import { createMockCrudRepository } from './crud-factory';
import type { MockRepositoryOptions } from './profile';

export function createMockSoukRepository(
  options: MockRepositoryOptions = {},
): SoukRepository {
  return createMockCrudRepository<SoukItem, CreateSoukItemInput, UpdateSoukItemInput>({
    idPrefix: 'mock-souk',
    schemaCreate: CreateSoukItemInputSchema,
    schemaUpdate: UpdateSoukItemInputSchema,
    buildEntity: ({ id, input, nowIso }) => ({
      id,
      titleKey: input.titleKey,
      category: input.category,
      status: 'available',
      createdAt: nowIso,
      updatedAt: nowIso,
      dataOrigin: 'demo',
    }),
    applyUpdate: ({ existing, patch, nowIso }) => ({
      ...existing,
      ...(patch.titleKey !== undefined && { titleKey: patch.titleKey }),
      ...(patch.category !== undefined && { category: patch.category }),
      ...(patch.status !== undefined && { status: patch.status }),
      updatedAt: nowIso,
    }),
    delayMs: options.delayMs,
    forceErrorKind: options.forceErrorKind ?? null,
  });
}
