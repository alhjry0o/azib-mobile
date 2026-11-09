/**
 * AppError — تصنيف موحّد لأخطاء التطبيق.
 *
 * القواعد:
 * - `kind` هو التصنيف العام (للاتخاذ الآلي).
 * - `i18nKey` هو مفتاح الترجمة للعرض للمستخدم.
 * - `meta` للمعلومات التشخيصية (لا تُعرض للمستخدم مباشرة).
 * - لا ترمِ AppError مباشرة من داخل components. أعِدها كـ Result.
 */

export type AppErrorKind =
  | 'Network'
  | 'Auth'
  | 'Forbidden'
  | 'Validation'
  | 'NotFound'
  | 'Conflict'
  | 'NotConnected'
  | 'Unknown';

export interface AppErrorMeta {
  /** كود داخلي اختياري (مثل 'PROFILE_MISSING'). */
  readonly code?: string;
  /** حالة HTTP إن أتت من طبقة شبكة. */
  readonly httpStatus?: number;
  /** حقول إضافية تشخيصية — لا تُعرض للمستخدم. */
  readonly context?: Readonly<Record<string, unknown>>;
  /** السبب الأصلي (خطأ JS أو AppError آخر). */
  readonly cause?: unknown;
}

const I18N_KEYS: Record<AppErrorKind, string> = {
  Network: 'errors.network',
  Auth: 'errors.auth',
  Forbidden: 'errors.forbidden',
  Validation: 'errors.validation',
  NotFound: 'errors.notFound',
  Conflict: 'errors.conflict',
  NotConnected: 'errors.notConnected',
  Unknown: 'errors.unknown',
};

export class AppError {
  readonly kind: AppErrorKind;
  readonly i18nKey: string;
  readonly meta: AppErrorMeta;

  private constructor(kind: AppErrorKind, meta: AppErrorMeta) {
    this.kind = kind;
    this.i18nKey = I18N_KEYS[kind];
    this.meta = meta;
    Object.freeze(this.meta);
    Object.freeze(this);
  }

  static network(meta: AppErrorMeta = {}): AppError {
    return new AppError('Network', meta);
  }
  static auth(meta: AppErrorMeta = {}): AppError {
    return new AppError('Auth', meta);
  }
  static forbidden(meta: AppErrorMeta = {}): AppError {
    return new AppError('Forbidden', meta);
  }
  static validation(meta: AppErrorMeta = {}): AppError {
    return new AppError('Validation', meta);
  }
  static notFound(meta: AppErrorMeta = {}): AppError {
    return new AppError('NotFound', meta);
  }
  static conflict(meta: AppErrorMeta = {}): AppError {
    return new AppError('Conflict', meta);
  }
  static notConnected(meta: AppErrorMeta = {}): AppError {
    return new AppError('NotConnected', meta);
  }
  static unknown(meta: AppErrorMeta = {}): AppError {
    return new AppError('Unknown', meta);
  }

  static fromKind(kind: AppErrorKind, meta: AppErrorMeta = {}): AppError {
    return new AppError(kind, meta);
  }

  /** للعرض في سجلات التشخيص فقط. لا تُعرض للمستخدم. */
  toString(): string {
    return `AppError(${this.kind}, code=${this.meta.code ?? '-'})`;
  }

  toJSON(): {
    kind: AppErrorKind;
    i18nKey: string;
    code: string | null;
    httpStatus: number | null;
    context: Record<string, unknown> | null;
  } {
    return {
      kind: this.kind,
      i18nKey: this.i18nKey,
      code: this.meta.code ?? null,
      httpStatus: this.meta.httpStatus ?? null,
      context: this.meta.context ? { ...this.meta.context } : null,
    };
  }
}

/** يحوّل أي `unknown` مُلتقَط إلى AppError. مفيد في catch blocks. */
export function toAppError(caught: unknown): AppError {
  if (caught instanceof AppError) return caught;

  if (caught instanceof Error) {
    const msg = caught.message.toLowerCase();
    if (msg.includes('network') || msg.includes('fetch')) {
      return AppError.network({ cause: caught });
    }
    return AppError.unknown({ cause: caught });
  }

  return AppError.unknown({ cause: caught });
}
