import {
  APPROVAL_REASONS,
  INFO_REQUEST_FIELDS,
  REJECTION_REASONS,
  isKnownReason,
  reasonsFor,
} from '../config/reason-catalog';
import { AppealFormSchema } from '../schemas/appeal';

describe('reason catalog', () => {
  it('separates approval and rejection reasons', () => {
    expect(reasonsFor('approved')).toEqual(APPROVAL_REASONS);
    expect(reasonsFor('rejected')).toEqual(REJECTION_REASONS);
  });

  it('uses i18n keys only', () => {
    for (const reason of [...APPROVAL_REASONS, ...REJECTION_REASONS]) {
      expect(reason.labelKey.startsWith('assistance:reasons.')).toBe(true);
    }
    for (const field of INFO_REQUEST_FIELDS) {
      expect(field.labelKey.startsWith('assistance:infoRequest.fields.')).toBe(true);
      expect(field.reasonKey.startsWith('assistance:infoRequest.reasons.')).toBe(true);
    }
  });

  it('recognises known reasons and rejects unknown ones', () => {
    const first = APPROVAL_REASONS[0]!;
    expect(isKnownReason(first.labelKey)).toBe(true);
    expect(isKnownReason('assistance:reasons.unknown')).toBe(false);
  });

  it('has unique keys', () => {
    const keys = [...APPROVAL_REASONS, ...REJECTION_REASONS].map((r) => r.key);
    expect(new Set(keys).size).toBe(keys.length);
  });
});

describe('AppealFormSchema', () => {
  it('requires a meaningful statement', () => {
    expect(AppealFormSchema.safeParse({ statement: 'short' }).success).toBe(false);
    expect(
      AppealFormSchema.safeParse({ statement: 'This is a sufficiently long appeal statement.' })
        .success,
    ).toBe(true);
  });

  it('caps the statement length', () => {
    expect(AppealFormSchema.safeParse({ statement: 'x'.repeat(2001) }).success).toBe(false);
  });
});
