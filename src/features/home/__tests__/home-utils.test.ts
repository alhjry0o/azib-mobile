import { AppError } from '@/core/errors';
import { greetingKeyForHour } from '../hooks/use-home-greeting';
import { homeSectionQueryKey, resolveSectionStatus } from '../hooks/use-home-section';
import { MAX_STAGGER_ITEMS } from '../components/Stagger';

describe('greetingKeyForHour', () => {
  it('splits the day into three greetings', () => {
    expect(greetingKeyForHour(0)).toBe('home:greeting.morning');
    expect(greetingKeyForHour(11)).toBe('home:greeting.morning');
    expect(greetingKeyForHour(12)).toBe('home:greeting.afternoon');
    expect(greetingKeyForHour(16)).toBe('home:greeting.afternoon');
    expect(greetingKeyForHour(17)).toBe('home:greeting.evening');
    expect(greetingKeyForHour(23)).toBe('home:greeting.evening');
  });
});

describe('resolveSectionStatus', () => {
  const base = { mode: 'demo' as const, enabled: true, isLoading: false };

  it('is not-connected in backend mode regardless of data', () => {
    expect(
      resolveSectionStatus({ ...base, mode: 'backend', result: { ok: true, value: [1] } }),
    ).toBe('not-connected');
  });

  it('is loading while pending', () => {
    expect(resolveSectionStatus({ ...base, isLoading: true, result: undefined })).toBe('loading');
    expect(resolveSectionStatus({ ...base, result: undefined })).toBe('loading');
  });

  it('is empty when disabled', () => {
    expect(resolveSectionStatus({ ...base, enabled: false, result: undefined })).toBe('empty');
  });

  it('maps errors and empty and ready', () => {
    expect(resolveSectionStatus({ ...base, result: { ok: false, error: AppError.network() } })).toBe(
      'error',
    );
    expect(resolveSectionStatus({ ...base, result: { ok: true, value: [] } })).toBe('empty');
    expect(resolveSectionStatus({ ...base, result: { ok: true, value: [1] } })).toBe('ready');
  });
});

describe('home section query keys', () => {
  it('scopes each section under home + mode + id', () => {
    expect(homeSectionQueryKey('demo', 'weddings')).toEqual(['home', 'demo', 'weddings']);
  });
});

describe('stagger cap', () => {
  it('never animates more than eight items', () => {
    expect(MAX_STAGGER_ITEMS).toBe(8);
  });
});
