import { AppError } from '@/core/errors';
import {
  err,
  isErr,
  isOk,
  map,
  mapAsync,
  mapErr,
  ok,
  tryAsync,
  unwrapOr,
} from '@/core/result';

describe('Result', () => {
  it('ok() returns a successful result', () => {
    const r = ok(42);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBe(42);
  });

  it('err() returns a failed result', () => {
    const e = AppError.notFound({ code: 'X' });
    const r = err(e);
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toBe(e);
  });

  it('isOk / isErr narrow correctly', () => {
    const success = ok('v');
    const failure = err(AppError.network());
    expect(isOk(success)).toBe(true);
    expect(isErr(success)).toBe(false);
    expect(isOk(failure)).toBe(false);
    expect(isErr(failure)).toBe(true);
  });

  it('map transforms successful value only', () => {
    expect(map(ok(2), (v) => v * 3)).toEqual({ ok: true, value: 6 });
    const failure = err(AppError.unknown());
    expect(map(failure, (v: number) => v * 3)).toBe(failure);
  });

  it('mapErr transforms error only', () => {
    const failure = err(AppError.network());
    const mapped = mapErr(failure, (e) => AppError.unknown({ cause: e }));
    expect(mapped.ok).toBe(false);
    if (!mapped.ok) expect(mapped.error.kind).toBe('Unknown');

    const success = ok(1);
    expect(mapErr(success, () => AppError.unknown())).toBe(success);
  });

  it('unwrapOr returns value or fallback', () => {
    expect(unwrapOr(ok(7), 0)).toBe(7);
    expect(unwrapOr(err(AppError.notFound()), 0)).toBe(0);
  });

  it('mapAsync passes through failures without calling fn', async () => {
    const failure = err(AppError.notFound());
    const fn = jest.fn(async (v: number) => v + 1);
    const r = await mapAsync(failure, fn);
    expect(r).toBe(failure);
    expect(fn).not.toHaveBeenCalled();
  });

  it('mapAsync transforms successful values', async () => {
    const r = await mapAsync(ok(3), async (v) => v * 2);
    expect(r).toEqual({ ok: true, value: 6 });
  });

  it('tryAsync wraps a success', async () => {
    const r = await tryAsync(async () => 'ok', () => AppError.unknown());
    expect(r).toEqual({ ok: true, value: 'ok' });
  });

  it('tryAsync catches and maps failures', async () => {
    const r = await tryAsync(
      async () => {
        throw new Error('boom');
      },
      () => AppError.network({ code: 'BOOM' }),
    );
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error.kind).toBe('Network');
      expect(r.error.meta.code).toBe('BOOM');
    }
  });
});
