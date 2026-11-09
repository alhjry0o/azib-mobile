import {
  DEFAULT_LANGUAGE,
  DEFAULT_NAMESPACE,
  FALLBACK_LANGUAGE,
  NAMESPACES,
  SUPPORTED_LANGUAGES,
  isRTL,
  isSupportedLanguage,
} from '@/i18n/config';

describe('i18n config', () => {
  it('defaults are consistent', () => {
    expect(DEFAULT_LANGUAGE).toBe('ar');
    expect(FALLBACK_LANGUAGE).toBe('en');
    expect(DEFAULT_NAMESPACE).toBe('common');
  });

  it('supported languages list is exactly [ar, en]', () => {
    expect(SUPPORTED_LANGUAGES).toEqual(['ar', 'en']);
  });

  it('namespaces list matches the spec', () => {
    expect(NAMESPACES.length).toBe(14);
    expect(NAMESPACES).toContain('common');
    expect(NAMESPACES).toContain('errors');
    expect(NAMESPACES).toContain('staff');
    expect(NAMESPACES).toContain('legal');
  });

  it('isSupportedLanguage narrows correctly', () => {
    expect(isSupportedLanguage('ar')).toBe(true);
    expect(isSupportedLanguage('en')).toBe(true);
    expect(isSupportedLanguage('fr')).toBe(false);
    expect(isSupportedLanguage(42)).toBe(false);
    expect(isSupportedLanguage(null)).toBe(false);
    expect(isSupportedLanguage(undefined)).toBe(false);
  });

  it('isRTL is true only for Arabic', () => {
    expect(isRTL('ar')).toBe(true);
    expect(isRTL('en')).toBe(false);
  });
});
