// NotConnected provider stubs. Returned by the ProviderContainer in backend mode
// when the backend adapter has not yet been implemented (P03) or when env is missing.
//
// Every method returns a `Result` with `AppError.notConnected()`.
// healthCheck() returns 'unavailable'.

import { AppError } from '@/core/errors';
import type { Result } from '@/core/result';

import type {
  AiProvider,
  AiScoreInput,
  AiScoreOutput,
  AnalyticsEvent,
  AnalyticsProvider,
  AuthProvider,
  AuthSession,
  ContentArticle,
  ContentProvider,
  Coordinates,
  DatabaseProvider,
  DonationPledge,
  EmailMessage,
  EmailProvider,
  FileStorageProvider,
  FileUploadOptions,
  MapsProvider,
  NotificationProvider,
  PaymentProvider,
  PermissionStatus,
  PledgeRecord,
  PushNotificationPayload,
  SearchHit,
  SearchProvider,
  SearchQuery,
  SignInCredentials,
  SmsMessage,
  SmsProvider,
  UploadedFile,
} from '../contracts';
import type { HealthCheckResult, ProviderBase, ProviderName } from '../types';

async function nc<T>(method: string): Promise<Result<T>> {
  return {
    ok: false,
    error: AppError.notConnected({
      code: 'PROVIDER_NOT_CONNECTED',
      context: { method },
    }),
  };
}

function unavailable(name: ProviderName): () => Promise<HealthCheckResult> {
  return async () => ({
    status: 'unavailable',
    message: `${name}: backend adapter not connected`,
    checkedAt: Date.now(),
  });
}

function base(name: ProviderName, capabilities: ReadonlyArray<string>): ProviderBase {
  return {
    name,
    mode: 'backend',
    capabilities,
    healthCheck: unavailable(name),
  };
}

export function createNotConnectedAuthProvider(): AuthProvider {
  return Object.freeze({
    ...base('auth', ['signIn', 'signOut', 'getSession', 'refreshSession']),
    name: 'auth' as const,
    mode: 'backend' as const,
    signIn: (_c: SignInCredentials) => nc<AuthSession>('auth.signIn'),
    signOut: () => nc<void>('auth.signOut'),
    getSession: () => nc<AuthSession | null>('auth.getSession'),
    refreshSession: () => nc<AuthSession | null>('auth.refreshSession'),
  });
}

export function createNotConnectedDatabaseProvider(): DatabaseProvider {
  return Object.freeze({
    ...base('database', []),
    name: 'database' as const,
    mode: 'backend' as const,
  });
}

export function createNotConnectedStorageProvider(): FileStorageProvider {
  return Object.freeze({
    ...base('storage', ['uploadFile', 'deleteFile', 'getPublicUrl']),
    name: 'storage' as const,
    mode: 'backend' as const,
    uploadFile: (_u: string, _o?: FileUploadOptions) => nc<UploadedFile>('storage.uploadFile'),
    deleteFile: (_id: string) => nc<void>('storage.deleteFile'),
    getPublicUrl: (_id: string) => nc<string>('storage.getPublicUrl'),
  });
}

export function createNotConnectedNotificationProvider(): NotificationProvider {
  return Object.freeze({
    ...base('notification', ['requestPermission', 'scheduleLocal', 'cancelScheduled']),
    name: 'notification' as const,
    mode: 'backend' as const,
    requestPermission: () => nc<PermissionStatus>('notification.requestPermission'),
    scheduleLocal: (_p: PushNotificationPayload, _s: number) =>
      nc<string>('notification.scheduleLocal'),
    cancelScheduled: (_id: string) => nc<void>('notification.cancelScheduled'),
  });
}

export function createNotConnectedPaymentProvider(): PaymentProvider {
  return Object.freeze({
    ...base('payment', ['recordPledge', 'verifyExternalPayment']),
    name: 'payment' as const,
    mode: 'backend' as const,
    recordPledge: (_p: DonationPledge) => nc<PledgeRecord>('payment.recordPledge'),
    verifyExternalPayment: (_r: string) =>
      nc<PledgeRecord | null>('payment.verifyExternalPayment'),
  });
}

export function createNotConnectedEmailProvider(): EmailProvider {
  return Object.freeze({
    ...base('email', ['send']),
    name: 'email' as const,
    mode: 'backend' as const,
    send: (_m: EmailMessage) => nc<{ id: string }>('email.send'),
  });
}

export function createNotConnectedSmsProvider(): SmsProvider {
  return Object.freeze({
    ...base('sms', ['send']),
    name: 'sms' as const,
    mode: 'backend' as const,
    send: (_m: SmsMessage) => nc<{ id: string }>('sms.send'),
  });
}

export function createNotConnectedAnalyticsProvider(): AnalyticsProvider {
  return Object.freeze({
    ...base('analytics', ['track', 'setUserId']),
    name: 'analytics' as const,
    mode: 'backend' as const,
    track: (_e: AnalyticsEvent) => nc<void>('analytics.track'),
    setUserId: (_id: string | null) => nc<void>('analytics.setUserId'),
  });
}

export function createNotConnectedMapsProvider(): MapsProvider {
  return Object.freeze({
    ...base('maps', ['geocode', 'reverseGeocode']),
    name: 'maps' as const,
    mode: 'backend' as const,
    geocode: (_a: string) => nc<Coordinates | null>('maps.geocode'),
    reverseGeocode: (_c: Coordinates) => nc<string | null>('maps.reverseGeocode'),
  });
}

export function createNotConnectedSearchProvider(): SearchProvider {
  return Object.freeze({
    ...base('search', ['query']),
    name: 'search' as const,
    mode: 'backend' as const,
    query: <T = Record<string, unknown>,>(_q: SearchQuery) => nc<SearchHit<T>[]>('search.query'),
  });
}

export function createNotConnectedAiProvider(): AiProvider {
  return Object.freeze({
    ...base('ai', ['scoreEligibility']),
    name: 'ai' as const,
    mode: 'backend' as const,
    scoreEligibility: (_i: AiScoreInput) => nc<AiScoreOutput>('ai.scoreEligibility'),
  });
}

export function createNotConnectedContentProvider(): ContentProvider {
  return Object.freeze({
    ...base('content', ['getArticleBySlug', 'listArticles']),
    name: 'content' as const,
    mode: 'backend' as const,
    getArticleBySlug: (_s: string) => nc<ContentArticle | null>('content.getArticleBySlug'),
    listArticles: () => nc<ReadonlyArray<ContentArticle>>('content.listArticles'),
  });
}

// PlaceResult is imported for type-checking above; keep the reference to avoid unused import.
void ({} as PlaceResult);
