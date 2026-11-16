import { createMockAuthProvider } from '@/providers/mock/auth';
import { buildConsents } from '@/features/auth/consents';

const signUpInput = {
  displayName: 'Demo Person',
  email: 'flow@azib.invalid',
  password: 'pass1234',
  roleIntent: 'donor' as const,
  consents: buildConsents(new Date('2026-11-16T00:00:00.000Z')),
};

describe('mock auth flows (P06.1)', () => {
  it('signUp creates an unverified demo session with intent role and consents', async () => {
    const auth = createMockAuthProvider();
    const result = await auth.signUp(signUpInput);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.user.dataOrigin).toBe('demo');
    expect(result.value.user.roles).toEqual(['member', 'donor']);
    expect(result.value.user.consents?.length).toBe(2);
    expect(result.value.pendingVerification?.target).toBe('flow@azib.invalid');
    expect(result.value.tokens?.refreshToken).toBeTruthy();
  });

  it('rejects a duplicate email with Conflict', async () => {
    const auth = createMockAuthProvider();
    await auth.signUp(signUpInput);
    const again = await auth.signUp(signUpInput);
    expect(again.ok).toBe(false);
    if (!again.ok) expect(again.error.meta.code).toBe('EMAIL_TAKEN');
  });

  it('verify accepts the demo code and clears pending verification', async () => {
    const auth = createMockAuthProvider();
    await auth.signUp(signUpInput);
    const code = auth.__demoCodeFor('flow@azib.invalid');
    expect(code).toMatch(/^\d{6}$/);
    const verified = await auth.verify({ code: code ?? '' });
    expect(verified.ok).toBe(true);
    if (verified.ok) expect(verified.value.pendingVerification).toBeNull();
  });

  it('locks verification after five wrong attempts', async () => {
    const auth = createMockAuthProvider();
    await auth.signUp(signUpInput);
    for (let i = 0; i < 5; i += 1) {
      const wrong = await auth.verify({ code: '000000' });
      expect(wrong.ok).toBe(false);
    }
    const blocked = await auth.verify({ code: auth.__demoCodeFor('flow@azib.invalid') ?? '' });
    expect(blocked.ok).toBe(false);
    if (!blocked.ok) expect(blocked.error.meta.code).toBe('OTP_MAX_ATTEMPTS');
  });

  it('enforces a resend cooldown', async () => {
    const auth = createMockAuthProvider();
    const first = await auth.requestVerification({ channel: 'email', target: 'x@azib.invalid' });
    expect(first.ok).toBe(true);
    const second = await auth.requestVerification({ channel: 'email', target: 'x@azib.invalid' });
    expect(second.ok).toBe(false);
    if (!second.ok) expect(second.error.meta.code).toBe('OTP_RESEND_COOLDOWN');
  });

  it('resets a password and allows sign-in with the new one only', async () => {
    const auth = createMockAuthProvider();
    await auth.signUp(signUpInput);
    const challenge = await auth.requestPasswordReset({ email: signUpInput.email });
    expect(challenge.ok).toBe(true);
    if (!challenge.ok) return;
    const reset = await auth.resetPassword({
      challengeId: challenge.value.id,
      code: challenge.value.demoCode ?? '',
      password: 'newpass123',
    });
    expect(reset.ok).toBe(true);
    const oldLogin = await auth.signIn({ email: signUpInput.email, password: 'pass1234' });
    expect(oldLogin.ok).toBe(false);
    const newLogin = await auth.signIn({ email: signUpInput.email, password: 'newpass123' });
    expect(newLogin.ok).toBe(true);
  });

  it('issues a reset challenge even for unknown emails (anti-enumeration)', async () => {
    const auth = createMockAuthProvider();
    const challenge = await auth.requestPasswordReset({ email: 'ghost@azib.invalid' });
    expect(challenge.ok).toBe(true);
    if (!challenge.ok) return;
    const reset = await auth.resetPassword({
      challengeId: challenge.value.id,
      code: challenge.value.demoCode ?? '',
      password: 'newpass123',
    });
    expect(reset.ok).toBe(false);
    if (!reset.ok) expect(reset.error.meta.code).toBe('ACCOUNT_NOT_FOUND');
  });

  it('locks sign-in after repeated wrong passwords for a known account', async () => {
    const auth = createMockAuthProvider();
    await auth.signUp(signUpInput);
    await auth.signOut();
    for (let i = 0; i < 5; i += 1) {
      await auth.signIn({ email: signUpInput.email, password: 'wrong-pass' });
    }
    const locked = await auth.signIn({ email: signUpInput.email, password: 'pass1234' });
    expect(locked.ok).toBe(false);
    if (!locked.ok) expect(locked.error.meta.code).toBe('AUTH_TOO_MANY_ATTEMPTS');
  });

  it('__setRoles updates the live session (demo tooling only)', async () => {
    const auth = createMockAuthProvider();
    await auth.signIn({ email: 'roles@azib.invalid', password: 'pass1234' });
    auth.__setRoles(['member', 'reviewer']);
    const session = await auth.getSession();
    expect(session.ok).toBe(true);
    if (session.ok) expect(session.value?.user.roles).toContain('reviewer');
  });

  it('declares email channel only (never assumes SMS)', () => {
    const auth = createMockAuthProvider();
    expect(auth.channels).toEqual(['email']);
  });
});
