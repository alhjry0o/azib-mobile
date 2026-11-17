import { ProfileFormSchema } from '../profile-form';

const valid = {
  displayName: 'Demo Person',
  gender: 'unspecified' as const,
  maritalStatus: 'single' as const,
  governorateId: 'sanaa',
  districtId: 'maeen',
  areaId: 'hadda',
};

describe('ProfileFormSchema', () => {
  it('accepts a complete valid form', () => {
    expect(ProfileFormSchema.safeParse(valid).success).toBe(true);
  });

  it('allows a null area (district-level selection)', () => {
    expect(ProfileFormSchema.safeParse({ ...valid, areaId: null }).success).toBe(true);
  });

  it('enforces display name bounds', () => {
    expect(ProfileFormSchema.safeParse({ ...valid, displayName: 'A' }).success).toBe(false);
    expect(ProfileFormSchema.safeParse({ ...valid, displayName: 'x'.repeat(61) }).success).toBe(false);
    expect(ProfileFormSchema.safeParse({ ...valid, displayName: 'Ab' }).success).toBe(true);
  });

  it('requires governorate and district', () => {
    expect(ProfileFormSchema.safeParse({ ...valid, governorateId: '' }).success).toBe(false);
    expect(ProfileFormSchema.safeParse({ ...valid, districtId: '' }).success).toBe(false);
  });

  it('rejects unknown enum values', () => {
    expect(ProfileFormSchema.safeParse({ ...valid, gender: 'other' }).success).toBe(false);
    expect(ProfileFormSchema.safeParse({ ...valid, maritalStatus: 'unknown' }).success).toBe(false);
  });

  it('uses i18n keys as messages', () => {
    const result = ProfileFormSchema.safeParse({ ...valid, displayName: 'A' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe('profile:validation.displayNameMin');
    }
  });
});
