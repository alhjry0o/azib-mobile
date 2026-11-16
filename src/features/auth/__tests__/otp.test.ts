import { act, renderHook } from '@testing-library/react-native';
import {
  OTP_MAX_ATTEMPTS,
  canSubmitCode,
  nextAttempts,
  secondsLeftUntil,
  useOtp,
} from '../use-otp';

describe('otp helpers', () => {
  it('caps attempts at the maximum', () => {
    expect(nextAttempts(0)).toBe(1);
    expect(nextAttempts(OTP_MAX_ATTEMPTS)).toBe(OTP_MAX_ATTEMPTS);
  });

  it('only allows a complete code before the lock', () => {
    expect(canSubmitCode(0, '123456')).toBe(true);
    expect(canSubmitCode(0, '12345')).toBe(false);
    expect(canSubmitCode(OTP_MAX_ATTEMPTS, '123456')).toBe(false);
  });

  it('computes the resend countdown', () => {
    expect(secondsLeftUntil(null, 10_000, 30)).toBe(0);
    expect(secondsLeftUntil(1_000, 11_000, 30)).toBe(20);
    expect(secondsLeftUntil(1_000, 61_000, 30)).toBe(0);
  });
});

describe('useOtp', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('locks after the maximum number of failures and resets on resend', async () => {
    const hook = await renderHook(() => useOtp(30));
    for (let i = 0; i < OTP_MAX_ATTEMPTS; i += 1) {
      await act(async () => {
        hook.result.current.recordFailure();
      });
    }
    expect(hook.result.current.locked).toBe(true);
    await act(async () => {
      hook.result.current.markSent();
    });
    expect(hook.result.current.locked).toBe(false);
    expect(hook.result.current.canResend).toBe(false);
  });

  it('counts down the resend cooldown', async () => {
    const hook = await renderHook(() => useOtp(30));
    await act(async () => {
      hook.result.current.markSent();
    });
    expect(hook.result.current.secondsLeft).toBe(30);
    await act(async () => {
      jest.advanceTimersByTime(10_000);
    });
    expect(hook.result.current.secondsLeft).toBeLessThanOrEqual(20);
    await act(async () => {
      jest.advanceTimersByTime(25_000);
    });
    expect(hook.result.current.canResend).toBe(true);
  });
});
