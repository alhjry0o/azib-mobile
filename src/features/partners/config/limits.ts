// Provisional marketplace policy values (D-1, D-10). Read from system_settings
// when present; the fallback is never an approved policy.
import type { OfferAudience } from '@/repositories/contracts/offer';
import type { DocumentLimits } from '@/features/assistance/engine/rules.types';

/** Shared record with P10; each reader picks only its own field. */
export const SYSTEM_SETTINGS_KEY = 'system_settings';

/** PENDING_POLICY — provisional annual re-verification. */
export const DEFAULT_REVERIFICATION_DAYS = 365;
export const MIN_REVERIFICATION_DAYS = 30;
export const MAX_REVERIFICATION_DAYS = 1825;

/** PENDING_POLICY — only approved beneficiaries may benefit for now. */
export const DEFAULT_OFFER_AUDIENCE: OfferAudience = 'beneficiaries';

/** Operational upload limits for partner media and verification documents. */
export const PARTNER_MEDIA_LIMITS: DocumentLimits = Object.freeze({
  imageMaxBytes: 5 * 1024 * 1024,
  pdfMaxBytes: 10 * 1024 * 1024,
  allowedMimeTypes: Object.freeze(['image/jpeg', 'image/png', 'application/pdf']),
});

export const MAX_PARTNER_IMAGES = 6;
export const MAX_VERIFICATION_DOCUMENTS = 4;

export interface AudienceOption {
  readonly value: OfferAudience;
  readonly labelKey: string;
  readonly enabled: boolean;
  readonly disabledReasonKey: string | null;
}

export const AUDIENCE_OPTIONS: readonly AudienceOption[] = Object.freeze([
  Object.freeze({
    value: 'beneficiaries',
    labelKey: 'marketplace:audience.beneficiaries',
    enabled: true,
    disabledReasonKey: null,
  }),
  Object.freeze({
    value: 'everyone',
    labelKey: 'marketplace:audience.everyone',
    enabled: false,
    disabledReasonKey: 'marketplace:audience.pendingPolicy',
  }),
  Object.freeze({
    value: 'engaged',
    labelKey: 'marketplace:audience.engaged',
    enabled: false,
    disabledReasonKey: 'marketplace:audience.pendingPolicy',
  }),
] as const);

export function resolveReverificationDays(value: unknown): number {
  if (typeof value !== 'object' || value === null) return DEFAULT_REVERIFICATION_DAYS;
  const raw = (value as Record<string, unknown>).reverificationDays;
  if (typeof raw !== 'number' || !Number.isInteger(raw)) return DEFAULT_REVERIFICATION_DAYS;
  if (raw < MIN_REVERIFICATION_DAYS || raw > MAX_REVERIFICATION_DAYS) {
    return DEFAULT_REVERIFICATION_DAYS;
  }
  return raw;
}

export function resolveOfferAudience(value: unknown): OfferAudience {
  if (typeof value !== 'object' || value === null) return DEFAULT_OFFER_AUDIENCE;
  const raw = (value as Record<string, unknown>).offerAudience;
  const option = AUDIENCE_OPTIONS.find((o) => o.value === raw);
  if (!option || !option.enabled) return DEFAULT_OFFER_AUDIENCE;
  return option.value;
}

export function audienceOption(value: OfferAudience): AudienceOption {
  return AUDIENCE_OPTIONS.find((o) => o.value === value) ?? AUDIENCE_OPTIONS[0]!;
}
