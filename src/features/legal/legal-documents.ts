// Versioned legal document registry (P06.3).
// Every document is a DRAFT template that requires human legal review before
// launch. Texts live in locales/*/legal.json; nothing is hardcoded here.
export interface LegalSection {
  readonly id: string;
  readonly headingKey: string;
  readonly bodyKey: string;
}

export interface LegalDocument {
  readonly slug: string;
  readonly version: string;
  readonly titleKey: string;
  readonly summaryKey: string;
  readonly requiresLegalReview: true;
  readonly sections: readonly LegalSection[];
}

function doc(
  slug: string,
  sectionIds: readonly string[],
): LegalDocument {
  return {
    slug,
    version: 'draft-1',
    titleKey: `legal:docs.${slug}.title`,
    summaryKey: `legal:docs.${slug}.summary`,
    requiresLegalReview: true,
    sections: sectionIds.map((id) => ({
      id,
      headingKey: `legal:docs.${slug}.sections.${id}.heading`,
      bodyKey: `legal:docs.${slug}.sections.${id}.body`,
    })),
  };
}

export const LEGAL_DOCUMENTS: readonly LegalDocument[] = [
  doc('terms', ['scope', 'accounts', 'conduct', 'liability']),
  doc('privacy', ['collection', 'use', 'sharing', 'rights']),
  doc('eligibility', ['basis', 'review', 'appeal']),
  doc('weddings-withdrawal', ['registration', 'withdrawal', 'costs']),
  doc('souk', ['donations', 'safety', 'disputes']),
] as const;

export function findLegalDocument(slug: string | undefined): LegalDocument | null {
  if (!slug) return null;
  return LEGAL_DOCUMENTS.find((d) => d.slug === slug) ?? null;
}

export const LEGAL_SLUGS: readonly string[] = LEGAL_DOCUMENTS.map((d) => d.slug);
