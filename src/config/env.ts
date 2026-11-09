/**
 * env — الإعدادات العامة (EXPO_PUBLIC_*) مع تحقق Zod وفشل مبكر.
 *
 * ما هو هنا: متغيرات آمنة للنشر (تبدأ بـ EXPO_PUBLIC_*).
 * ما ليس هنا: أي سر (service_role، مفاتيح دفع، إلخ) — تلك لا تصل العميل أصلاً.
 *
 * إن غاب متغير مطلوب أو كان غير صحيح، نرمي فوراً برسالة واضحة
 * لأن التطبيق لا يمكن أن يعمل في حالة غامضة.
 */

import { z } from 'zod';

const RawEnvSchema = z.object({
  EXPO_PUBLIC_APP_MODE: z.enum(['development', 'staging', 'production']).default('development'),
  EXPO_PUBLIC_ENV: z.enum(['local', 'dev', 'staging', 'prod']).default('local'),
  EXPO_PUBLIC_SUPABASE_URL: z.string().trim().optional().or(z.literal('')),
  EXPO_PUBLIC_SUPABASE_ANON_KEY: z.string().trim().optional().or(z.literal('')),
});

export type RawEnvInput = z.infer<typeof RawEnvSchema>;

export interface AppEnv {
  readonly APP_MODE: 'development' | 'staging' | 'production';
  readonly ENV: 'local' | 'dev' | 'staging' | 'prod';
  readonly SUPABASE_URL: string | null;
  readonly SUPABASE_ANON_KEY: string | null;
  /** true فقط عندما يكون كلا المتغيرين موجودين معاً وصحيحَين. */
  readonly isSupabaseConfigured: boolean;
}

export class EnvValidationError extends Error {
  readonly issues: ReadonlyArray<string>;
  constructor(issues: ReadonlyArray<string>) {
    super(`Invalid environment variables:\n - ${issues.join('\n - ')}`);
    this.name = 'EnvValidationError';
    this.issues = issues;
    Object.freeze(this.issues);
  }
}

/**
 * parseEnv — دالة نقية قابلة للاختبار.
 * تمرير `process.env` أو كائن اختباري.
 */
export function parseEnv(source: Record<string, string | undefined>): AppEnv {
  const result = RawEnvSchema.safeParse(source);
  if (!result.success) {
    const issues = result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`);
    throw new EnvValidationError(issues);
  }

  const { EXPO_PUBLIC_APP_MODE, EXPO_PUBLIC_ENV, EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY } =
    result.data;

  const url = EXPO_PUBLIC_SUPABASE_URL && EXPO_PUBLIC_SUPABASE_URL.length > 0 ? EXPO_PUBLIC_SUPABASE_URL : null;
  const key = EXPO_PUBLIC_SUPABASE_ANON_KEY && EXPO_PUBLIC_SUPABASE_ANON_KEY.length > 0 ? EXPO_PUBLIC_SUPABASE_ANON_KEY : null;

  // إذا وُجد أحدهما فقط، الإعداد ناقص — فشل مبكر بدل تشغيل بنصف إعداد.
  if ((url && !key) || (!url && key)) {
    throw new EnvValidationError([
      'EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY must be set together or both absent.',
    ]);
  }

  return Object.freeze({
    APP_MODE: EXPO_PUBLIC_APP_MODE,
    ENV: EXPO_PUBLIC_ENV,
    SUPABASE_URL: url,
    SUPABASE_ANON_KEY: key,
    isSupabaseConfigured: url !== null && key !== null,
  });
}

/**
 * env — القيمة المحسوبة مرة واحدة عند الاستيراد.
 * أي متغير غير صحيح يُفشل التطبيق عند البدء برسالة واضحة.
 */
export const env: AppEnv = parseEnv(process.env as Record<string, string | undefined>);
