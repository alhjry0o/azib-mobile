import { parseAzibUrl, resolveDeepLink } from '../deep-links';

describe('parseAzibUrl', () => {
  it('parses host-style and path-style azib URLs', () => {
    expect(parseAzibUrl('azib://services')).toBe('/services');
    expect(parseAzibUrl('azib:///services')).toBe('/services');
    expect(parseAzibUrl('AZIB://services')).toBe('/services');
  });

  it('strips groups, query strings, fragments and trailing slashes', () => {
    expect(parseAzibUrl('azib://(tabs)/services?token=abc#x')).toBe('/services');
    expect(parseAzibUrl('azib://services/')).toBe('/services');
  });

  it('returns root for empty URLs and null for foreign schemes', () => {
    expect(parseAzibUrl('azib://')).toBe('/');
    expect(parseAzibUrl('https://example.com/services')).toBeNull();
  });
});

describe('resolveDeepLink', () => {
  it('ignores null and non-azib URLs', () => {
    expect(resolveDeepLink(null).kind).toBe('ignore');
    expect(resolveDeepLink('https://example.com').kind).toBe('ignore');
  });

  it('allows public destinations', () => {
    for (const url of [
      'azib://',
      'azib://services',
      'azib://weddings',
      'azib://partners',
      'azib://account',
      'azib://assistance',
      'azib://souk',
      'azib://jobs',
      'azib://volunteers',
      'azib://learn',
      'azib://calculator',
      'azib://guide',
      'azib://notifications',
      'azib://search',
      'azib://sign-in',
      'azib://maintenance',
    ]) {
      expect(resolveDeepLink(url).kind).toBe('allow');
    }
  });

  it('marks protected areas as guarded (layout guards decide)', () => {
    expect(resolveDeepLink('azib://staff').kind).toBe('guarded');
    expect(resolveDeepLink('azib://staff/reviewers').kind).toBe('guarded');
    expect(resolveDeepLink('azib://dev').kind).toBe('guarded');
    expect(resolveDeepLink('azib://gallery').kind).toBe('guarded');
    expect(resolveDeepLink('azib://onboarding').kind).toBe('guarded');
  });

  it('rejects unknown paths', () => {
    const result = resolveDeepLink('azib://secret-admin-panel');
    expect(result.kind).toBe('not-found');
  });
});
