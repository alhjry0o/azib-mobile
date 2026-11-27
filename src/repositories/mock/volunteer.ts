import { CreateVolunteerInputSchema, UpdateVolunteerInputSchema } from '@/schemas/volunteer';
import type {
  CreateVolunteerInput,
  UpdateVolunteerInput,
  Volunteer,
  VolunteerRepository,
} from '../contracts/volunteer';
import { createMockCrudRepository } from './crud-factory';
import type { MockRepositoryOptions } from './profile';

// Default status stays 'active' (P03 contract). 'inactive' remains valid.
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
      governorateIds: input.governorateIds ?? [],
      skills: input.skills ?? [],
      helpTypes: input.helpTypes ?? [],
      availability: input.availability ?? [],
      note: input.note ?? null,
    }),
    applyUpdate: ({ existing, patch, nowIso }) => ({
      ...existing,
      ...(patch.skillKey !== undefined && { skillKey: patch.skillKey }),
      ...(patch.status !== undefined && { status: patch.status }),
      ...(patch.governorateIds !== undefined && { governorateIds: patch.governorateIds }),
      ...(patch.skills !== undefined && { skills: patch.skills }),
      ...(patch.helpTypes !== undefined && { helpTypes: patch.helpTypes }),
      ...(patch.availability !== undefined && { availability: patch.availability }),
      ...(patch.note !== undefined && { note: patch.note }),
      updatedAt: nowIso,
    }),
    delayMs: options.delayMs,
    forceErrorKind: options.forceErrorKind ?? null,
  });
}
