// Public projection for unauthenticated surfaces (ADR-0050 pattern).
// Strips donorId, estimatedValue, handoverCode, ratings and exact addresses.
import type { SoukItem } from '@/repositories/contracts/souk';
import type { SoukRequest } from '@/repositories/contracts/souk-request';
import type { SoukCondition, SoukDeliveryMethod } from '@/repositories/contracts/souk';

export interface PublicSoukItemView {
  readonly id: string;
  readonly title: string | null;
  readonly titleKey: string;
  readonly category: string;
  readonly condition: SoukCondition;
  readonly deliveryMethod: SoukDeliveryMethod;
  readonly governorateId: string | null;
  readonly districtId: string | null;
  readonly description: string | null;
  readonly imageFileIds: readonly string[];
  readonly status: SoukItem['status'];
  readonly dataOrigin: SoukItem['dataOrigin'];
}

export function toPublicItemView(item: SoukItem): PublicSoukItemView {
  return Object.freeze({
    id: item.id,
    title: item.title ?? null,
    titleKey: item.titleKey,
    category: item.category,
    condition: item.condition ?? 'good',
    deliveryMethod: item.deliveryMethod ?? 'self_pickup',
    governorateId: item.governorateId ?? null,
    districtId: item.districtId ?? null,
    description: item.description ?? null,
    imageFileIds: item.imageFileIds ?? [],
    status: item.status,
    dataOrigin: item.dataOrigin,
  });
}

export interface PartyRequestView {
  readonly id: string;
  readonly itemId: string;
  readonly status: SoukRequest['status'];
  readonly reason: string;
  readonly handoverCode: string | null;
  readonly donorContactConsent: boolean;
  readonly recipientContactConsent: boolean;
  readonly donorConfirmedAt: string | null;
  readonly recipientConfirmedAt: string | null;
}

/** Party view keeps the code but NEVER the rating (staff-private, D-7). */
export function toPartyRequestView(request: SoukRequest): PartyRequestView {
  return Object.freeze({
    id: request.id,
    itemId: request.itemId,
    status: request.status,
    reason: request.reason,
    handoverCode: request.handoverCode ?? null,
    donorContactConsent: request.donorContactConsent,
    recipientContactConsent: request.recipientContactConsent,
    donorConfirmedAt: request.donorConfirmedAt ?? null,
    recipientConfirmedAt: request.recipientConfirmedAt ?? null,
  });
}
