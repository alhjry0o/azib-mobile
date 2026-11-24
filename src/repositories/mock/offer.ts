import { CreateOfferInputSchema, UpdateOfferInputSchema } from '@/schemas/offer';
import type {
  CreateOfferInput,
  Offer,
  OfferRepository,
  UpdateOfferInput,
} from '../contracts/offer';
import { createMockCrudRepository } from './crud-factory';
import type { MockRepositoryOptions } from './profile';

export function createMockOfferRepository(
  options: MockRepositoryOptions = {},
): OfferRepository {
  return createMockCrudRepository<Offer, CreateOfferInput, UpdateOfferInput>({
    idPrefix: 'mock-offer',
    schemaCreate: CreateOfferInputSchema,
    schemaUpdate: UpdateOfferInputSchema,
    buildEntity: ({ id, input, nowIso }) => ({
      id,
      partnerId: input.partnerId,
      titleKey: input.titleKey,
      discountPercent: input.discountPercent,
      status: 'draft',
      createdAt: nowIso,
      updatedAt: nowIso,
      dataOrigin: 'demo',
      title: input.title ?? null,
      discountType: input.discountType ?? 'percent',
      discountValue: input.discountValue ?? input.discountPercent,
      // Demo records are always placeholder-labelled unless explicitly real.
      discountPlaceholder: input.discountPlaceholder ?? true,
      audience: input.audience ?? 'beneficiaries',
      products: input.products ?? [],
      terms: input.terms ?? null,
      validFrom: input.validFrom ?? null,
      validUntil: input.validUntil ?? null,
      imageFileIds: input.imageFileIds ?? [],
      category: input.category ?? null,
      governorateId: input.governorateId ?? null,
      rejectionReasonKey: null,
      publishedAt: null,
      reviewRequestedAt: null,
    }),
    applyUpdate: ({ existing, patch, nowIso }) => ({
      ...existing,
      ...(patch.titleKey !== undefined && { titleKey: patch.titleKey }),
      ...(patch.discountPercent !== undefined && { discountPercent: patch.discountPercent }),
      ...(patch.status !== undefined && { status: patch.status }),
      ...(patch.title !== undefined && { title: patch.title }),
      ...(patch.discountType !== undefined && { discountType: patch.discountType }),
      ...(patch.discountValue !== undefined && { discountValue: patch.discountValue }),
      ...(patch.discountPlaceholder !== undefined && {
        discountPlaceholder: patch.discountPlaceholder,
      }),
      ...(patch.audience !== undefined && { audience: patch.audience }),
      ...(patch.products !== undefined && { products: patch.products }),
      ...(patch.terms !== undefined && { terms: patch.terms }),
      ...(patch.validFrom !== undefined && { validFrom: patch.validFrom }),
      ...(patch.validUntil !== undefined && { validUntil: patch.validUntil }),
      ...(patch.imageFileIds !== undefined && { imageFileIds: patch.imageFileIds }),
      ...(patch.category !== undefined && { category: patch.category }),
      ...(patch.governorateId !== undefined && { governorateId: patch.governorateId }),
      ...(patch.rejectionReasonKey !== undefined && {
        rejectionReasonKey: patch.rejectionReasonKey,
      }),
      ...(patch.publishedAt !== undefined && { publishedAt: patch.publishedAt }),
      ...(patch.reviewRequestedAt !== undefined && {
        reviewRequestedAt: patch.reviewRequestedAt,
      }),
      updatedAt: nowIso,
    }),
    delayMs: options.delayMs,
    forceErrorKind: options.forceErrorKind ?? null,
  });
}
