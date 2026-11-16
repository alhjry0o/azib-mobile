// Single entry point for auth actions. Screens never call providers directly.
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { AppError } from '@/core/errors';
import type { Result } from '@/core/result';
import type {
  AuthChallenge,
  AuthSession,
  AuthUser,
  ResetPasswordInput,
  RoleIntent,
  SignInCredentials,
} from '@/providers';
import { useProviderContainer } from '@/providers';
import { useSession } from '@/features/shell/use-session';
import { useAppModeStore, useAuthStore } from '@/stores';
import { deriveAuthPhase, type AuthPhase } from './auth-machine';
import { buildConsents } from './consents';
import { createTokenVault } from './token-vault';

export interface SignUpPayload extends SignInCredentials {
  readonly displayName: string;
  readonly roleIntent: RoleIntent;
}

export interface AuthApi {
  readonly phase: AuthPhase;
  readonly user: AuthUser | null;
  readonly session: AuthSession | null;
  readonly isGuest: boolean;
  readonly busy: boolean;
  readonly error: AppError | null;
  readonly channels: readonly ('email' | 'phone')[];
  signIn(credentials: SignInCredentials): Promise<Result<AuthSession>>;
  signUp(payload: SignUpPayload): Promise<Result<AuthSession>>;
  verify(code: string): Promise<Result<AuthSession>>;
  resend(): Promise<Result<AuthChallenge>>;
  requestReset(email: string): Promise<Result<AuthChallenge>>;
  resetPassword(code: string, password: string): Promise<Result<void>>;
  continueAsGuest(): void;
  signOut(): Promise<Result<void>>;
  clearError(): void;
  refetch(): void;
}

const REFRESH_MARGIN_MS = 60_000;

export function useAuth(): AuthApi {
  const container = useProviderContainer();
  const session = useSession();
  const client = useQueryClient();
  const modeHydrated = useAppModeStore((s) => s.hydrated);
  const authHydrated = useAuthStore((s) => s.hydrated);
  const guestActive = useAuthStore((s) => s.guestActive);
  const challenge = useAuthStore((s) => s.challenge);
  const startGuest = useAuthStore((s) => s.startGuest);
  const endGuest = useAuthStore((s) => s.endGuest);
  const setChallenge = useAuthStore((s) => s.setChallenge);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<AppError | null>(null);
  const vault = useMemo(() => createTokenVault(), []);

  const resolved = session.result?.ok ? session.result.value : null;
  const setSessionData = session.setSession;

  const phase = deriveAuthPhase({
    hydrated: modeHydrated && authHydrated,
    guestActive,
    sessionLoading: session.isLoading,
    session: session.result,
  });

  const run = useCallback(async <T,>(fn: () => Promise<Result<T>>): Promise<Result<T>> => {
    setBusy(true);
    setError(null);
    const result = await fn();
    if (!result.ok) setError(result.error);
    setBusy(false);
    return result;
  }, []);

  const persist = useCallback(
    async (value: AuthSession): Promise<void> => {
      if (value.tokens) await vault.save(value.tokens.refreshToken);
    },
    [vault],
  );

  const storeChallenge = useCallback(
    (value: AuthChallenge): void => {
      setChallenge({
        id: value.id,
        channel: value.channel,
        target: value.target,
        expiresAt: value.expiresAt,
        demoCode: value.demoCode ?? null,
      });
    },
    [setChallenge],
  );

  const signIn = useCallback(
    async (credentials: SignInCredentials) => {
      const result = await run(() => container.auth.signIn(credentials));
      if (result.ok) {
        endGuest();
        await persist(result.value);
        setSessionData(result.value);
      }
      return result;
    },
    [container, run, endGuest, persist, setSessionData],
  );

  const signUp = useCallback(
    async (payload: SignUpPayload) => {
      const result = await run(() =>
        container.auth.signUp({
          displayName: payload.displayName,
          email: payload.email,
          password: payload.password,
          roleIntent: payload.roleIntent,
          consents: buildConsents(),
        }),
      );
      if (result.ok) {
        endGuest();
        await persist(result.value);
        setSessionData(result.value);
        const pending = result.value.pendingVerification;
        if (pending?.challengeId) {
          setChallenge({
            id: pending.challengeId,
            channel: pending.channel,
            target: pending.target,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
            demoCode: pending.demoCode ?? null,
          });
        }
      }
      return result;
    },
    [container, run, endGuest, persist, setSessionData, setChallenge],
  );

  const verify = useCallback(
    async (code: string) => {
      const result = await run(() =>
        container.auth.verify({ code, challengeId: challenge?.id }),
      );
      if (result.ok) {
        await persist(result.value);
        setSessionData(result.value);
        setChallenge(null);
      }
      return result;
    },
    [container, run, challenge, persist, setSessionData, setChallenge],
  );

  const resend = useCallback(async () => {
    const target = resolved?.pendingVerification?.target ?? challenge?.target;
    if (!target) {
      const issued = await run(() =>
        container.auth.requestVerification({ channel: 'email', target: '' }),
      );
      return issued;
    }
    const result = await run(() =>
      container.auth.requestVerification({ channel: 'email', target }),
    );
    if (result.ok) storeChallenge(result.value);
    return result;
  }, [container, run, resolved, challenge, storeChallenge]);

  const requestReset = useCallback(
    async (email: string) => {
      const result = await run(() => container.auth.requestPasswordReset({ email }));
      if (result.ok) storeChallenge(result.value);
      return result;
    },
    [container, run, storeChallenge],
  );

  const resetPassword = useCallback(
    async (code: string, password: string) => {
      const input: ResetPasswordInput = {
        challengeId: challenge?.id ?? '',
        code,
        password,
      };
      const result = await run(() => container.auth.resetPassword(input));
      if (result.ok) setChallenge(null);
      return result;
    },
    [container, run, challenge, setChallenge],
  );

  const continueAsGuest = useCallback((): void => {
    setError(null);
    startGuest();
    setSessionData(null);
  }, [startGuest, setSessionData]);

  const signOut = useCallback(async () => {
    const result = await run(() => container.auth.signOut());
    if (result.ok) {
      await vault.clear();
      endGuest();
      setChallenge(null);
      setSessionData(null);
      client.clear();
    }
    return result;
  }, [run, container, vault, endGuest, setChallenge, setSessionData, client]);

  const clearError = useCallback(() => setError(null), []);

  // Automatic refresh, scheduled only when the session actually carries tokens.
  useEffect(() => {
    if (!resolved?.tokens) return;
    const delay = Math.max(
      5_000,
      new Date(resolved.expiresAt).getTime() - Date.now() - REFRESH_MARGIN_MS,
    );
    const timer = setTimeout(() => {
      void container.auth.refreshSession().then((result) => {
        if (result.ok && result.value) setSessionData(result.value);
      });
    }, delay);
    return () => clearTimeout(timer);
  }, [resolved, container, setSessionData]);

  return {
    phase,
    user: resolved?.user ?? null,
    session: resolved,
    isGuest: phase === 'guest',
    busy,
    error,
    channels: container.auth.channels,
    signIn,
    signUp,
    verify,
    resend,
    requestReset,
    resetPassword,
    continueAsGuest,
    signOut,
    clearError,
    refetch: session.refetch,
  };
}
