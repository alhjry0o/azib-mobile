// Operational job values (D-6). Read from system_settings; every fallback is
// provisional and never an approved policy.
import type { RateLimitConfig } from '@/features/weddings/chat/rate-limit';
import type { DocumentLimits } from '@/features/assistance/engine/rules.types';

/** Shared record with P10–P12; each reader picks only its own fields. */
export const SYSTEM_SETTINGS_KEY = 'system_settings';

/** PENDING_POLICY — provisional until the owner approves. */
export const DEFAULT_JOB_EXPIRY_DAYS = 30;
export const DEFAULT_MAX_ACTIVE_APPLICATIONS = 5;
/** Review before publication can be switched ON from settings at first abuse. */
export const DEFAULT_JOB_REQUIRE_REVIEW = false;

export const DEFAULT_JOB_PUBLISH_RATE: RateLimitConfig = Object.freeze({
  maxMessages: 3,
  windowMs: 60 * 60 * 1000,
});
export const DEFAULT_JOB_APPLY_RATE: RateLimitConfig = Object.freeze({
  maxMessages: 5,
  windowMs: 60 * 60 * 1000,
});

/**
 * Job-owned CV limits. Deliberately NOT borrowed from partners/souk so a change
 * there can never silently change job behaviour (P12 lesson).
 */
export const JOB_CV_LIMITS: DocumentLimits = Object.freeze({
  imageMaxBytes: 5 * 1024 * 1024,
  pdfMaxBytes: 10 * 1024 * 1024,
  allowedMimeTypes: Object.freeze(['image/jpeg', 'image/png', 'application/pdf']),
});

export interface JobLimits {
  readonly jobExpiryDays: number;
  readonly maxActiveApplications: number;
  readonly requireReview: boolean;
  readonly publishRate: RateLimitConfig;
  readonly applyRate: RateLimitConfig;
}

export const DEFAULT_JOB_LIMITS: JobLimits = Object.freeze({
  jobExpiryDays: DEFAULT_JOB_EXPIRY_DAYS,
  maxActiveApplications: DEFAULT_MAX_ACTIVE_APPLICATIONS,
  requireReview: DEFAULT_JOB_REQUIRE_REVIEW,
  publishRate: DEFAULT_JOB_PUBLISH_RATE,
  applyRate: DEFAULT_JOB_APPLY_RATE,
});

function positiveInt(value: unknown, fallback: number, max: number): number {
  if (typeof value !== 'number' || !Number.isInteger(value)) return fallback;
  if (value < 1 || value > max) return fallback;
  return value;
}

export function resolveJobLimits(value: unknown): JobLimits {
  if (typeof value !== 'object' || value === null) return DEFAULT_JOB_LIMITS;
  const raw = value as Record<string, unknown>;
  return Object.freeze({
    jobExpiryDays: positiveInt(raw.jobExpiryDays, DEFAULT_JOB_EXPIRY_DAYS, 365),
    maxActiveApplications: positiveInt(
      raw.jobMaxActiveApplications,
      DEFAULT_MAX_ACTIVE_APPLICATIONS,
      50,
    ),
    requireReview:
      typeof raw.jobRequireReview === 'boolean'
        ? raw.jobRequireReview
        : DEFAULT_JOB_REQUIRE_REVIEW,
    publishRate: DEFAULT_JOB_PUBLISH_RATE,
    applyRate: DEFAULT_JOB_APPLY_RATE,
  });
}
