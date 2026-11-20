// Community support cases: publishable projection ONLY (AGENT_RULES §1 #20).
// Guarantees: no applicantId, no programId, no notes, no reviewerNote,
// no requestedAmount (not even rounded), no contact data.
// What may appear: a need category key and a governorate key only.
import type { Application } from '@/repositories/contracts/application';
import { indexConsents, isConsentActive, type PublicationConsent } from './consent-gate';

export const PUBLISHABLE_STATUSES: readonly Application['status'][] = ['approved', 'disbursed'];

export interface SupportCaseContext {
  readonly categoryKey?: string | null;
  readonly governorateKey?: string | null;
  readonly now?: Date;
}

export interface PublicSupportCase {
  /** Opaque case id. No public route resolves it to a person. */
  readonly id: string;
  readonly categoryKey: string;
  readonly governorateKey: string | null;
  readonly dataOrigin: 'demo' | 'real';
}

export function toPublicSupportCase(
  application: Application,
  consent: PublicationConsent | undefined,
  context: SupportCaseContext = {},
): PublicSupportCase | null {
  if (!PUBLISHABLE_STATUSES.includes(application.status)) return null;
  if (!isConsentActive(consent, context.now ?? new Date())) return null;
  return {
    id: application.id,
    categoryKey: context.categoryKey ?? 'home:sections.supportCases.unknownCategory',
    governorateKey: context.governorateKey ?? null,
    dataOrigin: application.dataOrigin,
  };
}

export function selectPublicSupportCases(
  applications: readonly Application[],
  consents: readonly PublicationConsent[],
  context: SupportCaseContext = {},
): readonly PublicSupportCase[] {
  const index = indexConsents(consents);
  const published: PublicSupportCase[] = [];
  for (const application of applications) {
    const projection = toPublicSupportCase(application, index.get(application.id), context);
    if (projection) published.push(projection);
  }
  return published;
}
