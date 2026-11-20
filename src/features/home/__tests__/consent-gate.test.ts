import { indexConsents, isConsentActive, type PublicationConsent } from '../consent-gate';

const NOW = new Date('2026-11-16T12:00:00.000Z');

function consent(patch: Partial<PublicationConsent> = {}): PublicationConsent {
  return {
    subjectId: 'case-1',
    grantedAt: '2026-11-01T00:00:00.000Z',
    revokedAt: null,
    ...patch,
  };
}

describe('isConsentActive', () => {
  it('requires a consent record', () => {
    expect(isConsentActive(undefined, NOW)).toBe(false);
  });

  it('accepts a granted, unrevoked consent', () => {
    expect(isConsentActive(consent(), NOW)).toBe(true);
  });

  it('rejects a consent granted in the future', () => {
    expect(isConsentActive(consent({ grantedAt: '2026-12-01T00:00:00.000Z' }), NOW)).toBe(false);
  });

  it('rejects a revoked consent', () => {
    expect(isConsentActive(consent({ revokedAt: '2026-11-10T00:00:00.000Z' }), NOW)).toBe(false);
  });

  it('accepts a revocation scheduled in the future', () => {
    expect(isConsentActive(consent({ revokedAt: '2026-12-01T00:00:00.000Z' }), NOW)).toBe(true);
  });

  it('fails closed on unparseable dates', () => {
    expect(isConsentActive(consent({ grantedAt: 'not-a-date' }), NOW)).toBe(false);
    expect(isConsentActive(consent({ revokedAt: 'not-a-date' }), NOW)).toBe(false);
  });
});

describe('indexConsents', () => {
  it('keeps the latest consent per subject', () => {
    const older = consent({ grantedAt: '2026-10-01T00:00:00.000Z' });
    const newer = consent({ grantedAt: '2026-11-05T00:00:00.000Z', revokedAt: '2026-11-06T00:00:00.000Z' });
    const index = indexConsents([older, newer]);
    expect(index.get('case-1')?.grantedAt).toBe('2026-11-05T00:00:00.000Z');
    expect(isConsentActive(index.get('case-1'), NOW)).toBe(false);
  });

  it('returns an empty map for no consents', () => {
    expect(indexConsents([]).size).toBe(0);
  });
});
