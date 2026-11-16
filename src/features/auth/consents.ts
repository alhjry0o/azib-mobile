// Consent documents captured at sign-up. Versions are DRAFT placeholders;
// the legal registry and reviewed texts land in P06.3.
export interface ConsentDoc {
  readonly id: string;
  readonly version: string;
  readonly labelKey: string;
}

export const CONSENT_DOCS: readonly ConsentDoc[] = [
  { id: 'terms', version: 'draft-1', labelKey: 'auth:signUp.terms' },
  { id: 'privacy', version: 'draft-1', labelKey: 'auth:signUp.privacy' },
] as const;

export function buildConsents(now: Date = new Date()) {
  const acceptedAt = now.toISOString();
  return CONSENT_DOCS.map((doc) => ({
    docId: doc.id,
    version: doc.version,
    acceptedAt,
  }));
}
