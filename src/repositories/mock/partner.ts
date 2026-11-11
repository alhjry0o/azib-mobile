import { CreatePartnerInputSchema, UpdatePartnerInputSchema } from '@/schemas/partner';

import type {
  CreatePartnerInput,
  Partner,
  PartnerRepository,
  UpdatePartnerInput,
} from '../contracts/partner';
import { createMockCrudRepository } from './crud-factory';
import type { MockRepositoryOptions } from './profile';

export function createMockPartnerRepository(
  options: MockRepositoryOptions = {},
): PartnerRepository {
  return createMockCrudRepository<Partner, CreatePartnerInput, UpdatePartnerInput>({
    idPrefix: 'mock-partner',
    schemaCreate: CreatePartnerInputSchema,
    schemaUpdate: UpdatePartnerInputSchema,
    buildEntity: ({ id, input, nowIso }) => ({
      id,
      displayName: input.displayName,
      category: input.category,
      status: 'draft',
      createdAt: nowIso,
      updatedAt: nowIso,
      dataOrigin: 'demo',
    }),
    applyUpdate: ({ existing, patch, nowIso }) => ({
      ...existing,
      ...(patch.displayName !== undefined && { displayName: patch.displayName }),
      ...(patch.category !== undefined && { category: patch.category }),
      ...(patch.status !== undefined && { status: patch.status }),
      updatedAt: nowIso,
    }),
    delayMs: options.delayMs,
    forceErrorKind: options.forceErrorKind ?? null,
  });
}
