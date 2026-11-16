import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Redirect, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Badge, Banner, Button, TextInput, useToast } from '@/components/ui';
import { ROUTES, href } from '@/constants/routes';
import { ResetPasswordSchema } from '@/schemas/auth';
import { useAuthStore } from '@/stores';
import { AuthScaffold } from '../components/AuthScaffold';
import { PasswordStrengthMeter } from '../components/PasswordStrengthMeter';
import { authErrorKey } from '../errors';
import { useAuth } from '../use-auth';

export function ResetPasswordScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const auth = useAuth();
  const toast = useToast();
  const challenge = useAuthStore((s) => s.challenge);
  const { control, handleSubmit, formState } = useForm({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: { code: '', password: '', confirm: '' },
  });

  const password = useWatch({
    control,
    name: 'password',
  });

  if (!challenge) {
    return <Redirect href={href(ROUTES.auth.forgotPassword)} />;
  }

  const onSubmit = handleSubmit(async (values) => {
    const result = await auth.resetPassword(values.code, values.password);
    if (!result.ok) return;
    toast.show({ message: t('auth:reset.success'), variant: 'success' });
    router.replace(href(ROUTES.auth.signIn));
  });

  return (
    <AuthScaffold
      testID="reset-password-screen"
      title={t('auth:reset.title')}
      subtitle={t('auth:reset.subtitle')}
      backTo={ROUTES.auth.signIn}
    >
      {challenge.demoCode ? (
        <Badge
          variant="demo"
          label={t('auth:verify.demoCode', { code: challenge.demoCode })}
          testID="reset-demo-code"
        />
      ) : null}
      <Controller
        control={control}
        name="code"
        render={({ field }) => (
          <TextInput
            testID="reset-code"
            label={t('auth:fields.code')}
            required
            keyboardType="number-pad"
            maxLength={6}
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            errorText={
              formState.errors.code?.message ? t(String(formState.errors.code.message)) : undefined
            }
          />
        )}
      />
      <Controller
        control={control}
        name="password"
        render={({ field }) => (
          <TextInput
            testID="reset-password"
            label={t('auth:fields.newPassword')}
            required
            leftIcon="shield"
            secureTextEntry
            autoCapitalize="none"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            errorText={
              formState.errors.password?.message
                ? t(String(formState.errors.password.message))
                : undefined
            }
          />
        )}
      />
      <PasswordStrengthMeter value={password} testID="reset-strength" />
      <Controller
        control={control}
        name="confirm"
        render={({ field }) => (
          <TextInput
            testID="reset-confirm"
            label={t('auth:fields.confirmPassword')}
            required
            leftIcon="shield"
            secureTextEntry
            autoCapitalize="none"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            errorText={
              formState.errors.confirm?.message
                ? t(String(formState.errors.confirm.message))
                : undefined
            }
          />
        )}
      />
      {auth.error ? (
        <Banner variant="error" message={t(authErrorKey(auth.error))} testID="reset-error" />
      ) : null}
      <Button
        fullWidth
        loading={auth.busy}
        label={t('auth:reset.submit')}
        onPress={() => {
          void onSubmit();
        }}
        testID="reset-submit"
      />
    </AuthScaffold>
  );
}
