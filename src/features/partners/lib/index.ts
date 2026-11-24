export type { CleanedPhone } from './phone';
export { cleanYemeniPhone } from './phone';
export type { ExternalKind, MapsPlatform, MapsTarget } from './external-links';
export {
  ALLOWED_EXTERNAL_PREFIXES,
  buildMapsUrl,
  buildTelUrl,
  buildWhatsAppUrl,
  isAllowedExternalUrl,
  requiresConfirmation,
} from './external-links';
export type { PartnerCategory } from './categories';
export { PARTNER_CATEGORIES, categoryLabelKey, isPartnerCategory } from './categories';
export type { OfferStats, OfferStatsInput } from './stats';
export { computeOfferStats, totalViews } from './stats';
export type { OfferFilters, PartnerFilters, VerificationIndex } from './filters';
export {
  DEFAULT_OFFER_FILTERS,
  DEFAULT_PARTNER_FILTERS,
  filterOffers,
  filterPartners,
  hasActivePartnerFilters,
} from './filters';
