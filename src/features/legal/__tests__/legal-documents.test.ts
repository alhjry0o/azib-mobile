import { LEGAL_DOCUMENTS, LEGAL_SLUGS, findLegalDocument } from '../legal-documents';

describe('legal document registry', () => {
  it('ships the five required documents', () => {
    expect(LEGAL_SLUGS).toEqual([
      'terms',
      'privacy',
      'eligibility',
      'weddings-withdrawal',
      'souk',
    ]);
  });

  it('marks every document as requiring legal review', () => {
    for (const document of LEGAL_DOCUMENTS) {
      expect(document.requiresLegalReview).toBe(true);
      expect(document.version.length).toBeGreaterThan(0);
    }
  });

  it('uses i18n keys only, never literal text', () => {
    for (const document of LEGAL_DOCUMENTS) {
      expect(document.titleKey.startsWith('legal:docs.')).toBe(true);
      expect(document.summaryKey.startsWith('legal:docs.')).toBe(true);
      for (const section of document.sections) {
        expect(section.headingKey.startsWith('legal:docs.')).toBe(true);
        expect(section.bodyKey.startsWith('legal:docs.')).toBe(true);
      }
    }
  });

  it('has unique slugs and at least three sections each', () => {
    expect(new Set(LEGAL_SLUGS).size).toBe(LEGAL_SLUGS.length);
    for (const document of LEGAL_DOCUMENTS) {
      expect(document.sections.length).toBeGreaterThanOrEqual(3);
    }
  });

  it('resolves known slugs and rejects unknown ones', () => {
    expect(findLegalDocument('terms')?.slug).toBe('terms');
    expect(findLegalDocument('nope')).toBeNull();
    expect(findLegalDocument(undefined)).toBeNull();
  });
});
