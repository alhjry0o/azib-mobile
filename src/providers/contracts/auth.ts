// AuthProvider contract. Mock in demo; Supabase Auth in backend (P18).
// P06.1 extends it ADDITIVELY: existing signatures are unchanged and all new
// AuthUser/AuthSession fields are optional so P03/P05 callers stay valid.
import type { Result } from '@/core/result';
import type { ProviderBase } from '../types';

export const AUTH_ROLES = [
  'guest',
  'member',
  'applicant',
  'donor',
  'partner_owner',
  'ambassador',
  'volunteer',
  'reviewer',
  'moderator',
  'partner_verifier',
  'finance_officer',
  'content_editor',
  'admin',
  'auditor',
] as const;
export type AuthRole = (typeof AUTH_ROLES)[number];

/** Roles that unlock the staff area. Self-declared intents are NOT staff. */
export const STAFF_ROLES: readonly AuthRole[] = [
  'reviewer',
  'moderator',
  'partner_verifier',
  'finance_officer',
  'content_editor',
  'admin',
  'auditor',
] as const;

export type AuthChannel = 'email' | 'phone';
export type RoleIntent = 'applicant' | 'donor' | 'partner_owner' | 'volunteer';

export interface AuthConsent {
  readonly docId: string;
  readonly version: string;
  readonly acceptedAt: string;
}

export interface AuthTokens {
  readonly accessToken: string;
  readonly refreshToken: string;
  /** ISO 8601. */
  readonly expiresAt: string;
}

export interface PendingVerification {
  readonly channel: AuthChannel;
  readonly target: string;
  /** Demo adapters only: challenge id so clients can verify without re-requesting. */
  readonly challengeId?: string;
  /** Demo adapters only: never present in a real backend response. */
  readonly demoCode?: string;
}

export interface AuthUser {
  readonly id: string;
  readonly email: string | null;
  readonly phone: string | null;
  readonly displayName: string;
  /** All users created in demo mode MUST carry 'demo'. */
  readonly dataOrigin: 'real' | 'demo';
  /** ISO 8601. */
  readonly createdAt: string;
  /** Absent until P06 clients populate it; deny-by-default in guards. */
  readonly roles?: readonly AuthRole[];
  readonly consents?: readonly AuthConsent[];
}

export interface AuthSession {
  readonly user: AuthUser;
  /** ISO 8601. */
  readonly expiresAt: string;
  readonly tokens?: AuthTokens;
  readonly pendingVerification?: PendingVerification | null;
}

export interface SignInCredentials {
  readonly email: string;
  readonly password: string;
}

export interface SignUpInput {
  readonly displayName: string;
  readonly email: string;
  readonly password: string;
  readonly roleIntent: RoleIntent;
  readonly consents: readonly AuthConsent[];
}

export interface AuthChallenge {
  readonly id: string;
  readonly channel: AuthChannel;
  readonly target: string;
  /** ISO 8601. */
  readonly expiresAt: string;
  /** Demo adapters only. Never present in a real backend response. */
  readonly demoCode?: string;
}

export interface RequestVerificationInput {
  readonly channel: AuthChannel;
  readonly target: string;
}

export interface VerifyInput {
  readonly code: string;
  readonly challengeId?: string;
}

export interface RequestPasswordResetInput {
  readonly email: string;
}

export interface ResetPasswordInput {
  readonly challengeId: string;
  readonly code: string;
  readonly password: string;
}

export interface AuthProvider extends ProviderBase {
  readonly name: 'auth';
  /** Channels this provider can actually deliver to. Never assume SMS. */
  readonly channels: readonly AuthChannel[];
  signIn(credentials: SignInCredentials): Promise<Result<AuthSession>>;
  signOut(): Promise<Result<void>>;
  getSession(): Promise<Result<AuthSession | null>>;
  refreshSession(): Promise<Result<AuthSession | null>>;
  signUp(input: SignUpInput): Promise<Result<AuthSession>>;
  requestVerification(input: RequestVerificationInput): Promise<Result<AuthChallenge>>;
  verify(input: VerifyInput): Promise<Result<AuthSession>>;
  requestPasswordReset(input: RequestPasswordResetInput): Promise<Result<AuthChallenge>>;
  resetPassword(input: ResetPasswordInput): Promise<Result<void>>;
}
