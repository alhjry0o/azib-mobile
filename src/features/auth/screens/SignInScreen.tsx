import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Banner, Button, TextInput } from '@/components/ui';
import { ROUTES, href } from '@/constants/routes';
import { SignInSchema } from '@/schemas/auth';
import { AuthScaffold } from '../components/AuthScaffold';
import { authErrorKey } from '../errors';
import { useAuth } from '../use-auth';

export function SignInScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const auth = useAuth();
  const { control, handleSubmit, formState } = useForm({
    resolver: zodResolver(SignInSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    const result = await auth.signIn(values);
    if (!result.ok) return;
    router.replace(
      href(result.value.pendingVerification ? ROUTES.auth.verify : ROUTES.tabs.home),
    );
  });

  return (
    <AuthScaffold
      testID="sign-in-screen"
      title={t('auth:signIn.title')}
      subtitle={t('auth:signIn.subtitle')}
      backTo={ROUTES.auth.welcome}
    >
      <Controller
        control={control}
        name="email"
        render={({ field }) => (
          <TextInput
            testID="sign-in-email"
            label={t('auth:fields.email')}
            required
            leftIcon="user"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            errorText={
              formState.errors.email?.message ? t(String(formState.errors.email.message)) : undefined
            }
          />
        )}
      />
      <Controller
        control={control}
        name="password"
        render={({ field }) => (
          <TextInput
            testID="sign-in-password"
            label={t('auth:fields.password')}
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
      {auth.error ? (
        <Banner variant="error" message={t(authErrorKey(auth.error))} testID="sign-in-error" />
      ) : null}
      <Button
        fullWidth
        loading={auth.busy}
        label={t('auth:signIn.submit')}
        onPress={() => {
          void onSubmit();
        }}
        testID="sign-in-submit"
      />
      <Button
        variant="ghost"
        fullWidth
        label={t('auth:signIn.forgot')}
        onPress={() => router.push(href(ROUTES.auth.forgotPassword))}
        testID="sign-in-forgot"
      />
      <Button
        variant="ghost"
        fullWidth
        label={t('auth:signIn.toSignUp')}
        onPress={() => router.push(href(ROUTES.auth.signUp))}
        testID="sign-in-to-sign-up"
      />
    </AuthScaffold>
  );
}
