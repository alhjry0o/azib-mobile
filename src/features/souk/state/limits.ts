// Operational Souk values (D-4). Read from system_settings; every fallback is
// provisional and never an approved policy.
import type { RateLimitConfig } from '@/features/weddings/chat/rate-limit';
import type { DocumentLimits } from '@/features/assistance/engine/rules.types';

/** Shared record with P10/P11; each reader picks only its own fields. */
export const SYSTEM_SETTINGS_KEY = 'system_settings';

/** PENDING_POLICY — provisional until the owner approves. */
export const DEFAULT_MAX_ACTIVE_REQUESTS = 3;
export const DEFAULT_MAX_ITEM_IMAGES = 4;
export const DEFAULT_ITEM_EXPIRY_DAYS = 60;
export const DEFAULT_REQUIRE_ITEM_REVIEW = false;

export const DEFAULT_ITEM_CREATE_RATE: RateLimitConfig = Object.freeze({
  maxMessages: 3,
  windowMs: 60 * 60 * 1000,
});
export const DEFAULT_REQUEST_CREATE_RATE: RateLimitConfig = Object.freeze({
  maxMessages: 5,
  windowMs: 60 * 60 * 1000,
});
export const DEFAULT_SOUK_CHAT_RATE: RateLimitConfig = Object.freeze({
  maxMessages: 10,
  windowMs: 60 * 1000,
});

/**
 * Souk-owned media limits. Deliberately NOT imported from partners/config:
 * changing partner limits must never silently change Souk behaviour.
 */
export const SOUK_MEDIA_LIMITS: DocumentLimits = Object.freeze({
  imageMaxBytes: 5 * 1024 * 1024,
  pdfMaxBytes: 10 * 1024 * 1024,
  allowedMimeTypes: Object.freeze(['image/jpeg', 'image/png', 'application/pdf']),
});

export interface SoukLimits {
  readonly maxActiveRequests: number;
  readonly maxItemImages: number;
  readonly itemExpiryDays: number;
  readonly requireItemReview: boolean;
  readonly itemCreateRate: RateLimitConfig;
  readonly requestCreateRate: RateLimitConfig;
}

export const DEFAULT_SOUK_LIMITS: SoukLimits = Object.freeze({
  maxActiveRequests: DEFAULT_MAX_ACTIVE_REQUESTS,
  maxItemImages: DEFAULT_MAX_ITEM_IMAGES,
  itemExpiryDays: DEFAULT_ITEM_EXPIRY_DAYS,
  requireItemReview: DEFAULT_REQUIRE_ITEM_REVIEW,
  itemCreateRate: DEFAULT_ITEM_CREATE_RATE,
  requestCreateRate: DEFAULT_REQUEST_CREATE_RATE,
});

function positiveInt(value: unknown, fallback: number, max: number): number {
  if (typeof value !== 'number' || !Number.isInteger(value)) return fallback;
  if (value < 1 || value > max) return fallback;
  return value;
}

export function resolveSoukLimits(value: unknown): SoukLimits {
  if (typeof value !== 'object' || value === null) return DEFAULT_SOUK_LIMITS;
  const raw = value as Record<string, unknown>;
  return Object.freeze({
    maxActiveRequests: positiveInt(raw.soukMaxActiveRequests, DEFAULT_MAX_ACTIVE_REQUESTS, 20),
    maxItemImages: positiveInt(raw.soukMaxItemImages, DEFAULT_MAX_ITEM_IMAGES, 12),
    itemExpiryDays: positiveInt(raw.soukItemExpiryDays, DEFAULT_ITEM_EXPIRY_DAYS, 365),
    // Review can be switched ON from settings at the first abuse (D-4).
    requireItemReview:
      typeof raw.soukRequireItemReview === 'boolean'
        ? raw.soukRequireItemReview
        : DEFAULT_REQUIRE_ITEM_REVIEW,
    itemCreateRate: DEFAULT_ITEM_CREATE_RATE,
    requestCreateRate: DEFAULT_REQUEST_CREATE_RATE,
  });
}

const DAY_MS = 24 * 60 * 60 * 1000;

export function itemExpiryFrom(publishedAt: string, expiryDays: number): string | null {
  const stamp = Date.parse(publishedAt);
  if (Number.isNaN(stamp) || !Number.isFinite(expiryDays) || expiryDays <= 0) return null;
  return new Date(stamp + expiryDays * DAY_MS).toISOString();
}

export function isItemExpired(expiresAt: string | null | undefined, now: Date): boolean {
  if (!expiresAt) return false;
  const stamp = Date.parse(expiresAt);
  if (Number.isNaN(stamp)) return false;
  return stamp <= now.getTime();
}
