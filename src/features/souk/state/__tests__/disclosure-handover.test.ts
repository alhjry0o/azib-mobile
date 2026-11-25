import {
  assertCanConfirmHandover,
  buildHandoverCode,
  canDiscloseContact,
  counterpartyId,
  disclosedPhone,
  disclosureState,
  isHandoverComplete,
  validateRating,
} from '../index';

const base = {
  requestStatus: 'accepted' as const,
  donorContactConsent: true,
  recipientContactConsent: true,
  viewerId: 'donor-1',
  donorId: 'donor-1',
  requesterId: 'recipient-1',
};

describe('progressive contact disclosure', () => {
  it('never discloses before acceptance', () => {
    const input = { ...base, requestStatus: 'pending' as const };
    expect(canDiscloseContact(input)).toBe(false);
    expect(disclosureState(input)).toBe('not_accepted');
    expect(disclosedPhone(input, '+967700000001')).toBeNull();
  });

  it('never discloses with one consent only', () => {
    const donorOnly = { ...base, recipientContactConsent: false };
    const recipientOnly = { ...base, donorContactConsent: false };
    expect(canDiscloseContact(donorOnly)).toBe(false);
    expect(canDiscloseContact(recipientOnly)).toBe(false);
    expect(disclosureState(donorOnly)).toBe('awaiting_consents');
    expect(disclosedPhone(recipientOnly, '+967700000001')).toBeNull();
  });

  it('discloses only to a party, and only the counterparty number', () => {
    expect(canDiscloseContact(base)).toBe(true);
    expect(disclosedPhone(base, '+967700000001')).toBe('+967700000001');
    expect(counterpartyId(base)).toBe('recipient-1');
    const stranger = { ...base, viewerId: 'someone-else' };
    expect(disclosureState(stranger)).toBe('not_a_party');
    expect(disclosedPhone(stranger, '+967700000001')).toBeNull();
    expect(counterpartyId(stranger)).toBeNull();
  });

  it('refuses when the viewer is both parties (degenerate data)', () => {
    const degenerate = { ...base, requesterId: 'donor-1' };
    expect(disclosedPhone(degenerate, '+967700000001')).toBeNull();
  });
});

describe('dual handover confirmation', () => {
  const code = buildHandoverCode('req-abcdef', '2026-06-01T00:00:00.000Z');

  it('builds a deterministic demo-labelled code', () => {
    expect(code).toBe(buildHandoverCode('req-abcdef', '2026-06-01T00:00:00.000Z'));
    expect(code.startsWith('AZIB-DEMO-HO-')).toBe(true);
  });

  it('requires acceptance, party membership and the exact code', () => {
    const input = {
      requestStatus: 'accepted',
      storedCode: code,
      enteredCode: code,
      donorId: 'donor-1',
      requesterId: 'recipient-1',
      userId: 'donor-1',
    };
    const okResult = assertCanConfirmHandover(input);
    expect(okResult.ok).toBe(true);
    if (okResult.ok) expect(okResult.value).toBe('donor');

    expect(assertCanConfirmHandover({ ...input, requestStatus: 'pending' }).ok).toBe(false);
    expect(assertCanConfirmHandover({ ...input, userId: 'stranger' }).ok).toBe(false);
    expect(assertCanConfirmHandover({ ...input, enteredCode: 'wrong' }).ok).toBe(false);
    expect(assertCanConfirmHandover({ ...input, storedCode: null }).ok).toBe(false);
  });

  it('completes only when BOTH parties confirmed', () => {
    expect(isHandoverComplete(null, null)).toBe(false);
    expect(isHandoverComplete('2026-06-01T00:00:00.000Z', null)).toBe(false);
    expect(isHandoverComplete(null, '2026-06-01T00:00:00.000Z')).toBe(false);
    expect(
      isHandoverComplete('2026-06-01T00:00:00.000Z', '2026-06-01T00:01:00.000Z'),
    ).toBe(true);
  });
});

describe('experience rating', () => {
  it('accepts 1..5 integers with an optional short note', () => {
    for (const score of [1, 2, 3, 4, 5]) {
      expect(validateRating({ score, note: null }).ok).toBe(true);
    }
    const withNote = validateRating({ score: 4, note: '  Smooth handover  ' });
    expect(withNote.ok).toBe(true);
    if (withNote.ok) expect(withNote.value.note).toBe('Smooth handover');
  });

  it('rejects out-of-range, fractional and overlong input', () => {
    expect(validateRating({ score: 0 }).ok).toBe(false);
    expect(validateRating({ score: 6 }).ok).toBe(false);
    expect(validateRating({ score: 3.5 }).ok).toBe(false);
    expect(validateRating({ score: 3, note: 'x'.repeat(301) }).ok).toBe(false);
  });
});
