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
    }),
    applyUpdate: ({ existing, patch, nowIso }) => ({
      ...existing,
      ...(patch.titleKey !== undefined && { titleKey: patch.titleKey }),
      ...(patch.discountPercent !== undefined && { discountPercent: patch.discountPercent }),
      ...(patch.status !== undefined && { status: patch.status }),
      updatedAt: nowIso,
    }),
    delayMs: options.delayMs,
    forceErrorKind: options.forceErrorKind ?? null,
  });
}
