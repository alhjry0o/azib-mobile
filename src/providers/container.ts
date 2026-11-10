// ProviderContainer — dependency injection for the 12 providers.
// Chooses mock adapters in demo mode, NotConnected stubs in backend mode
// (until the real backend adapters land in P18).
// Populates the IntegrationRegistry on creation.

import type { AppEnv } from '@/config/env';

import type {
  AiProvider,
  AnalyticsProvider,
  AuthProvider,
  ContentProvider,
  DatabaseProvider,
  EmailProvider,
  FileStorageProvider,
  MapsProvider,
  NotificationProvider,
  PaymentProvider,
  SearchProvider,
  SmsProvider,
} from './contracts';
import {
  createMockAiProvider,
  createMockAnalyticsProvider,
  createMockAuthProvider,
  createMockContentProvider,
  createMockDatabaseProvider,
  createMockEmailProvider,
  createMockMapsProvider,
  createMockNotificationProvider,
  createMockPaymentProvider,
  createMockSearchProvider,
  createMockSmsProvider,
  createMockStorageProvider,
  withConfig,
  type MockProviderConfig,
} from './mock';
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
} from './not-connected';
import { IntegrationRegistry } from './registry';
import type { ProviderMode } from './types';

export interface ProviderContainer {
  readonly mode: ProviderMode;
  readonly auth: AuthProvider;
  readonly database: DatabaseProvider;
  readonly storage: FileStorageProvider;
  readonly notification: NotificationProvider;
  readonly payment: PaymentProvider;
  readonly email: EmailProvider;
  readonly sms: SmsProvider;
  readonly analytics: AnalyticsProvider;
  readonly maps: MapsProvider;
  readonly search: SearchProvider;
  readonly ai: AiProvider;
  readonly content: ContentProvider;
  readonly registry: IntegrationRegistry;
  /** Runs healthCheck() on all providers and updates the registry. */
  healthCheckAll(): Promise<void>;
}

export interface CreateContainerOptions {
  readonly mode: ProviderMode;
  readonly env: AppEnv;
  readonly mockConfig?: Partial<MockProviderConfig>;
}

export function createProviderContainer(options: CreateContainerOptions): ProviderContainer {
  const registry = new IntegrationRegistry();
  const mockConfig = withConfig(options.mockConfig);

  if (options.mode === 'demo') {
    return Object.freeze(buildDemoContainer(registry, mockConfig));
  }
  return Object.freeze(buildBackendContainer(registry, options.env));
}

function buildDemoContainer(
  registry: IntegrationRegistry,
  mockConfig: MockProviderConfig,
): ProviderContainer {
  const auth = createMockAuthProvider(mockConfig);
  const database = createMockDatabaseProvider(mockConfig);
  const storage = createMockStorageProvider(mockConfig);
  const notification = createMockNotificationProvider(mockConfig);
  const payment = createMockPaymentProvider(mockConfig);
  const email = createMockEmailProvider(mockConfig);
  const sms = createMockSmsProvider(mockConfig);
  const analytics = createMockAnalyticsProvider(mockConfig);
  const maps = createMockMapsProvider(mockConfig);
  const search = createMockSearchProvider(mockConfig);
  const ai = createMockAiProvider(mockConfig);
  const content = createMockContentProvider(mockConfig);

  for (const name of [
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
  ] as const) {
    registry.setStatus(name, 'mock');
  }

  return {
    mode: 'demo',
    auth,
    database,
    storage,
    notification,
    payment,
    email,
    sms,
    analytics,
    maps,
    search,
    ai,
    content,
    registry,
    async healthCheckAll(): Promise<void> {
      for (const p of [
        auth,
        database,
        storage,
        notification,
        payment,
        email,
        sms,
        analytics,
        maps,
        search,
        ai,
        content,
      ]) {
        const result = await p.healthCheck();
        registry.setHealthCheck(p.name, result);
      }
    },
  };
}

function buildBackendContainer(
  registry: IntegrationRegistry,
  env: AppEnv,
): ProviderContainer {
  const auth = createNotConnectedAuthProvider();
  const database = createNotConnectedDatabaseProvider();
  const storage = createNotConnectedStorageProvider();
  const notification = createNotConnectedNotificationProvider();
  const payment = createNotConnectedPaymentProvider();
  const email = createNotConnectedEmailProvider();
  const sms = createNotConnectedSmsProvider();
  const analytics = createNotConnectedAnalyticsProvider();
  const maps = createNotConnectedMapsProvider();
  const search = createNotConnectedSearchProvider();
  const ai = createNotConnectedAiProvider();
  const content = createNotConnectedContentProvider();

  const status = env.isSupabaseConfigured ? 'configured' : 'disabled';
  for (const name of [
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
  ] as const) {
    registry.setStatus(name, status);
  }

  return {
    mode: 'backend',
    auth,
    database,
    storage,
    notification,
    payment,
    email,
    sms,
    analytics,
    maps,
    search,
    ai,
    content,
    registry,
    async healthCheckAll(): Promise<void> {
      for (const p of [
        auth,
        database,
        storage,
        notification,
        payment,
        email,
        sms,
        analytics,
        maps,
        search,
        ai,
        content,
      ]) {
        const result = await p.healthCheck();
        registry.setHealthCheck(p.name, result);
      }
    },
  };
}
