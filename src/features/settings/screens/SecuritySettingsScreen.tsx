import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';
import { Banner, Button, Card, Icon, ListItem, Switch, Text, TextInput, useToast } from '@/components/ui';
import { ROUTES, href } from '@/constants/routes';
import { PasswordStrengthMeter } from '@/features/auth';
import { authErrorKey } from '@/features/auth/errors';
import { ChangePasswordSchema } from '@/schemas/security';
import { useTheme } from '@/theme';
import { BiometricGate } from '../components/BiometricGate';
import { SettingsScaffold } from '../components/SettingsScaffold';
import { useBiometricLock } from '../use-biometric-lock';
import { useSecurity } from '../use-security';

export function SecuritySettingsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const toast = useToast();
  const security = useSecurity();
  const lock = useBiometricLock();

  const { control, handleSubmit, formState, reset } = useForm({
    resolver: zodResolver(ChangePasswordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirm: '' },
  });
  const newPassword = useWatch({ control, name: 'newPassword' });

  const onSubmit = handleSubmit(async (values) => {
    const result = await security.changePassword(values.currentPassword, values.newPassword);
    if (!result.ok) return;
    reset({ currentPassword: '', newPassword: '', confirm: '' });
    toast.show({ message: t('auth:security.changed'), variant: 'success' });
  });

  const biometricUnavailable = lock.ready && (!lock.supported || !lock.enrolled);

  return (
    <BiometricGate testID="security">
      <SettingsScaffold
        testID="settings-security-screen"
        title={t('profile:settings.rows.security')}
        guardBackend
      >
        <Card style={{ gap: theme.spacing[3] }}>
          <Text variant="h3">{t('auth:security.biometricTitle')}</Text>
          <Switch
            value={lock.enabled}
            disabled={biometricUnavailable}
            onValueChange={lock.setEnabled}
            label={t('auth:security.biometricToggle')}
            labelFirst
            testID="security-biometric-switch"
          />
          <Text variant="caption" color="secondary">
            {biometricUnavailable
              ? t('auth:security.biometricUnavailable')
              : t('auth:security.biometricNote')}
          </Text>
        </Card>

        <Text variant="h3">{t('auth:security.changeTitle')}</Text>
        <Text variant="caption" color="secondary">
          {t('auth:security.changeNote')}
        </Text>
        <Controller
          control={control}
          name="currentPassword"
          render={({ field }) => (
            <TextInput
              testID="security-current-password"
              label={t('auth:security.currentPassword')}
              required
              secureTextEntry
              autoCapitalize="none"
              leftIcon="shield"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              errorText={
                formState.errors.currentPassword?.message
                  ? t(String(formState.errors.currentPassword.message))
                  : undefined
              }
            />
          )}
        />
        <Controller
          control={control}
          name="newPassword"
          render={({ field }) => (
            <TextInput
              testID="security-new-password"
              label={t('auth:fields.newPassword')}
              required
              secureTextEntry
              autoCapitalize="none"
              leftIcon="shield"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              errorText={
                formState.errors.newPassword?.message
                  ? t(String(formState.errors.newPassword.message))
                  : undefined
              }
            />
          )}
        />
        <PasswordStrengthMeter value={newPassword ?? ''} testID="security-strength" />
        <Controller
          control={control}
          name="confirm"
          render={({ field }) => (
            <TextInput
              testID="security-confirm-password"
              label={t('auth:fields.confirmPassword')}
              required
              secureTextEntry
              autoCapitalize="none"
              leftIcon="shield"
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
        {security.error ? (
          <Banner
            variant="error"
            message={t(authErrorKey(security.error))}
            testID="security-error"
          />
        ) : null}
        <Button
          fullWidth
          loading={security.busy}
          label={t('auth:security.changeAction')}
          onPress={() => {
            void onSubmit();
          }}
          testID="security-change-submit"
        />
        <ListItem
          variant="card"
          title={t('profile:settings.rows.devices')}
          leading={<Icon name="phone" size={20} />}
          onPress={() => router.push(href(ROUTES.settings.devices))}
          testID="security-open-devices"
        />
      </SettingsScaffold>
    </BiometricGate>
  );
}

const styles = StyleSheet.create({
  spacer: { height: 8 },
});

void styles;
