// OTP attempt budget + resend cooldown. Pure helpers are exported for tests.
import { useCallback, useEffect, useRef, useState } from 'react';

export const OTP_MAX_ATTEMPTS = 5;
export const OTP_RESEND_SECONDS = 30;

export function nextAttempts(current: number): number {
  return Math.min(OTP_MAX_ATTEMPTS, current + 1);
}

export function canSubmitCode(attempts: number, code: string): boolean {
  return attempts < OTP_MAX_ATTEMPTS && /^\d{6}$/.test(code);
}

export function secondsLeftUntil(sentAt: number | null, now: number, seconds: number): number {
  if (sentAt === null) return 0;
  const elapsed = Math.floor((now - sentAt) / 1000);
  return Math.max(0, seconds - elapsed);
}

export interface OtpApi {
  readonly attempts: number;
  readonly locked: boolean;
  readonly secondsLeft: number;
  readonly canResend: boolean;
  recordFailure(): void;
  resetAttempts(): void;
  markSent(): void;
}

export function useOtp(cooldownSeconds: number = OTP_RESEND_SECONDS): OtpApi {
  const [attempts, setAttempts] = useState(0);
  const [sentAt, setSentAt] = useState<number | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (sentAt === null) return;
    timerRef.current = setInterval(() => setNow(Date.now()), 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
    };
  }, [sentAt]);

  const recordFailure = useCallback(() => setAttempts((a) => nextAttempts(a)), []);
  const resetAttempts = useCallback(() => setAttempts(0), []);
  const markSent = useCallback(() => {
    setSentAt(Date.now());
    setNow(Date.now());
    setAttempts(0);
  }, []);

  const secondsLeft = secondsLeftUntil(sentAt, now, cooldownSeconds);

  return {
    attempts,
    locked: attempts >= OTP_MAX_ATTEMPTS,
    secondsLeft,
    canResend: secondsLeft === 0,
    recordFailure,
    resetAttempts,
    markSent,
  };
}
