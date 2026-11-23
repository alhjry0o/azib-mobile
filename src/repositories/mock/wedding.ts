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
      organizerId: input.organizerId ?? null,
      coOrganizerIds: input.coOrganizerIds ?? [],
      governorateId: input.governorateId ?? null,
      districtId: input.districtId ?? null,
      city: input.city ?? null,
      alternateDate: input.alternateDate ?? null,
      targetCount: input.targetCount ?? null,
      descriptionKey: input.descriptionKey ?? null,
      withdrawalPolicyVersion: input.withdrawalPolicyVersion ?? null,
      maxGroupSize: input.maxGroupSize ?? null,
      budgetVersion: null,
      agreementId: null,
      cancellationReasonKey: null,
    }),
    applyUpdate: ({ existing, patch, nowIso }) => ({
      ...existing,
      ...(patch.titleKey !== undefined && { titleKey: patch.titleKey }),
      ...(patch.scheduledDate !== undefined && { scheduledDate: patch.scheduledDate }),
      ...(patch.capacity !== undefined && { capacity: patch.capacity }),
      ...(patch.status !== undefined && { status: patch.status }),
      ...(patch.organizerId !== undefined && { organizerId: patch.organizerId }),
      ...(patch.coOrganizerIds !== undefined && { coOrganizerIds: patch.coOrganizerIds }),
      ...(patch.governorateId !== undefined && { governorateId: patch.governorateId }),
      ...(patch.districtId !== undefined && { districtId: patch.districtId }),
      ...(patch.city !== undefined && { city: patch.city }),
      ...(patch.alternateDate !== undefined && { alternateDate: patch.alternateDate }),
      ...(patch.targetCount !== undefined && { targetCount: patch.targetCount }),
      ...(patch.descriptionKey !== undefined && { descriptionKey: patch.descriptionKey }),
      ...(patch.withdrawalPolicyVersion !== undefined && {
        withdrawalPolicyVersion: patch.withdrawalPolicyVersion,
      }),
      ...(patch.maxGroupSize !== undefined && { maxGroupSize: patch.maxGroupSize }),
      ...(patch.budgetVersion !== undefined && { budgetVersion: patch.budgetVersion }),
      ...(patch.agreementId !== undefined && { agreementId: patch.agreementId }),
      ...(patch.cancellationReasonKey !== undefined && {
        cancellationReasonKey: patch.cancellationReasonKey,
      }),
      updatedAt: nowIso,
    }),
    delayMs: options.delayMs,
    forceErrorKind: options.forceErrorKind ?? null,
  });
}
