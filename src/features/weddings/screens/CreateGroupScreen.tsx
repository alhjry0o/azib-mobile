import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import {
  Banner,
  Button,
  Checkbox,
  DatePicker,
  Select,
  Stepper,
  Text,
  TextInput,
  Textarea,
} from '@/components/ui';
import { ROUTES, href } from '@/constants/routes';
import { childrenOf } from '@/features/profile/locations';
import { authErrorKey } from '@/features/auth/errors';
import { useTheme } from '@/theme';
import { WeddingScaffold } from '../components/WeddingScaffold';
import { useCreateGroup } from '../hooks/use-create-group';
import { DEFAULT_WITHDRAWAL_POLICY } from '../engine/withdrawal-impact';

const STEPS = ['basics', 'schedule', 'review'] as const;

export function CreateGroupScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const wizard = useCreateGroup();
  const [step, setStep] = useState(0);

  const governorates = childrenOf(null).map((g) => ({ value: g.id, label: t(g.nameKey) }));
  const districts = wizard.form.governorateId
    ? childrenOf(wizard.form.governorateId).map((d) => ({ value: d.id, label: t(d.nameKey) }))
    : [];

  const next = (): void => {
    if (wizard.validateStep(step)) setStep((prev) => Math.min(prev + 1, STEPS.length - 1));
  };

  const submit = async (): Promise<void> => {
    const result = await wizard.submit();
    if (result.ok) router.replace(href(ROUTES.weddings.detail(result.value.id)));
  };

  const errorText = (field: string): string | undefined => {
    const key = wizard.fieldErrors[field];
    return key ? t(key) : undefined;
  };

  return (
    <WeddingScaffold
      testID="create-group-screen"
      title={t('weddings:create.title')}
      subtitle={t('weddings:create.subtitle')}
    >
      <Stepper
        steps={STEPS.map((s) => t(`weddings:create.steps.${s}`))}
        currentStep={step}
        testID="create-group-stepper"
      />
      <Banner
        variant="warning"
        message={t('weddings:create.maxNote', { max: wizard.maxGroupSize })}
        testID="create-group-max-note"
      />

      {step === 0 ? (
        <View style={{ gap: theme.spacing[3] }} testID="create-step-basics">
          <TextInput
            testID="group-title"
            label={t('weddings:create.fields.name')}
            required
            value={wizard.form.title}
            onChangeText={(value) => wizard.patch({ title: value })}
            errorText={errorText('title')}
          />
          <Select
            testID="group-governorate"
            label={t('weddings:create.fields.governorate')}
            required
            value={wizard.form.governorateId || null}
            options={governorates}
            onChange={(value) => wizard.patch({ governorateId: value, districtId: null })}
            errorText={errorText('governorateId')}
          />
          <Select
            testID="group-district"
            label={t('weddings:create.fields.district')}
            value={wizard.form.districtId}
            options={districts}
            disabled={districts.length === 0}
            onChange={(value) => wizard.patch({ districtId: value })}
          />
          <TextInput
            testID="group-city"
            label={t('weddings:create.fields.city')}
            value={wizard.form.city ?? ''}
            onChangeText={(value) => wizard.patch({ city: value.length > 0 ? value : null })}
          />
        </View>
      ) : null}

      {step === 1 ? (
        <View style={{ gap: theme.spacing[3] }} testID="create-step-schedule">
          <DatePicker
            testID="group-date"
            label={t('weddings:create.fields.scheduledDate')}
            required
            value={wizard.form.scheduledDate ? new Date(wizard.form.scheduledDate) : null}
            onChange={(date) =>
              wizard.patch({ scheduledDate: date ? date.toISOString() : '' })
            }
            errorText={errorText('scheduledDate')}
          />
          <DatePicker
            testID="group-alternate-date"
            label={t('weddings:create.fields.alternateDate')}
            helpText={t('weddings:create.help.alternateDate')}
            value={wizard.form.alternateDate ? new Date(wizard.form.alternateDate) : null}
            onChange={(date) => wizard.patch({ alternateDate: date ? date.toISOString() : null })}
          />
          <TextInput
            testID="group-target-count"
            label={t('weddings:create.fields.targetCount')}
            required
            keyboardType="number-pad"
            helpText={t('weddings:create.help.targetCount', { max: wizard.maxGroupSize })}
            value={wizard.form.targetCount === null ? '' : String(wizard.form.targetCount)}
            onChangeText={(text) => {
              const digits = text.replace(/\D/g, '').slice(0, 3);
              wizard.patch({ targetCount: digits.length === 0 ? null : Number.parseInt(digits, 10) });
            }}
            errorText={errorText('targetCount')}
          />
        </View>
      ) : null}

      {step === 2 ? (
        <View style={{ gap: theme.spacing[3] }} testID="create-step-review">
          <Textarea
            testID="group-description"
            label={t('weddings:create.fields.description')}
            helpText={t('weddings:create.help.description')}
            value={wizard.form.description ?? ''}
            onChangeText={(value) =>
              wizard.patch({ description: value.length > 0 ? value : null })
            }
            minHeight={90}
          />
          <Banner
            variant="info"
            message={t('weddings:create.policyNote', {
              days: DEFAULT_WITHDRAWAL_POLICY.noticeDays,
            })}
            testID="create-policy-note"
          />
          <Checkbox
            testID="group-withdrawal-consent"
            checked={wizard.form.withdrawalConsent}
            onCheckedChange={(value) => wizard.patch({ withdrawalConsent: value })}
            label={t('weddings:create.consent')}
            error={!!wizard.fieldErrors.withdrawalConsent}
          />
          {errorText('withdrawalConsent') ? (
            <Text variant="caption" color="accent" testID="create-consent-error">
              {errorText('withdrawalConsent')}
            </Text>
          ) : null}
        </View>
      ) : null}

      {wizard.error ? (
        <Banner
          variant="error"
          message={t(authErrorKey(wizard.error))}
          testID="create-group-error"
        />
      ) : null}

      <View style={[styles.row, { gap: theme.spacing[2] }]}>
        {step > 0 ? (
          <Button
            style={styles.action}
            variant="ghost"
            label={t('weddings:create.back')}
            onPress={() => setStep((prev) => Math.max(0, prev - 1))}
            testID="create-group-back"
          />
        ) : null}
        {step < STEPS.length - 1 ? (
          <Button
            style={styles.action}
            label={t('weddings:create.next')}
            onPress={next}
            testID="create-group-next"
          />
        ) : (
          <Button
            style={styles.action}
            loading={wizard.busy}
            label={t('weddings:create.submit')}
            onPress={() => {
              void submit();
            }}
            testID="create-group-submit"
          />
        )}
      </View>
    </WeddingScaffold>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  action: { flex: 1 },
});
