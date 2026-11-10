import { createIntegrationRegistry } from '@/providers/registry';
import { ALL_PROVIDER_NAMES } from '@/providers/types';

describe('IntegrationRegistry', () => {
  it('starts with all providers disabled', () => {
    const reg = createIntegrationRegistry();
    for (const name of ALL_PROVIDER_NAMES) {
      expect(reg.get(name).status).toBe('disabled');
    }
  });

  it('setStatus updates the record', () => {
    const reg = createIntegrationRegistry();
    reg.setStatus('auth', 'mock');
    expect(reg.get('auth').status).toBe('mock');
  });

  it('list returns 12 records in stable order', () => {
    const reg = createIntegrationRegistry();
    const list = reg.list();
    expect(list.length).toBe(12);
    expect(list.map((r) => r.name)).toEqual([...ALL_PROVIDER_NAMES]);
  });

  it('snapshot returns a frozen record keyed by provider name', () => {
    const reg = createIntegrationRegistry();
    const snap = reg.snapshot();
    expect(Object.isFrozen(snap)).toBe(true);
    expect(snap.auth.name).toBe('auth');
    expect(snap.database.name).toBe('database');
  });

  it('setHealthCheck ok promotes to connected', () => {
    const reg = createIntegrationRegistry();
    reg.setStatus('auth', 'configured');
    reg.setHealthCheck('auth', { status: 'ok', checkedAt: 1000 });
    expect(reg.get('auth').status).toBe('connected');
    expect(reg.get('auth').lastCheckedAt).toBe(1000);
  });

  it('setHealthCheck degraded promotes to connected', () => {
    const reg = createIntegrationRegistry();
    reg.setStatus('auth', 'configured');
    reg.setHealthCheck('auth', { status: 'degraded', checkedAt: 1000 });
    expect(reg.get('auth').status).toBe('connected');
  });

  it('setHealthCheck unavailable on configured → error', () => {
    const reg = createIntegrationRegistry();
    reg.setStatus('auth', 'configured');
    reg.setHealthCheck('auth', { status: 'unavailable', checkedAt: 1000 });
    expect(reg.get('auth').status).toBe('error');
  });

  it('setHealthCheck unavailable on mock stays mock', () => {
    const reg = createIntegrationRegistry();
    reg.setStatus('auth', 'mock');
    reg.setHealthCheck('auth', { status: 'unavailable', checkedAt: 1000 });
    expect(reg.get('auth').status).toBe('mock');
  });

  it('reset restores all to disabled', () => {
    const reg = createIntegrationRegistry();
    reg.setStatus('auth', 'mock');
    reg.setStatus('database', 'connected');
    reg.reset();
    for (const name of ALL_PROVIDER_NAMES) {
      expect(reg.get(name).status).toBe('disabled');
    }
  });

  it('unknown provider throws', () => {
    const reg = createIntegrationRegistry();
    // @ts-expect-error — deliberately invalid provider name.
    expect(() => reg.get('nonexistent')).toThrow(/unknown provider/);
  });
});
