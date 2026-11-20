// Success stories are published ONLY with an active per-story consent (D-3).
// The optional account-level consent (settings.storiesConsent) is NOT a
// substitute: it covers the user's own story, not any content record.
import type { ContentRecord } from '@/repositories/contracts/content';
import { indexConsents, isConsentActive, type PublicationConsent } from './consent-gate';

export interface PublicStory {
  readonly id: string;
  readonly titleKey: string;
  readonly bodyKey: string;
  readonly dataOrigin: 'demo' | 'real';
}

export function selectPublicStories(
  records: readonly ContentRecord[],
  consents: readonly PublicationConsent[],
  now: Date = new Date(),
): readonly PublicStory[] {
  const index = indexConsents(consents);
  const published: PublicStory[] = [];
  for (const record of records) {
    if (!isConsentActive(index.get(record.id), now)) continue;
    published.push({
      id: record.id,
      titleKey: record.titleKey,
      bodyKey: record.bodyKey,
      dataOrigin: record.dataOrigin,
    });
  }
  return published;
}
