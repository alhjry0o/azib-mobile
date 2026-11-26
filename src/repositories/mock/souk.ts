import { CreateSoukItemInputSchema, UpdateSoukItemInputSchema } from '@/schemas/souk';
import type {
  CreateSoukItemInput,
  SoukItem,
  SoukRepository,
  UpdateSoukItemInput,
} from '../contracts/souk';
import { createMockCrudRepository } from './crud-factory';
import type { MockRepositoryOptions } from './profile';

// NOTE: the factory keeps status 'available' so seeded items stay browsable.
// New user items are created as 'draft' by the souk item SERVICE, not here.
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
      status: input.status ?? 'available',
      createdAt: nowIso,
      updatedAt: nowIso,
      dataOrigin: 'demo',
      donorId: input.donorId ?? null,
      title: input.title ?? null,
      description: input.description ?? null,
      condition: input.condition ?? 'good',
      governorateId: input.governorateId ?? null,
      districtId: input.districtId ?? null,
      deliveryMethod: input.deliveryMethod ?? 'self_pickup',
      imageFileIds: input.imageFileIds ?? [],
      imageFingerprints: input.imageFingerprints ?? [],
      estimatedValue: input.estimatedValue ?? null,
      noResaleConsentAt: input.noResaleConsentAt ?? null,
      reservedForRequestId: null,
      expiresAt: input.expiresAt ?? null,
      rejectionReasonKey: null,
      duplicateFlag: false,
      saleWordFlag: false,
    }),
    applyUpdate: ({ existing, patch, nowIso }) => ({
      ...existing,
      ...(patch.titleKey !== undefined && { titleKey: patch.titleKey }),
      ...(patch.category !== undefined && { category: patch.category }),
      ...(patch.status !== undefined && { status: patch.status }),
      ...(patch.donorId !== undefined && { donorId: patch.donorId }),
      ...(patch.title !== undefined && { title: patch.title }),
      ...(patch.description !== undefined && { description: patch.description }),
      ...(patch.condition !== undefined && { condition: patch.condition }),
      ...(patch.governorateId !== undefined && { governorateId: patch.governorateId }),
      ...(patch.districtId !== undefined && { districtId: patch.districtId }),
      ...(patch.deliveryMethod !== undefined && { deliveryMethod: patch.deliveryMethod }),
      ...(patch.imageFileIds !== undefined && { imageFileIds: patch.imageFileIds }),
      ...(patch.imageFingerprints !== undefined && {
        imageFingerprints: patch.imageFingerprints,
      }),
      ...(patch.estimatedValue !== undefined && { estimatedValue: patch.estimatedValue }),
      ...(patch.noResaleConsentAt !== undefined && {
        noResaleConsentAt: patch.noResaleConsentAt,
      }),
      ...(patch.reservedForRequestId !== undefined && {
        reservedForRequestId: patch.reservedForRequestId,
      }),
      ...(patch.expiresAt !== undefined && { expiresAt: patch.expiresAt }),
      ...(patch.rejectionReasonKey !== undefined && {
        rejectionReasonKey: patch.rejectionReasonKey,
      }),
      ...(patch.duplicateFlag !== undefined && { duplicateFlag: patch.duplicateFlag }),
      ...(patch.saleWordFlag !== undefined && { saleWordFlag: patch.saleWordFlag }),
      updatedAt: nowIso,
    }),
    delayMs: options.delayMs,
    forceErrorKind: options.forceErrorKind ?? null,
  });
}
