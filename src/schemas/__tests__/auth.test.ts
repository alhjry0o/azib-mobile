import {
  AuthEmailSchema,
  ForgotPasswordSchema,
  NewPasswordSchema,
  OtpCodeSchema,
  ResetPasswordSchema,
  SignInSchema,
  SignUpSchema,
  VerifySchema,
  scorePassword,
} from '../auth';

const validSignUp = {
  displayName: 'Demo Person',
  email: 'demo@azib.invalid',
  password: 'pass1234',
  roleIntent: 'applicant' as const,
  acceptTerms: true,
  acceptPrivacy: true,
};

describe('auth schemas', () => {
  it('accepts a valid email and rejects malformed ones', () => {
    expect(AuthEmailSchema.safeParse('a@b.co').success).toBe(true);
    expect(AuthEmailSchema.safeParse('nope').success).toBe(false);
    expect(AuthEmailSchema.safeParse('').success).toBe(false);
    expect(AuthEmailSchema.safeParse(`${'a'.repeat(250)}@b.co`).success).toBe(false);
  });

  it('enforces password bounds and composition', () => {
    expect(NewPasswordSchema.safeParse('short1').success).toBe(false);
    expect(NewPasswordSchema.safeParse('abcdefgh').success).toBe(false);
    expect(NewPasswordSchema.safeParse('12345678').success).toBe(false);
    expect(NewPasswordSchema.safeParse('pass1234').success).toBe(true);
    expect(NewPasswordSchema.safeParse(`${'a1'.repeat(40)}`).success).toBe(false);
  });

  it('enforces display name bounds', () => {
    expect(SignUpSchema.safeParse({ ...validSignUp, displayName: 'A' }).success).toBe(false);
    expect(SignUpSchema.safeParse({ ...validSignUp, displayName: 'Ab' }).success).toBe(true);
    expect(
      SignUpSchema.safeParse({ ...validSignUp, displayName: 'x'.repeat(61) }).success,
    ).toBe(false);
  });

  it('requires both consents', () => {
    expect(SignUpSchema.safeParse({ ...validSignUp, acceptTerms: false }).success).toBe(false);
    expect(SignUpSchema.safeParse({ ...validSignUp, acceptPrivacy: false }).success).toBe(false);
    expect(SignUpSchema.safeParse(validSignUp).success).toBe(true);
  });

  it('sign-in only requires a non-empty password', () => {
    expect(SignInSchema.safeParse({ email: 'a@b.co', password: 'x' }).success).toBe(true);
    expect(SignInSchema.safeParse({ email: 'a@b.co', password: '' }).success).toBe(false);
  });

  it('accepts only 6-digit codes', () => {
    expect(OtpCodeSchema.safeParse('123456').success).toBe(true);
    expect(OtpCodeSchema.safeParse('12345').success).toBe(false);
    expect(OtpCodeSchema.safeParse('12345a').success).toBe(false);
    expect(VerifySchema.safeParse({ code: '000000' }).success).toBe(true);
  });

  it('reset requires matching confirmation', () => {
    const base = { code: '123456', password: 'pass1234', confirm: 'pass1234' };
    expect(ResetPasswordSchema.safeParse(base).success).toBe(true);
    const mismatch = ResetPasswordSchema.safeParse({ ...base, confirm: 'other1234' });
    expect(mismatch.success).toBe(false);
    if (!mismatch.success) {
      expect(mismatch.error.issues[0]?.path).toContain('confirm');
    }
  });

  it('forgot password validates the email', () => {
    expect(ForgotPasswordSchema.safeParse({ email: 'a@b.co' }).success).toBe(true);
    expect(ForgotPasswordSchema.safeParse({ email: 'bad' }).success).toBe(false);
  });

  it('messages are i18n keys, never literal text', () => {
    const result = AuthEmailSchema.safeParse('bad');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('auth:validation.emailInvalid');
    }
  });

  it('scores password strength from 0 to 4', () => {
    expect(scorePassword('')).toBe(0);
    expect(scorePassword('abc')).toBe(0);
    expect(scorePassword('abcdefgh')).toBe(1);
    expect(scorePassword('abcdefg1')).toBe(2);
    expect(scorePassword('abcdefghijkl1')).toBe(3);
    expect(scorePassword('abcdefghijkl1!')).toBe(4);
  });
});
