import {
  createNotConnectedAiProvider,
  createNotConnectedAnalyticsProvider,
  createNotConnectedAuthProvider,
  createNotConnectedContentProvider,
  createNotConnectedDatabaseProvider,
  createNotConnectedEmailProvider,
  createNotConnectedMapsProvider,
  createNotConnectedNotificationProvider,
  createNotConnectedPaymentProvider,
  createNotConnectedSearchProvider,
  createNotConnectedSmsProvider,
  createNotConnectedStorageProvider,
} from '@/providers/not-connected';
import { ALL_PROVIDER_NAMES } from '@/providers/types';

const factories = {
  auth: createNotConnectedAuthProvider,
  database: createNotConnectedDatabaseProvider,
  storage: createNotConnectedStorageProvider,
  notification: createNotConnectedNotificationProvider,
  payment: createNotConnectedPaymentProvider,
  email: createNotConnectedEmailProvider,
  sms: createNotConnectedSmsProvider,
  analytics: createNotConnectedAnalyticsProvider,
  maps: createNotConnectedMapsProvider,
  search: createNotConnectedSearchProvider,
  ai: createNotConnectedAiProvider,
  content: createNotConnectedContentProvider,
} as const;

describe('NotConnected provider stubs', () => {
  it('covers all 12 providers', () => {
    expect(Object.keys(factories).sort()).toEqual([...ALL_PROVIDER_NAMES].sort());
  });

  for (const name of ALL_PROVIDER_NAMES) {
    describe(name, () => {
      const provider = (factories as Record<string, () => unknown>)[name]?.() as {
        name: string;
        mode: string;
        capabilities: ReadonlyArray<string>;
        healthCheck: () => Promise<{ status: string }>;
      };

      it('has correct name and mode', () => {
        expect(provider.name).toBe(name);
        expect(provider.mode).toBe('backend');
      });

      it('declares capabilities that exist as methods', () => {
        const asRecord = provider as unknown as Record<string, unknown>;
        for (const cap of provider.capabilities) {
          expect(typeof asRecord[cap]).toBe('function');
        }
      });

      it('healthCheck returns unavailable', async () => {
        const hc = await provider.healthCheck();
        expect(hc.status).toBe('unavailable');
      });
    });
  }

  it('auth.signIn returns notConnected error', async () => {
    const auth = createNotConnectedAuthProvider();
    const r = await auth.signIn({ email: 'x@y.z', password: 'p' });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.kind).toBe('NotConnected');
      expect(r.error.meta.code).toBe('PROVIDER_NOT_CONNECTED');
    }
  });

  it('payment interface does not expose forbidden methods', () => {
    const pay = createNotConnectedPaymentProvider();
    const keys = Object.keys(pay);
    for (const forbidden of [
      'charge',
      'capture',
      'refund',
      'createIntent',
      'createPaymentMethod',
    ]) {
      expect(keys).not.toContain(forbidden);
    }
  });

  it('ai interface does not expose decisive methods', () => {
    const ai = createNotConnectedAiProvider();
    const keys = Object.keys(ai);
    for (const forbidden of ['decide', 'approve', 'reject', 'block']) {
      expect(keys).not.toContain(forbidden);
    }
  });

  it('providers are frozen', () => {
    const auth = createNotConnectedAuthProvider();
    expect(Object.isFrozen(auth)).toBe(true);
  });
});
