// In-memory AuthProvider. One session at a time.
// Sign-in accepts any non-empty email + password (demo mode is honest: no real auth).

import { AppError } from '@/core/errors';
import type { Result } from '@/core/result';

import type {
  AuthProvider,
  AuthSession,
  AuthUser,
  SignInCredentials,
} from '../contracts/auth';
import type { HealthCheckResult } from '../types';
import { DEFAULT_MOCK_CONFIG, simulateMockIO, stableHash, type MockProviderConfig } from './config';

const SESSION_TTL_MS = 60 * 60 * 1000;

function makeUser(email: string): AuthUser {
  const id = `demo-user-${stableHash(email)}`;
  return Object.freeze({
    id,
    email,
    phone: null,
    displayName: 'Demo User',
    dataOrigin: 'demo' as const,
    createdAt: new Date().toISOString(),
  });
}

function makeSession(user: AuthUser): AuthSession {
  return Object.freeze({
    user,
    expiresAt: new Date(Date.now() + SESSION_TTL_MS).toISOString(),
  });
}

export function createMockAuthProvider(
  config: MockProviderConfig = DEFAULT_MOCK_CONFIG,
): AuthProvider {
  let session: AuthSession | null = null;

  return Object.freeze({
    name: 'auth' as const,
    mode: 'mock' as const,
    capabilities: ['signIn', 'signOut', 'getSession', 'refreshSession'] as const,
    async healthCheck(): Promise<HealthCheckResult> {
      return { status: 'ok', checkedAt: Date.now() };
    },
    async signIn(credentials: SignInCredentials): Promise<Result<AuthSession>> {
      const failure = await simulateMockIO(config);
      if (failure) return { ok: false, error: failure };
      if (!credentials.email.trim() || !credentials.password.trim()) {
        return { ok: false, error: AppError.validation({ code: 'EMPTY_CREDENTIALS' }) };
      }
      session = makeSession(makeUser(credentials.email.trim()));
      return { ok: true, value: session };
    },
    async signOut(): Promise<Result<void>> {
      const failure = await simulateMockIO(config);
      if (failure) return { ok: false, error: failure };
      session = null;
      return { ok: true, value: undefined };
    },
    async getSession(): Promise<Result<AuthSession | null>> {
      const failure = await simulateMockIO(config);
      if (failure) return { ok: false, error: failure };
      return { ok: true, value: session };
    },
    async refreshSession(): Promise<Result<AuthSession | null>> {
      const failure = await simulateMockIO(config);
      if (failure) return { ok: false, error: failure };
      if (!session) return { ok: true, value: null };
      session = makeSession(session.user);
      return { ok: true, value: session };
    },
  });
}
