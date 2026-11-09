import {
  applyDirectionToNativeLayer,
  currentLayoutIsRTL,
  directionFor,
  needsReloadForLanguageChange,
} from '@/i18n/rtl';

describe('i18n rtl helpers', () => {
  it('directionFor returns rtl for Arabic', () => {
    expect(directionFor('ar')).toBe('rtl');
  });

  it('directionFor returns ltr for English', () => {
    expect(directionFor('en')).toBe('ltr');
  });

  it('needsReloadForLanguageChange between same-direction languages is false', () => {
    expect(needsReloadForLanguageChange('ar', 'ar')).toBe(false);
    expect(needsReloadForLanguageChange('en', 'en')).toBe(false);
  });

  it('needsReloadForLanguageChange across directions is true', () => {
    expect(needsReloadForLanguageChange('ar', 'en')).toBe(true);
    expect(needsReloadForLanguageChange('en', 'ar')).toBe(true);
  });

  it('currentLayoutIsRTL returns a boolean', () => {
    expect(typeof currentLayoutIsRTL()).toBe('boolean');
  });

  it('applyDirectionToNativeLayer does not throw', () => {
    expect(() => applyDirectionToNativeLayer('ar')).not.toThrow();
    expect(() => applyDirectionToNativeLayer('en')).not.toThrow();
  });
});
