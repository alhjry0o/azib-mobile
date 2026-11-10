// IntegrationRegistry tracks the runtime status of every provider.
// The UI (Developer Settings, P05) reads this to display connection state.
// The ProviderContainer (Part 3b) populates it on init.

import { ALL_PROVIDER_NAMES, type HealthCheckResult, type IntegrationRecord, type ProviderName, type ProviderStatus } from './types';

export class IntegrationRegistry {
  private readonly records: Map<ProviderName, IntegrationRecord>;

  constructor() {
    this.records = new Map();
    this.reset();
  }

  reset(): void {
    this.records.clear();
    for (const name of ALL_PROVIDER_NAMES) {
      this.records.set(name, Object.freeze({ name, status: 'disabled' as ProviderStatus }));
    }
  }

  setStatus(name: ProviderName, status: ProviderStatus): void {
    const prev = this.records.get(name);
    this.records.set(
      name,
      Object.freeze({
        name,
        status,
        healthCheck: prev?.healthCheck,
        lastCheckedAt: prev?.lastCheckedAt,
      }),
    );
  }

  setHealthCheck(name: ProviderName, result: HealthCheckResult): void {
    const prev = this.records.get(name);
    if (!prev) {
      throw new Error(`IntegrationRegistry: unknown provider "${name}"`);
    }
    let status: ProviderStatus = prev.status;
    if (result.status === 'ok') status = 'connected';
    else if (result.status === 'degraded') status = 'connected';
    else if (result.status === 'unavailable') {
      if (prev.status === 'mock') status = 'mock';
      else status = 'error';
    }
    this.records.set(
      name,
      Object.freeze({
        name,
        status,
        healthCheck: result,
        lastCheckedAt: result.checkedAt,
      }),
    );
  }

  get(name: ProviderName): IntegrationRecord {
    const r = this.records.get(name);
    if (!r) throw new Error(`IntegrationRegistry: unknown provider "${name}"`);
    return r;
  }

  list(): readonly IntegrationRecord[] {
    return ALL_PROVIDER_NAMES.map((n) => this.get(n));
  }

  snapshot(): Readonly<Record<ProviderName, IntegrationRecord>> {
    const out = {} as Record<ProviderName, IntegrationRecord>;
    for (const name of ALL_PROVIDER_NAMES) {
      out[name] = this.get(name);
    }
    return Object.freeze(out);
  }
}

/** Global registry. Populated by the ProviderContainer. */
export const integrationRegistry = new IntegrationRegistry();

/** Factory for tests to get an isolated registry. */
export function createIntegrationRegistry(): IntegrationRegistry {
  return new IntegrationRegistry();
}
