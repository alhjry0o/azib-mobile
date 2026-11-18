import {
  ChangePasswordSchema,
  DELETION_PHRASE,
  DeleteAccountSchema,
} from '../security';

const validChange = {
  currentPassword: 'oldpass123',
  newPassword: 'newpass123',
  confirm: 'newpass123',
};

const validDelete = {
  password: 'oldpass123',
  phrase: DELETION_PHRASE,
  acknowledged: true,
};

describe('ChangePasswordSchema', () => {
  it('accepts a valid change', () => {
    expect(ChangePasswordSchema.safeParse(validChange).success).toBe(true);
  });

  it('requires the current password', () => {
    expect(ChangePasswordSchema.safeParse({ ...validChange, currentPassword: '' }).success).toBe(
      false,
    );
  });

  it('rejects a mismatched confirmation', () => {
    const result = ChangePasswordSchema.safeParse({ ...validChange, confirm: 'other1234' });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0]?.path).toContain('confirm');
  });

  it('rejects reusing the current password', () => {
    const result = ChangePasswordSchema.safeParse({
      ...validChange,
      newPassword: validChange.currentPassword,
      confirm: validChange.currentPassword,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('auth:validation.passwordSameAsOld');
    }
  });

  it('enforces the new password composition rules', () => {
    expect(
      ChangePasswordSchema.safeParse({ ...validChange, newPassword: 'abcdefgh', confirm: 'abcdefgh' })
        .success,
    ).toBe(false);
  });
});

describe('DeleteAccountSchema', () => {
  it('accepts a complete confirmation', () => {
    expect(DeleteAccountSchema.safeParse(validDelete).success).toBe(true);
  });

  it('requires the exact confirmation word', () => {
    expect(DeleteAccountSchema.safeParse({ ...validDelete, phrase: 'delete' }).success).toBe(false);
    expect(DeleteAccountSchema.safeParse({ ...validDelete, phrase: '' }).success).toBe(false);
  });

  it('requires the acknowledgement', () => {
    expect(DeleteAccountSchema.safeParse({ ...validDelete, acknowledged: false }).success).toBe(
      false,
    );
  });

  it('requires re-authentication', () => {
    expect(DeleteAccountSchema.safeParse({ ...validDelete, password: '' }).success).toBe(false);
  });
});
