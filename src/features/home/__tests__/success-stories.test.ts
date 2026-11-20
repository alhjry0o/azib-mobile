import type { ContentRecord } from '@/repositories/contracts/content';
import { selectPublicStories } from '../success-stories';
import type { PublicationConsent } from '../consent-gate';

const NOW = new Date('2026-11-16T12:00:00.000Z');

const record: ContentRecord = {
  id: 'content-1',
  slug: 'welcome',
  titleKey: 'learn:title',
  bodyKey: 'learn:notConnectedYet',
  createdAt: '2026-11-01T00:00:00.000Z',
  updatedAt: '2026-11-01T00:00:00.000Z',
  dataOrigin: 'demo',
};

const consent: PublicationConsent = {
  subjectId: 'content-1',
  grantedAt: '2026-11-01T00:00:00.000Z',
  revokedAt: null,
};

describe('selectPublicStories', () => {
  it('publishes nothing without per-story consent (D-3)', () => {
    expect(selectPublicStories([record], [], NOW)).toEqual([]);
  });

  it('publishes a story with an active consent', () => {
    const result = selectPublicStories([record], [consent], NOW);
    expect(result.length).toBe(1);
    expect(result[0]?.titleKey).toBe('learn:title');
  });

  it('drops a story whose consent was revoked', () => {
    const revoked: PublicationConsent = { ...consent, revokedAt: '2026-11-10T00:00:00.000Z' };
    expect(selectPublicStories([record], [revoked], NOW)).toEqual([]);
  });

  it('ignores consents belonging to other records', () => {
    const other: PublicationConsent = { ...consent, subjectId: 'content-2' };
    expect(selectPublicStories([record], [other], NOW)).toEqual([]);
  });

  it('returns an empty list for an empty repository', () => {
    expect(selectPublicStories([], [consent], NOW)).toEqual([]);
  });
});
