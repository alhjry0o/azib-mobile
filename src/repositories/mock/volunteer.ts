import { CreateVolunteerInputSchema, UpdateVolunteerInputSchema } from '@/schemas/volunteer';

import type {
  CreateVolunteerInput,
  UpdateVolunteerInput,
  Volunteer,
  VolunteerRepository,
} from '../contracts/volunteer';
import { createMockCrudRepository } from './crud-factory';
import type { MockRepositoryOptions } from './profile';

export function createMockVolunteerRepository(
  options: MockRepositoryOptions = {},
): VolunteerRepository {
  return createMockCrudRepository<Volunteer, CreateVolunteerInput, UpdateVolunteerInput>({
    idPrefix: 'mock-volunteer',
    schemaCreate: CreateVolunteerInputSchema,
    schemaUpdate: UpdateVolunteerInputSchema,
    buildEntity: ({ id, input, nowIso }) => ({
      id,
      userId: input.userId,
      skillKey: input.skillKey,
      status: 'active',
      createdAt: nowIso,
      updatedAt: nowIso,
      dataOrigin: 'demo',
    }),
    applyUpdate: ({ existing, patch, nowIso }) => ({
      ...existing,
      ...(patch.skillKey !== undefined && { skillKey: patch.skillKey }),
      ...(patch.status !== undefined && { status: patch.status }),
      updatedAt: nowIso,
    }),
    delayMs: options.delayMs,
    forceErrorKind: options.forceErrorKind ?? null,
  });
}
