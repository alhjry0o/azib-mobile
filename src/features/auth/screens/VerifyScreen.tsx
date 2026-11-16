import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Redirect, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Badge, Banner, Button, OTPInput, Text } from '@/components/ui';
import { ROUTES, href } from '@/constants/routes';
import { VerifySchema } from '@/schemas/auth';
import { useAuthStore } from '@/stores';
import { AuthScaffold } from '../components/AuthScaffold';
import { authErrorKey } from '../errors';
import { useAuth } from '../use-auth';
import { useOtp } from '../use-otp';

export function VerifyScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const auth = useAuth();
  const otp = useOtp();
  const challenge = useAuthStore((s) => s.challenge);
  const { control, handleSubmit, formState } = useForm({
    resolver: zodResolver(VerifySchema),
    defaultValues: { code: '' },
  });

  const target = auth.session?.pendingVerification?.target ?? challenge?.target ?? null;

  if (!target) {
    return <Redirect href={href(ROUTES.auth.welcome)} />;
  }

  const onSubmit = handleSubmit(async (values) => {
    const result = await auth.verify(values.code);
    if (result.ok) {
      otp.resetAttempts();
      router.replace(href(ROUTES.tabs.home));
      return;
    }
    otp.recordFailure();
  });

  const onResend = async (): Promise<void> => {
    const result = await auth.resend();
    if (result.ok) otp.markSent();
  };

  return (
    <AuthScaffold
      testID="verify-screen"
      title={t('auth:verify.title')}
      subtitle={t('auth:verify.subtitle')}
      backTo={ROUTES.auth.welcome}
    >
      <Text variant="body" color="secondary" testID="verify-target">
        {t('auth:verify.target', { target })}
      </Text>
      {challenge?.demoCode ? (
        <Badge
          variant="demo"
          label={t('auth:verify.demoCode', { code: challenge.demoCode })}
          testID="verify-demo-code"
        />
      ) : null}
      <Controller
        control={control}
        name="code"
        render={({ field }) => (
          <OTPInput
            testID="verify-code"
            label={t('auth:fields.code')}
            value={field.value}
            onChangeText={field.onChange}
            disabled={otp.locked}
            errorText={
              formState.errors.code?.message ? t(String(formState.errors.code.message)) : undefined
            }
          />
        )}
      />
      {otp.locked ? (
        <Banner variant="error" message={t('auth:verify.maxAttempts')} testID="verify-locked" />
      ) : null}
      {auth.error ? (
        <Banner variant="error" message={t(authErrorKey(auth.error))} testID="verify-error" />
      ) : null}
      <Button
        fullWidth
        loading={auth.busy}
        disabled={otp.locked}
        label={t('auth:verify.submit')}
        onPress={() => {
          void onSubmit();
        }}
        testID="verify-submit"
      />
      <Button
        variant="ghost"
        fullWidth
        disabled={!otp.canResend}
        label={
          otp.canResend
            ? t('auth:verify.resend')
            : t('auth:verify.resendIn', { seconds: otp.secondsLeft })
        }
        onPress={() => {
          void onResend();
        }}
        testID="verify-resend"
      />
    </AuthScaffold>
  );
}
