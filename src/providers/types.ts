// Shared types for the Provider Abstraction layer.
// Every provider (auth, database, storage, ...) implements ProviderBase
// plus its own contract from ./contracts/*.

export type ProviderName =
  | 'auth'
  | 'database'
  | 'storage'
  | 'notification'
  | 'payment'
  | 'email'
  | 'sms'
  | 'analytics'
  | 'maps'
  | 'search'
  | 'ai'
  | 'content';

export type ProviderMode = 'mock' | 'backend';

/**
 * Runtime status of an integration, tracked by IntegrationRegistry.
 * - mock: using a mock adapter (demo mode)
 * - configured: backend env present, adapter instantiated, health check not yet run
 * - connected: backend healthy, ready for use
 * - disabled: adapter unavailable (missing env, or backend not yet implemented)
 * - error: health check failed
 */
export type ProviderStatus = 'mock' | 'configured' | 'connected' | 'disabled' | 'error';

export type HealthStatus = 'ok' | 'degraded' | 'unavailable';

export interface HealthCheckResult {
  readonly status: HealthStatus;
  /** Diagnostic message. Not user-facing. */
  readonly message?: string;
  /** Epoch milliseconds. */
  readonly checkedAt: number;
}

export interface ProviderBase {
  readonly name: ProviderName;
  readonly mode: ProviderMode;
  /**
   * Names of the methods this provider exposes beyond ProviderBase.
   * Must be a subset of Object.keys(provider). Verified by tests.
   */
  readonly capabilities: readonly string[];
  healthCheck(): Promise<HealthCheckResult>;
}

export interface IntegrationRecord {
  readonly name: ProviderName;
  readonly status: ProviderStatus;
  readonly healthCheck?: HealthCheckResult;
  readonly lastCheckedAt?: number;
}

export const ALL_PROVIDER_NAMES: readonly ProviderName[] = [
  'auth',
  'database',
  'storage',
  'notification',
  'payment',
  'email',
  'sms',
  'analytics',
  'maps',
  'search',
  'ai',
  'content',
] as const;
