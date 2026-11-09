import { AppError, toAppError } from '@/core/errors';

describe('AppError', () => {
  it.each([
    ['network', 'Network', 'errors.network'],
    ['auth', 'Auth', 'errors.auth'],
    ['forbidden', 'Forbidden', 'errors.forbidden'],
    ['validation', 'Validation', 'errors.validation'],
    ['notFound', 'NotFound', 'errors.notFound'],
    ['conflict', 'Conflict', 'errors.conflict'],
    ['notConnected', 'NotConnected', 'errors.notConnected'],
    ['unknown', 'Unknown', 'errors.unknown'],
  ] as const)('%s() sets kind and i18n key', (factory, kind, i18n) => {
    const e = AppError[factory]();
    expect(e.kind).toBe(kind);
    expect(e.i18nKey).toBe(i18n);
  });

  it('preserves meta', () => {
    const e = AppError.validation({ code: 'E001', context: { field: 'name' } });
    expect(e.meta.code).toBe('E001');
    expect(e.meta.context).toEqual({ field: 'name' });
  });

  it('is immutable', () => {
    const e = AppError.notFound({ code: 'X' });
    expect(Object.isFrozen(e)).toBe(true);
    expect(Object.isFrozen(e.meta)).toBe(true);
  });

  it('toString and toJSON are safe', () => {
    const e = AppError.network({ code: 'TIMEOUT', httpStatus: 504 });
    expect(e.toString()).toBe('AppError(Network, code=TIMEOUT)');
    expect(e.toJSON()).toEqual({
      kind: 'Network',
      i18nKey: 'errors.network',
      code: 'TIMEOUT',
      httpStatus: 504,
      context: null,
    });
  });

  it('toAppError passes AppError through', () => {
    const e = AppError.forbidden();
    expect(toAppError(e)).toBe(e);
  });

  it('toAppError maps generic Error to Unknown', () => {
    const e = toAppError(new Error('boom'));
    expect(e.kind).toBe('Unknown');
  });

  it('toAppError heuristics map network-like messages', () => {
    const e = toAppError(new Error('Network request failed'));
    expect(e.kind).toBe('Network');
  });

  it('toAppError handles non-Error values', () => {
    const e = toAppError('some string');
    expect(e.kind).toBe('Unknown');
  });
});
