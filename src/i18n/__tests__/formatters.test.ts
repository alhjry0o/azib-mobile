import {
  formatCurrency,
  formatDate,
  formatNumber,
  formatPercent,
  isIntlAvailable,
} from '@/i18n/formatters';

const ARABIC_DIGIT_RE = /[٠-٩]/;// i18n-allow-arabic
const LATIN_DIGIT_RE = /[0-9]/;

describe('i18n formatters', () => {
  it('Intl is available in the test environment', () => {
    expect(isIntlAvailable()).toBe(true);
  });

  describe('formatNumber', () => {
    it('defaults to Arabic with Arabic numerals', () => {
      const out = formatNumber(1234);
      expect(out).toMatch(ARABIC_DIGIT_RE);
    });

    it('supports Western numerals explicitly', () => {
      const out = formatNumber(1234, { numerals: 'latn' });
      expect(out).toMatch(LATIN_DIGIT_RE);
      expect(out).not.toMatch(ARABIC_DIGIT_RE);
    });

    it('supports English language', () => {
      const out = formatNumber(1234, { language: 'en' });
      expect(out).toMatch(LATIN_DIGIT_RE);
    });
  });

  describe('formatCurrency (YER, no decimals)', () => {
    it('produces Arabic-numeral YER by default', () => {
      const out = formatCurrency(15000);
      expect(out).toMatch(ARABIC_DIGIT_RE);
      expect(out).not.toMatch(/\.\d/);
    });

    it('produces Western-numeral YER for en', () => {
      const out = formatCurrency(15000, { language: 'en' });
      expect(out).toMatch(LATIN_DIGIT_RE);
      expect(out).not.toMatch(/\.\d/);
      expect(out.toUpperCase()).toContain('YER');
    });

    it('has no fractional part (rounds away decimals)', () => {
      const out = formatCurrency(15000.99, { language: 'en' });
      expect(out).not.toMatch(/\.\d/);
    });
  });

  describe('formatDate', () => {
    it('handles ISO strings', () => {
      const out = formatDate('2026-11-09T12:00:00Z', 'short', { language: 'en' });
      expect(out.length).toBeGreaterThan(0);
      expect(out).toMatch(LATIN_DIGIT_RE);
    });

    it('handles Date objects', () => {
      const out = formatDate(new Date('2026-11-09T12:00:00Z'), 'medium', { language: 'en' });
      expect(out.length).toBeGreaterThan(0);
    });

    it('returns empty string for invalid date without throwing', () => {
      expect(formatDate('not-a-date')).toBe('');
    });
  });

  describe('formatPercent', () => {
    it('formats a ratio', () => {
      const out = formatPercent(0.25, { language: 'en' });
      expect(out).toContain('25');
      expect(out).toContain('%');
    });
  });
});
