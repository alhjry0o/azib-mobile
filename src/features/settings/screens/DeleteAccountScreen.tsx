import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import {
  Banner,
  Button,
  Card,
  Checkbox,
  ProgressBar,
  Text,
  TextInput,
  useToast,
} from '@/components/ui';
import { ROUTES, href } from '@/constants/routes';
import { authErrorKey } from '@/features/auth/errors';
import { DELETION_PHRASE, DeleteAccountSchema } from '@/schemas/security';
import { useTheme } from '@/theme';
import { SettingsScaffold } from '../components/SettingsScaffold';
import { useAccountDeletion } from '../use-account-deletion';

const IMPACT_KEYS = ['deleted', 'anonymized', 'retained'] as const;

export function DeleteAccountScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const toast = useToast();
  const deletion = useAccountDeletion();
  const [step, setStep] = useState(0);

  const { control, handleSubmit, formState } = useForm({
    resolver: zodResolver(DeleteAccountSchema),
    defaultValues: { password: '', phrase: '', acknowledged: false },
  });

  const onSubmit = handleSubmit(async (values) => {
    const result = await deletion.schedule(values.password);
    if (result.ok) setStep(2);
  });

  const cancel = async (): Promise<void> => {
    const result = await deletion.cancel();
    if (!result.ok) return;
    toast.show({ message: t('auth:deletion.cancelled'), variant: 'success' });
    setStep(0);
  };

  const scheduled = deletion.request;

  return (
    <SettingsScaffold
      testID="settings-delete-screen"
      title={t('profile:settings.rows.deleteAccount')}
      guardBackend
    >
      <ProgressBar value={(step + 1) / 3} testID="deletion-progress" />
      <Banner
        variant="warning"
        message={t('auth:deletion.policyPending')}
        testID="deletion-policy-pending"
      />

      {step === 0 ? (
        <View style={[styles.block, { gap: theme.spacing[3] }]} testID="deletion-step-explain">
          {IMPACT_KEYS.map((key) => (
            <Card key={key} style={{ gap: theme.spacing[2] }} testID={`deletion-impact-${key}`}>
              <Text variant="bodyStrong">{t(`auth:deletion.${key}.title`)}</Text>
              <Text variant="body" color="secondary">
                {t(`auth:deletion.${key}.body`)}
              </Text>
            </Card>
          ))}
          <Button
            fullWidth
            variant="danger"
            label={t('common:buttons.continue')}
            onPress={() => setStep(1)}
            testID="deletion-continue"
          />
          <Button
            variant="ghost"
            fullWidth
            label={t('common:buttons.back')}
            onPress={() => router.replace(href(ROUTES.settings.root))}
            testID="deletion-back"
          />
        </View>
      ) : null}

      {step === 1 ? (
        <View style={[styles.block, { gap: theme.spacing[3] }]} testID="deletion-step-confirm">
          <Text variant="body" color="secondary">
            {t('auth:deletion.confirmNote', { phrase: DELETION_PHRASE })}
          </Text>
          <Controller
            control={control}
            name="password"
            render={({ field }) => (
              <TextInput
                testID="deletion-password"
                label={t('auth:fields.password')}
                required
                secureTextEntry
                autoCapitalize="none"
                leftIcon="shield"
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
          <Controller
            control={control}
            name="phrase"
            render={({ field }) => (
              <TextInput
                testID="deletion-phrase"
                label={t('auth:deletion.phraseLabel')}
                required
                autoCapitalize="characters"
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                errorText={
                  formState.errors.phrase?.message
                    ? t(String(formState.errors.phrase.message))
                    : undefined
                }
              />
            )}
          />
          <Controller
            control={control}
            name="acknowledged"
            render={({ field }) => (
              <Checkbox
                testID="deletion-ack"
                checked={field.value}
                onCheckedChange={field.onChange}
                label={t('auth:deletion.ackLabel')}
                error={!!formState.errors.acknowledged}
              />
            )}
          />
          {deletion.error ? (
            <Banner
              variant="error"
              message={t(authErrorKey(deletion.error))}
              testID="deletion-error"
            />
          ) : null}
          <Button
            fullWidth
            variant="danger"
            loading={deletion.busy}
            label={t('auth:deletion.confirmAction')}
            onPress={() => {
              void onSubmit();
            }}
            testID="deletion-submit"
          />
          <Button
            variant="ghost"
            fullWidth
            label={t('common:buttons.back')}
            onPress={() => setStep(0)}
            testID="deletion-back-to-explain"
          />
        </View>
      ) : null}

      {step === 2 && scheduled ? (
        <View style={[styles.block, { gap: theme.spacing[3] }]} testID="deletion-scheduled">
          <Card style={{ gap: theme.spacing[2] }}>
            <Text variant="h3">{t('auth:deletion.scheduledTitle')}</Text>
            <Text variant="body" color="secondary" testID="deletion-scheduled-for">
              {t('auth:deletion.scheduledFor', {
                date: scheduled.scheduledFor,
                days: scheduled.gracePeriodDays,
              })}
            </Text>
            <Text variant="caption" color="secondary">
              {t('auth:deletion.serverNote')}
            </Text>
          </Card>
          <Button
            fullWidth
            variant="secondary"
            loading={deletion.busy}
            label={t('auth:deletion.cancelAction')}
            onPress={() => {
              void cancel();
            }}
            testID="deletion-cancel"
          />
        </View>
      ) : null}
    </SettingsScaffold>
  );
}

const styles = StyleSheet.create({
  block: { width: '100%' },
});
