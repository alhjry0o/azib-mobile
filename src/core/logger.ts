/**
 * Logger — تسجيل آمن بلا PII.
 *
 * ضوابط إخفاء الهوية:
 * - بريد إلكتروني → [REDACTED_EMAIL]
 * - رقم هاتف (يمني أو عام) → [REDACTED_PHONE]
 * - توكن Bearer / JWT → [REDACTED_TOKEN]
 * - أرقام بطاقة (13–19 رقماً) → [REDACTED_CARD]
 *
 * القاعدة: لا تسجّل أبداً كائنات كاملة تحتوي بيانات مستخدم.
 * مرّر حقولاً منقّاة أو استخدم redact() صراحةً.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const REDACT_PATTERNS: ReadonlyArray<readonly [RegExp, string]> = [
  // JWT (three base64url segments starting with eyJ)
  [/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g, '[REDACTED_TOKEN]'],
  // Bearer tokens
  [/(bearer\s+)[A-Za-z0-9._-]+/gi, '$1[REDACTED_TOKEN]'],
  // Email
  [/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, '[REDACTED_EMAIL]'],
  // Card-like (13–19 digits, optionally grouped)
  [/\b(?:\d[ -]*?){13,19}\b/g, '[REDACTED_CARD]'],
  // Phone (Yemen + generic + E.164)
  [/(?:\+?\d{1,3}[-\s]?)?(?:0|\d)?\d{7,12}/g, '[REDACTED_PHONE]'],
];

export function redactString(input: string): string {
  let out = input;
  for (const [pattern, replacement] of REDACT_PATTERNS) {
    out = out.replace(pattern, replacement);
  }
  return out;
}

export function redact(value: unknown, depth = 0): unknown {
  if (depth > 6) return '[DEPTH_LIMIT]';
  if (value === null || value === undefined) return value;
  if (typeof value === 'string') return redactString(value);
  if (typeof value === 'number' || typeof value === 'boolean') return value;
  if (value instanceof Error) return { name: value.name, message: redactString(value.message) };
  if (Array.isArray(value)) return value.map((v) => redact(v, depth + 1));
  if (typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = redact(v, depth + 1);
    }
    return out;
  }
  return '[UNKNOWN]';
}

export interface Logger {
  debug(message: string, context?: Record<string, unknown>): void;
  info(message: string, context?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>): void;
  error(message: string, context?: Record<string, unknown>): void;
}

const isDev = (): boolean => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const proc = (globalThis as any).process;
  return proc?.env?.NODE_ENV !== 'production';
};

export const logger: Logger = {
  debug(message, context) {
    if (!isDev()) return;
    // eslint-disable-next-line no-console
    console.debug('[debug]', redactString(message), context ? redact(context) : undefined);
  },
  info(message, context) {
    if (!isDev()) return;
    // eslint-disable-next-line no-console
    console.info('[info]', redactString(message), context ? redact(context) : undefined);
  },
  warn(message, context) {
    // eslint-disable-next-line no-console
    console.warn('[warn]', redactString(message), context ? redact(context) : undefined);
  },
  error(message, context) {
    // eslint-disable-next-line no-console
    console.error('[error]', redactString(message), context ? redact(context) : undefined);
  },
};
