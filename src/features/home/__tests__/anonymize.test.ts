import type { Application } from '@/repositories/contracts/application';
import { selectPublicSupportCases, toPublicSupportCase } from '../anonymize';
import type { PublicationConsent } from '../consent-gate';

const NOW = new Date('2026-11-16T12:00:00.000Z');

const application: Application = {
  id: 'app-1',
  applicantId: 'seed-user-1',
  programId: 'seed-program-1',
  status: 'approved',
  requestedAmount: 150000,
  currency: 'YER',
  notes: 'identifying free text',
  reviewerNote: 'internal reviewer note',
  createdAt: '2026-11-01T00:00:00.000Z',
  updatedAt: '2026-11-02T00:00:00.000Z',
  dataOrigin: 'demo',
};

const consent: PublicationConsent = {
  subjectId: 'app-1',
  grantedAt: '2026-11-01T00:00:00.000Z',
  revokedAt: null,
};

describe('toPublicSupportCase', () => {
  it('publishes nothing without consent', () => {
    expect(toPublicSupportCase(application, undefined, { now: NOW })).toBeNull();
  });

  it('publishes nothing for non-publishable statuses', () => {
    for (const status of ['draft', 'submitted', 'reviewing', 'rejected'] as const) {
      expect(toPublicSupportCase({ ...application, status }, consent, { now: NOW })).toBeNull();
    }
  });

  it('never leaks identifying or financial fields', () => {
    const projection = toPublicSupportCase(application, consent, {
      now: NOW,
      governorateKey: 'profile:locations.sanaa',
    });
    expect(projection).not.toBeNull();
    const serialized = JSON.stringify(projection);
    expect(serialized).not.toContain('seed-user-1');
    expect(serialized).not.toContain('seed-program-1');
    expect(serialized).not.toContain('150000');
    expect(serialized).not.toContain('identifying free text');
    expect(serialized).not.toContain('internal reviewer note');
    expect(Object.keys(projection ?? {}).sort()).toEqual([
      'categoryKey',
      'dataOrigin',
      'governorateKey',
      'id',
    ]);
  });

  it('keeps governorate only and defaults the category', () => {
    const projection = toPublicSupportCase(application, consent, { now: NOW });
    expect(projection?.governorateKey).toBeNull();
    expect(projection?.categoryKey).toBe('home:sections.support-cases.unknownCategory');
  });

  it('drops a case whose consent was revoked', () => {
    const revoked: PublicationConsent = { ...consent, revokedAt: '2026-11-10T00:00:00.000Z' };
    expect(toPublicSupportCase(application, revoked, { now: NOW })).toBeNull();
  });
});

describe('selectPublicSupportCases', () => {
  it('returns an empty list when no consent source exists (D-3)', () => {
    expect(selectPublicSupportCases([application], [], { now: NOW })).toEqual([]);
  });

  it('publishes only the consented case', () => {
    const other: Application = { ...application, id: 'app-2' };
    const result = selectPublicSupportCases([application, other], [consent], { now: NOW });
    expect(result.length).toBe(1);
    expect(result[0]?.id).toBe('app-1');
  });
});
