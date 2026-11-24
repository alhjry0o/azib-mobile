// Pure discovery filters. Verification comes from the record index, never
// from Partner.status (D-3).
import type { Offer, OfferAudience } from '@/repositories/contracts/offer';
import type { Partner } from '@/repositories/contracts/partner';
import { isPublished } from '../state/expiry';
import { isVerified, type VerificationSnapshot } from '../state/verification';

export interface PartnerFilters {
  readonly text: string;
  readonly category: string | null;
  readonly governorateId: string | null;
  readonly verifiedOnly: boolean;
}

export const DEFAULT_PARTNER_FILTERS: PartnerFilters = Object.freeze({
  text: '',
  category: null,
  governorateId: null,
  verifiedOnly: false,
});

export type VerificationIndex = Readonly<Record<string, VerificationSnapshot | null>>;

function matchesText(haystack: readonly (string | null | undefined)[], needle: string): boolean {
  const query = needle.trim().toLowerCase();
  if (query.length === 0) return true;
  return haystack.some((value) => (value ?? '').toLowerCase().includes(query));
}

export function filterPartners(
  partners: readonly Partner[],
  filters: PartnerFilters,
  verifications: VerificationIndex,
  now: Date,
): readonly Partner[] {
  return partners.filter((partner) => {
    if (partner.status === 'suspended') return false;
    if (filters.category && partner.category !== filters.category) return false;
    if (filters.governorateId && partner.governorateId !== filters.governorateId) return false;
    if (!matchesText([partner.displayName, partner.description, partner.city], filters.text)) {
      return false;
    }
    if (filters.verifiedOnly && !isVerified(verifications[partner.id] ?? null, now)) return false;
    return true;
  });
}

export interface OfferFilters {
  readonly text: string;
  readonly category: string | null;
  readonly governorateId: string | null;
  readonly audience: OfferAudience | null;
  readonly includeExpired: boolean;
}

export const DEFAULT_OFFER_FILTERS: OfferFilters = Object.freeze({
  text: '',
  category: null,
  governorateId: null,
  audience: null,
  includeExpired: false,
});

export function filterOffers(
  offers: readonly Offer[],
  filters: OfferFilters,
  now: Date,
): readonly Offer[] {
  return offers.filter((offer) => {
    if (!filters.includeExpired && !isPublished(offer, now)) return false;
    if (filters.category && offer.category !== filters.category) return false;
    if (filters.governorateId && offer.governorateId !== filters.governorateId) return false;
    if (filters.audience && (offer.audience ?? 'beneficiaries') !== filters.audience) return false;
    return matchesText([offer.title, offer.titleKey, ...(offer.products ?? [])], filters.text);
  });
}

export function hasActivePartnerFilters(filters: PartnerFilters): boolean {
  return (
    filters.text.trim().length > 0 ||
    filters.category !== null ||
    filters.governorateId !== null ||
    filters.verifiedOnly
  );
}
