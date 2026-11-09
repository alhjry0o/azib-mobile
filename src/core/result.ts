/**
 * Result<T, E> — نمط بديل للاستثناءات في حدود الإجراءات الداخلية.
 *
 * القاعدة: استخدم Result داخل repositories و adapters.
 * لا تستخدم Result داخل React components مباشرة (استخدم isLoading/error).
 *
 * `E` افتراضياً هو `AppError`، لكنه عام لاستخدامه مع أنواع أخرى في المستقبل.
 */

import type { AppError } from './errors';

export type Result<T, E = AppError> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E };

export function ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

export function err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}

export function isOk<T, E>(r: Result<T, E>): r is { ok: true; value: T } {
  return r.ok;
}

export function isErr<T, E>(r: Result<T, E>): r is { ok: false; error: E } {
  return !r.ok;
}

export function map<T, U, E>(r: Result<T, E>, fn: (value: T) => U): Result<U, E> {
  return r.ok ? { ok: true, value: fn(r.value) } : r;
}

export function mapErr<T, E, F>(r: Result<T, E>, fn: (error: E) => F): Result<T, F> {
  return r.ok ? r : { ok: false, error: fn(r.error) };
}

export function unwrapOr<T, E>(r: Result<T, E>, fallback: T): T {
  return r.ok ? r.value : fallback;
}

/**
 * mapAsync — يأخذ قيمة T ويعيد Promise<U>، ويغلّفها في Result.
 * الاستخدام: سلسلة async operations داخل service دون رمي استثناءات.
 */
export async function mapAsync<T, U, E>(
  r: Result<T, E>,
  fn: (value: T) => Promise<U>,
): Promise<Result<U, E>> {
  if (!r.ok) return r;
  return { ok: true, value: await fn(r.value) };
}

/**
 * tryAsync — يشغّل دالة async ويعيد Result.
 * الأخطاء التي تُرمى تُحوَّل عبر `onError` (يجب أن ينتج AppError أو نوع E).
 */
export async function tryAsync<T, E>(
  fn: () => Promise<T>,
  onError: (caught: unknown) => E,
): Promise<Result<T, E>> {
  try {
    return { ok: true, value: await fn() };
  } catch (caught) {
    return { ok: false, error: onError(caught) };
  }
}
