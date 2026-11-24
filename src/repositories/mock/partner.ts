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
      ownerId: input.ownerId ?? null,
      description: input.description ?? null,
      governorateId: input.governorateId ?? null,
      districtId: input.districtId ?? null,
      city: input.city ?? null,
      contactPhone: input.contactPhone ?? null,
      whatsapp: input.whatsapp ?? null,
      imageFileIds: input.imageFileIds ?? [],
      termsAcceptedAt: input.termsAcceptedAt ?? null,
      verificationId: null,
      verifiedAt: null,
      reverifyAfter: null,
      rejectionReasonKey: null,
      suspensionReasonKey: null,
      latitude: input.latitude ?? null,
      longitude: input.longitude ?? null,
    }),
    applyUpdate: ({ existing, patch, nowIso }) => ({
      ...existing,
      ...(patch.displayName !== undefined && { displayName: patch.displayName }),
      ...(patch.category !== undefined && { category: patch.category }),
      ...(patch.status !== undefined && { status: patch.status }),
      ...(patch.ownerId !== undefined && { ownerId: patch.ownerId }),
      ...(patch.description !== undefined && { description: patch.description }),
      ...(patch.governorateId !== undefined && { governorateId: patch.governorateId }),
      ...(patch.districtId !== undefined && { districtId: patch.districtId }),
      ...(patch.city !== undefined && { city: patch.city }),
      ...(patch.contactPhone !== undefined && { contactPhone: patch.contactPhone }),
      ...(patch.whatsapp !== undefined && { whatsapp: patch.whatsapp }),
      ...(patch.imageFileIds !== undefined && { imageFileIds: patch.imageFileIds }),
      ...(patch.termsAcceptedAt !== undefined && { termsAcceptedAt: patch.termsAcceptedAt }),
      ...(patch.verificationId !== undefined && { verificationId: patch.verificationId }),
      ...(patch.verifiedAt !== undefined && { verifiedAt: patch.verifiedAt }),
      ...(patch.reverifyAfter !== undefined && { reverifyAfter: patch.reverifyAfter }),
      ...(patch.rejectionReasonKey !== undefined && {
        rejectionReasonKey: patch.rejectionReasonKey,
      }),
      ...(patch.suspensionReasonKey !== undefined && {
        suspensionReasonKey: patch.suspensionReasonKey,
      }),
      ...(patch.latitude !== undefined && { latitude: patch.latitude }),
      ...(patch.longitude !== undefined && { longitude: patch.longitude }),
      updatedAt: nowIso,
    }),
    delayMs: options.delayMs,
    forceErrorKind: options.forceErrorKind ?? null,
  });
}
