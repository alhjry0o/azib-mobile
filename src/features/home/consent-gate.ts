// Publication consent gate (D-3). Fail-closed: anything ambiguous is NOT published.
// No consent source exists in the P03 contracts yet; P08/P15 supply real records.
export interface PublicationConsent {
  /** Id of the record the consent covers (application id, content id, ...). */
  readonly subjectId: string;
  /** ISO 8601. */
  readonly grantedAt: string;
  /** ISO 8601, or null when never revoked. */
  readonly revokedAt: string | null;
}

export function isConsentActive(
  consent: PublicationConsent | undefined,
  now: Date = new Date(),
): boolean {
  if (!consent) return false;
  const granted = Date.parse(consent.grantedAt);
  if (Number.isNaN(granted)) return false;
  if (granted > now.getTime()) return false;
  if (consent.revokedAt === null) return true;
  const revoked = Date.parse(consent.revokedAt);
  // An unparseable revocation is treated as revoked — never leak on bad data.
  if (Number.isNaN(revoked)) return false;
  return revoked > now.getTime();
}

/** Latest consent per subject wins. */
export function indexConsents(
  consents: readonly PublicationConsent[],
): ReadonlyMap<string, PublicationConsent> {
  const map = new Map<string, PublicationConsent>();
  for (const consent of consents) {
    const existing = map.get(consent.subjectId);
    if (!existing) {
      map.set(consent.subjectId, consent);
      continue;
    }
    const next = Date.parse(consent.grantedAt);
    const prev = Date.parse(existing.grantedAt);
    if (!Number.isNaN(next) && (Number.isNaN(prev) || next > prev)) {
      map.set(consent.subjectId, consent);
    }
  }
  return map;
}
