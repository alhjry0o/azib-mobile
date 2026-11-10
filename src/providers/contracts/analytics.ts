// AnalyticsProvider contract. Backed by a no-op in demo, by a provider (e.g. PostHog) in backend (P19).
//
// Rule: never pass PII in properties. Tests will reject emails, phones, tokens.

import type { Result } from '@/core/result';
import type { ProviderBase } from '../types';

export interface AnalyticsEvent {
  readonly name: string;
  readonly properties?: Readonly<Record<string, string | number | boolean>>;
}

export interface AnalyticsProvider extends ProviderBase {
  readonly name: 'analytics';
  track(event: AnalyticsEvent): Promise<Result<void>>;
  setUserId(userId: string | null): Promise<Result<void>>;
}
