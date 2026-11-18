// ALL expo-local-authentication calls live here so the native surface is
// easy to adjust if the installed SDK exposes a different API.
import * as LocalAuthentication from 'expo-local-authentication';
import { AppError, toAppError } from '@/core/errors';
import type { Result } from '@/core/result';

export interface BiometricCapability {
  readonly supported: boolean;
  readonly enrolled: boolean;
}

export async function readBiometricCapability(): Promise<BiometricCapability> {
  try {
    const supported = await LocalAuthentication.hasHardwareAsync();
    if (!supported) return { supported: false, enrolled: false };
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    return { supported: true, enrolled };
  } catch {
    return { supported: false, enrolled: false };
  }
}

export async function authenticateBiometric(promptMessage: string): Promise<Result<boolean>> {
  try {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage,
      disableDeviceFallback: false,
    });
    if (result.success) return { ok: true, value: true };
    return { ok: false, error: AppError.auth({ code: 'BIOMETRIC_FAILED' }) };
  } catch (caught) {
    return { ok: false, error: toAppError(caught) };
  }
}
