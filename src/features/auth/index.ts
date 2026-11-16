export type { AuthEvent, AuthPhase, DerivePhaseInput } from './auth-machine';
export {
  INITIAL_AUTH_PHASE,
  deriveAuthPhase,
  isValidTransition,
  transition,
} from './auth-machine';
export { authErrorKey } from './errors';
export type { TokenVault, VaultPlatform } from './token-vault';
export { REFRESH_TOKEN_KEY, createTokenVault } from './token-vault';
export type { ConsentDoc } from './consents';
export { CONSENT_DOCS, buildConsents } from './consents';
export type { OtpApi } from './use-otp';
export {
  OTP_MAX_ATTEMPTS,
  OTP_RESEND_SECONDS,
  canSubmitCode,
  nextAttempts,
  secondsLeftUntil,
  useOtp,
} from './use-otp';
export type { AuthApi, SignUpPayload } from './use-auth';
export { useAuth } from './use-auth';
export type { RequireAuthProps } from './RequireAuth';
export { RequireAuth } from './RequireAuth';
export { AuthScaffold } from './components/AuthScaffold';
export { PasswordStrengthMeter } from './components/PasswordStrengthMeter';
export { WelcomeScreen } from './screens/WelcomeScreen';
export { SignInScreen } from './screens/SignInScreen';
export { SignUpScreen } from './screens/SignUpScreen';
export { VerifyScreen } from './screens/VerifyScreen';
export { ForgotPasswordScreen } from './screens/ForgotPasswordScreen';
export { ResetPasswordScreen } from './screens/ResetPasswordScreen';
