// In-memory demo AuthProvider (P06.1).
// Honest demo: no real credentials, no SMS, no network. Passwords live only in
// memory for verification and are NEVER logged or returned in any Result.
// Backward compatible: signIn still accepts any non-empty email + password for
// an unknown address (P03/P05 behaviour and tests).
import { AppError } from '@/core/errors';
import type { Result } from '@/core/result';
import { SignUpSchema } from '@/schemas/auth';
import type {
  AuthChallenge,
  AuthConsent,
  AuthProvider,
  AuthRole,
  AuthSession,
  AuthUser,
  RequestPasswordResetInput,
  RequestVerificationInput,
  ResetPasswordInput,
  SignInCredentials,
  SignUpInput,
  VerifyInput,
} from '../contracts/auth';
import type { HealthCheckResult } from '../types';
import { DEFAULT_MOCK_CONFIG, simulateMockIO, stableHash, type MockProviderConfig } from './config';

const SESSION_TTL_MS = 60 * 60 * 1000;
const CHALLENGE_TTL_MS = 10 * 60 * 1000;
const RESEND_COOLDOWN_MS = 30_000;
const MAX_OTP_ATTEMPTS = 5;
const MAX_SIGN_IN_FAILURES = 5;
const LOCK_MS = 60_000;

interface DemoUser {
  id: string;
  email: string;
  password: string;
  displayName: string;
  roles: AuthRole[];
  consents: readonly AuthConsent[];
  verified: boolean;
  createdAt: string;
}

interface Challenge {
  id: string;
  kind: 'verify' | 'reset';
  target: string;
  code: string;
  expiresAt: number;
  attempts: number;
  sentAt: number;
}

export interface MockAuthProvider extends AuthProvider {
  /** Demo-only: role switcher in (dev). Never part of the production contract. */
  __setRoles(roles: readonly AuthRole[]): void;
  __demoCodeFor(target: string): string | null;
  __reset(): void;
}

export function isMockAuthProvider(provider: AuthProvider): provider is MockAuthProvider {
  return (
    provider.mode === 'mock' &&
    typeof (provider as unknown as Record<string, unknown>).__setRoles === 'function'
  );
}

function demoCodeFor(id: string): string {
  const digits = stableHash(id).replace(/\D/g, '');
  return (digits + '123456').slice(0, 6);
}

export function createMockAuthProvider(
  config: MockProviderConfig = DEFAULT_MOCK_CONFIG,
): MockAuthProvider {
  const users = new Map<string, DemoUser>();
  const challenges = new Map<string, Challenge>();
  const failures = new Map<string, { count: number; lockedUntil: number }>();
  let session: AuthSession | null = null;

  const toUser = (u: DemoUser): AuthUser =>
    Object.freeze({
      id: u.id,
      email: u.email,
      phone: null,
      displayName: u.displayName,
      dataOrigin: 'demo' as const,
      createdAt: u.createdAt,
      roles: Object.freeze([...u.roles]),
      consents: u.consents,
    });

  const makeSession = (u: DemoUser): AuthSession => {
    const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString();
    const seed = stableHash(`${u.id}:${Date.now()}`);
    return Object.freeze({
      user: toUser(u),
      expiresAt,
      tokens: Object.freeze({
        accessToken: `demo-access-${seed}`,
        refreshToken: `demo-refresh-${seed}`,
        expiresAt,
      }),
      pendingVerification: u.verified ? null : { channel: 'email' as const, target: u.email },
    });
  };

  const issue = (kind: Challenge['kind'], target: string): Result<AuthChallenge> => {
    for (const c of challenges.values()) {
      if (c.target === target && c.kind === kind && Date.now() - c.sentAt < RESEND_COOLDOWN_MS) {
        return { ok: false, error: AppError.auth({ code: 'OTP_RESEND_COOLDOWN' }) };
      }
    }
    const id = `demo-${kind}-${stableHash(`${target}:${Date.now()}`)}`;
    const challenge: Challenge = {
      id,
      kind,
      target,
      code: demoCodeFor(id),
      expiresAt: Date.now() + CHALLENGE_TTL_MS,
      attempts: 0,
      sentAt: Date.now(),
    };
    challenges.set(id, challenge);
    return {
      ok: true,
      value: Object.freeze({
        id,
        channel: 'email' as const,
        target,
        expiresAt: new Date(challenge.expiresAt).toISOString(),
        demoCode: challenge.code,
      }),
    };
  };

  const consume = (
    kind: Challenge['kind'],
    code: string,
    challengeId?: string,
  ): Result<Challenge> => {
    const found = challengeId
      ? challenges.get(challengeId)
      : [...challenges.values()].reverse().find((c) => c.kind === kind);
    if (!found || found.kind !== kind) {
      return { ok: false, error: AppError.auth({ code: 'CHALLENGE_NOT_FOUND' }) };
    }
    if (Date.now() > found.expiresAt) {
      challenges.delete(found.id);
      return { ok: false, error: AppError.auth({ code: 'OTP_EXPIRED' }) };
    }
    if (found.attempts >= MAX_OTP_ATTEMPTS) {
      return { ok: false, error: AppError.auth({ code: 'OTP_MAX_ATTEMPTS' }) };
    }
    if (found.code !== code) {
      found.attempts += 1;
      return {
        ok: false,
        error: AppError.auth({
          code: 'OTP_INVALID',
          context: { attemptsLeft: MAX_OTP_ATTEMPTS - found.attempts },
        }),
      };
    }
    challenges.delete(found.id);
    return { ok: true, value: found };
  };

  return Object.freeze({
    name: 'auth' as const,
    mode: 'mock' as const,
    channels: ['email'] as const,
    capabilities: [
      'signIn',
      'signOut',
      'getSession',
      'refreshSession',
      'signUp',
      'requestVerification',
      'verify',
      'requestPasswordReset',
      'resetPassword',
    ] as const,

    async healthCheck(): Promise<HealthCheckResult> {
      return { status: 'ok', checkedAt: Date.now() };
    },

    async signIn(credentials: SignInCredentials): Promise<Result<AuthSession>> {
      const failure = await simulateMockIO(config);
      if (failure) return { ok: false, error: failure };
      const email = credentials.email.trim().toLowerCase();
      if (!email || !credentials.password.trim()) {
        return { ok: false, error: AppError.validation({ code: 'EMPTY_CREDENTIALS' }) };
      }
      const lock = failures.get(email);
      if (lock && lock.lockedUntil > Date.now()) {
        return { ok: false, error: AppError.auth({ code: 'AUTH_TOO_MANY_ATTEMPTS' }) };
      }
      let user = users.get(email);
      if (user && user.password !== credentials.password) {
        const count = (lock?.count ?? 0) + 1;
        failures.set(email, {
          count,
          lockedUntil: count >= MAX_SIGN_IN_FAILURES ? Date.now() + LOCK_MS : 0,
        });
        return { ok: false, error: AppError.auth({ code: 'INVALID_CREDENTIALS' }) };
      }
      if (!user) {
        user = {
          id: `demo-user-${stableHash(email)}`,
          email,
          password: credentials.password,
          displayName: 'Demo User',
          roles: ['member'],
          consents: [],
          verified: true,
          createdAt: new Date().toISOString(),
        };
        users.set(email, user);
      }
      failures.delete(email);
      session = makeSession(user);
      return { ok: true, value: session };
    },

    async signUp(input: SignUpInput): Promise<Result<AuthSession>> {
      const failure = await simulateMockIO(config);
      if (failure) return { ok: false, error: failure };
      const parsed = SignUpSchema.safeParse({ ...input, acceptTerms: true, acceptPrivacy: true });
      if (!parsed.success) {
        return { ok: false, error: AppError.validation({ cause: parsed.error }) };
      }
      const email = parsed.data.email.toLowerCase();
      if (users.has(email)) {
        return { ok: false, error: AppError.conflict({ code: 'EMAIL_TAKEN' }) };
      }
      const user: DemoUser = {
        id: `demo-user-${stableHash(email)}`,
        email,
        password: parsed.data.password,
        displayName: parsed.data.displayName,
        roles: ['member', parsed.data.roleIntent],
        consents: Object.freeze([...input.consents]),
        verified: false,
        createdAt: new Date().toISOString(),
      };
      users.set(email, user);
      issue('verify', email);
      session = makeSession(user);
      return { ok: true, value: session };
    },

    async requestVerification(input: RequestVerificationInput): Promise<Result<AuthChallenge>> {
      const failure = await simulateMockIO(config);
      if (failure) return { ok: false, error: failure };
      return issue('verify', input.target.trim().toLowerCase());
    },

    async verify(input: VerifyInput): Promise<Result<AuthSession>> {
      const failure = await simulateMockIO(config);
      if (failure) return { ok: false, error: failure };
      const target = session?.pendingVerification?.target;
      if (!target && !input.challengeId) {
        return { ok: false, error: AppError.auth({ code: 'NO_PENDING_VERIFICATION' }) };
      }
      const checked = consume('verify', input.code, input.challengeId);
      if (!checked.ok) return checked;
      const user = users.get(checked.value.target);
      if (!user) return { ok: false, error: AppError.notFound({ code: 'ACCOUNT_NOT_FOUND' }) };
      user.verified = true;
      session = makeSession(user);
      return { ok: true, value: session };
    },

    async requestPasswordReset(input: RequestPasswordResetInput): Promise<Result<AuthChallenge>> {
      const failure = await simulateMockIO(config);
      if (failure) return { ok: false, error: failure };
      // Anti-enumeration: a challenge is issued whether or not the account exists.
      return issue('reset', input.email.trim().toLowerCase());
    },

    async resetPassword(input: ResetPasswordInput): Promise<Result<void>> {
      const failure = await simulateMockIO(config);
      if (failure) return { ok: false, error: failure };
      const checked = consume('reset', input.code, input.challengeId);
      if (!checked.ok) return { ok: false, error: checked.error };
      const user = users.get(checked.value.target);
      if (!user) return { ok: false, error: AppError.notFound({ code: 'ACCOUNT_NOT_FOUND' }) };
      user.password = input.password;
      failures.delete(user.email);
      return { ok: true, value: undefined };
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
      const user = users.get(session.user.email ?? '');
      if (!user) return { ok: true, value: null };
      session = makeSession(user);
      return { ok: true, value: session };
    },

    __setRoles(roles: readonly AuthRole[]): void {
      const email = session?.user.email;
      if (!email) return;
      const user = users.get(email);
      if (!user) return;
      user.roles = [...roles];
      session = makeSession(user);
    },

    __demoCodeFor(target: string): string | null {
      const normalized = target.trim().toLowerCase();
      const found = [...challenges.values()].reverse().find((c) => c.target === normalized);
      return found?.code ?? null;
    },

    __reset(): void {
      users.clear();
      challenges.clear();
      failures.clear();
      session = null;
    },
  });
}
