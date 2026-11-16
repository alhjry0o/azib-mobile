import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Banner, Button, TextInput } from '@/components/ui';
import { ROUTES, href } from '@/constants/routes';
import { ForgotPasswordSchema } from '@/schemas/auth';
import { AuthScaffold } from '../components/AuthScaffold';
import { authErrorKey } from '../errors';
import { useAuth } from '../use-auth';

export function ForgotPasswordScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const auth = useAuth();
  const { control, handleSubmit, formState } = useForm({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    const result = await auth.requestReset(values.email);
    if (result.ok) router.push(href(ROUTES.auth.resetPassword));
  });

  return (
    <AuthScaffold
      testID="forgot-password-screen"
      title={t('auth:forgot.title')}
      subtitle={t('auth:forgot.subtitle')}
      backTo={ROUTES.auth.signIn}
    >
      <Banner variant="info" message={t('auth:forgot.notice')} testID="forgot-notice" />
      <Controller
        control={control}
        name="email"
        render={({ field }) => (
          <TextInput
            testID="forgot-email"
            label={t('auth:fields.email')}
            required
            leftIcon="user"
            keyboardType="email-address"
            autoCapitalize="none"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            errorText={
              formState.errors.email?.message ? t(String(formState.errors.email.message)) : undefined
            }
          />
        )}
      />
      {auth.error ? (
        <Banner variant="error" message={t(authErrorKey(auth.error))} testID="forgot-error" />
      ) : null}
      <Button
        fullWidth
        loading={auth.busy}
        label={t('auth:forgot.submit')}
        onPress={() => {
          void onSubmit();
        }}
        testID="forgot-submit"
      />
    </AuthScaffold>
  );
}
