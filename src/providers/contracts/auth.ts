// AuthProvider contract. Backed by a mock in demo mode; by Supabase Auth in backend (P18).

import type { Result } from '@/core/result';
import type { ProviderBase } from '../types';

export interface AuthUser {
  readonly id: string;
  readonly email: string | null;
  readonly phone: string | null;
  readonly displayName: string;
  /** All users created in demo mode MUST carry 'demo'. */
  readonly dataOrigin: 'real' | 'demo';
  /** ISO 8601. */
  readonly createdAt: string;
}

export interface AuthSession {
  readonly user: AuthUser;
  /** ISO 8601. */
  readonly expiresAt: string;
}

export interface SignInCredentials {
  readonly email: string;
  readonly password: string;
}

export interface AuthProvider extends ProviderBase {
  readonly name: 'auth';
  signIn(credentials: SignInCredentials): Promise<Result<AuthSession>>;
  signOut(): Promise<Result<void>>;
  getSession(): Promise<Result<AuthSession | null>>;
  refreshSession(): Promise<Result<AuthSession | null>>;
}
