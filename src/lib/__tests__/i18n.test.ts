import { getLocale, setLocale, t } from '@/lib/i18n';

describe('i18n (temporary, replaced in P03)', () => {
  afterEach(() => {
    setLocale('ar');
  });

  it('defaults to the Arabic app name', () => {
    setLocale('ar');
    expect(getLocale()).toBe('ar');
    expect(t('common.appName')).toBe('عازب');
  });

  it('resolves the English app name after switching locale', () => {
    setLocale('en');
    expect(t('common.appName')).toBe('AZIB');
  });

  it('returns the key unchanged for unknown keys', () => {
    setLocale('ar');
    expect(t('does.not.exist')).toBe('does.not.exist');
  });

  it('returns the key unchanged when the resolved value is not a string', () => {
    setLocale('ar');
    expect(t('common')).toBe('common');
  });
});
