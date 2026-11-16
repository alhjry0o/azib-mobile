import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Banner, Button, Checkbox, RadioGroup, Text, TextInput } from '@/components/ui';
import { ROUTES, href } from '@/constants/routes';
import { SignUpSchema } from '@/schemas/auth';
import { AuthScaffold } from '../components/AuthScaffold';
import { PasswordStrengthMeter } from '../components/PasswordStrengthMeter';
import { authErrorKey } from '../errors';
import { useAuth } from '../use-auth';

const INTENTS = ['applicant', 'donor', 'partner_owner', 'volunteer'] as const;

export function SignUpScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const auth = useAuth();
  const { control, handleSubmit, formState, watch } = useForm({
    resolver: zodResolver(SignUpSchema),
    defaultValues: {
      displayName: '',
      email: '',
      password: '',
      roleIntent: 'applicant' as (typeof INTENTS)[number],
      acceptTerms: false,
      acceptPrivacy: false,
    },
  });

  const password = watch('password');

  const onSubmit = handleSubmit(async (values) => {
    const result = await auth.signUp({
      displayName: values.displayName,
      email: values.email,
      password: values.password,
      roleIntent: values.roleIntent,
    });
    if (result.ok) router.replace(href(ROUTES.auth.verify));
  });

  return (
    <AuthScaffold
      testID="sign-up-screen"
      title={t('auth:signUp.title')}
      subtitle={t('auth:signUp.subtitle')}
      backTo={ROUTES.auth.welcome}
    >
      <Controller
        control={control}
        name="displayName"
        render={({ field }) => (
          <TextInput
            testID="sign-up-name"
            label={t('auth:fields.displayName')}
            required
            leftIcon="user"
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            errorText={
              formState.errors.displayName?.message
                ? t(String(formState.errors.displayName.message))
                : undefined
            }
          />
        )}
      />
      <Controller
        control={control}
        name="email"
        render={({ field }) => (
          <TextInput
            testID="sign-up-email"
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
      <Controller
        control={control}
        name="password"
        render={({ field }) => (
          <TextInput
            testID="sign-up-password"
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
      <PasswordStrengthMeter value={password} testID="sign-up-strength" />
      <Text variant="bodyStrong">{t('auth:fields.roleIntent')}</Text>
      <Text variant="caption" color="secondary">
        {t('auth:signUp.roleHint')}
      </Text>
      <Controller
        control={control}
        name="roleIntent"
        render={({ field }) => (
          <RadioGroup
            options={INTENTS.map((intent) => ({
              value: intent,
              label: t(`auth:intent.${intent}`),
            }))}
            value={field.value}
            onValueChange={field.onChange}
          />
        )}
      />
      <Text variant="bodyStrong">{t('auth:signUp.consentsTitle')}</Text>
      <Controller
        control={control}
        name="acceptTerms"
        render={({ field }) => (
          <Checkbox
            testID="sign-up-terms"
            checked={field.value}
            onCheckedChange={field.onChange}
            label={t('auth:signUp.terms')}
            error={!!formState.errors.acceptTerms}
          />
        )}
      />
      <Controller
        control={control}
        name="acceptPrivacy"
        render={({ field }) => (
          <Checkbox
            testID="sign-up-privacy"
            checked={field.value}
            onCheckedChange={field.onChange}
            label={t('auth:signUp.privacy')}
            error={!!formState.errors.acceptPrivacy}
          />
        )}
      />
      {formState.errors.acceptTerms || formState.errors.acceptPrivacy ? (
        <Text variant="caption" color="accent" testID="sign-up-consent-error">
          {t('auth:validation.consentRequired')}
        </Text>
      ) : null}
      {auth.error ? (
        <Banner variant="error" message={t(authErrorKey(auth.error))} testID="sign-up-error" />
      ) : null}
      <Button
        fullWidth
        loading={auth.busy}
        label={t('auth:signUp.submit')}
        onPress={() => {
          void onSubmit();
        }}
        testID="sign-up-submit"
      />
      <Button
        variant="ghost"
        fullWidth
        label={t('auth:signUp.toSignIn')}
        onPress={() => router.replace(href(ROUTES.auth.signIn))}
        testID="sign-up-to-sign-in"
      />
    </AuthScaffold>
  );
}
