import { useMemo } from 'react';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import {
  Banner,
  Button,
  Checkbox,
  DatePicker,
  Select,
  Text,
  TextInput,
  Textarea,
} from '@/components/ui';
import { ROUTES, href } from '@/constants/routes';
import { childrenOf } from '@/features/profile/locations';
import { useTheme } from '@/theme';
import type { JobApplicationMethod, JobSchedule, JobWorkType } from '@/repositories/contracts/job';
import { JobScaffold } from '../components/JobScaffold';
import { useJobComposer } from '../hooks/use-job-composer';
import { jobErrorKey } from '../state/error-keys';
import { JOB_CATEGORIES, JOB_SCHEDULES, JOB_WORK_TYPES } from '../state/filters';

export function JobComposerScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const composer = useJobComposer();

  const governorates = useMemo(
    () => childrenOf(null).map((g) => ({ value: g.id, label: t(g.nameKey) })),
    [t],
  );
  const districts = useMemo(
    () =>
      composer.form.governorateId
        ? childrenOf(composer.form.governorateId).map((d) => ({
            value: d.id,
            label: t(d.nameKey),
          }))
        : [],
    [composer.form.governorateId, t],
  );

  const errorText = (field: string): string | undefined => {
    const key = composer.fieldErrors[field];
    return key ? t(key) : undefined;
  };

  const submit = async (): Promise<void> => {
    const result = await composer.submit();
    if (result.ok) router.replace(href(ROUTES.jobs.detail(result.value.id)));
  };

  const money = (text: string): number | null => {
    const digits = text.replace(/\D/g, '').slice(0, 9);
    return digits.length === 0 ? null : Number.parseInt(digits, 10);
  };

  return (
    <JobScaffold
      testID="job-composer-screen"
      title={t('jobs:composer.title')}
      subtitle={t('jobs:composer.subtitle')}
    >
      <Banner
        variant="warning"
        message={t('jobs:composer.unverifiedNote')}
        testID="job-composer-unverified-note"
      />
      {composer.requireReview ? (
        <Banner
          variant="info"
          message={t('jobs:composer.reviewEnabled')}
          testID="job-composer-review-enabled"
        />
      ) : null}

      <TextInput
        testID="job-composer-title"
        label={t('jobs:composer.fields.title')}
        required
        value={composer.form.title}
        onChangeText={(value) => composer.patch({ title: value })}
        errorText={errorText('title')}
      />
      <TextInput
        testID="job-composer-publisher"
        label={t('jobs:composer.fields.publisherName')}
        required
        helpText={t('jobs:composer.publisherHelp')}
        value={composer.form.publisherName}
        onChangeText={(value) => composer.patch({ publisherName: value })}
        errorText={errorText('publisherName')}
      />
      <Select
        testID="job-composer-category"
        label={t('jobs:composer.fields.category')}
        required
        value={composer.form.category}
        options={JOB_CATEGORIES.map((c) => ({ value: c, label: t(`jobs:categories.${c}`) }))}
        onChange={(value) => composer.patch({ category: value })}
      />
      <Textarea
        testID="job-composer-description"
        label={t('jobs:composer.fields.description')}
        required
        helpText={t('jobs:composer.descriptionHelp')}
        value={composer.form.description}
        onChangeText={(value) => composer.patch({ description: value })}
        minHeight={100}
        errorText={errorText('description')}
      />
      <Select
        testID="job-composer-governorate"
        label={t('jobs:composer.fields.governorate')}
        required
        value={composer.form.governorateId || null}
        options={governorates}
        onChange={(value) => composer.patch({ governorateId: value, districtId: null })}
        errorText={errorText('governorateId')}
      />
      <Select
        testID="job-composer-district"
        label={t('jobs:composer.fields.district')}
        value={composer.form.districtId}
        options={districts}
        disabled={districts.length === 0}
        onChange={(value) => composer.patch({ districtId: value })}
      />
      <Select<JobWorkType>
        testID="job-composer-work-type"
        label={t('jobs:composer.fields.workType')}
        required
        value={composer.form.workType}
        options={JOB_WORK_TYPES.map((w) => ({ value: w, label: t(`jobs:workType.${w}`) }))}
        onChange={(value) => composer.patch({ workType: value })}
      />
      <Select<JobSchedule>
        testID="job-composer-schedule"
        label={t('jobs:composer.fields.schedule')}
        required
        value={composer.form.schedule}
        options={JOB_SCHEDULES.map((s) => ({ value: s, label: t(`jobs:schedule.${s}`) }))}
        onChange={(value) => composer.patch({ schedule: value })}
      />
      <TextInput
        testID="job-composer-salary-min"
        label={t('jobs:composer.fields.salaryMin')}
        helpText={t('jobs:salary.note')}
        keyboardType="number-pad"
        value={composer.form.salaryMin === null ? '' : String(composer.form.salaryMin)}
        onChangeText={(text) => composer.patch({ salaryMin: money(text) })}
      />
      <TextInput
        testID="job-composer-salary-max"
        label={t('jobs:composer.fields.salaryMax')}
        keyboardType="number-pad"
        value={composer.form.salaryMax === null ? '' : String(composer.form.salaryMax)}
        onChangeText={(text) => composer.patch({ salaryMax: money(text) })}
        errorText={errorText('salaryMax')}
      />
      <TextInput
        testID="job-composer-requirements"
        label={t('jobs:composer.fields.requirements')}
        helpText={t('jobs:composer.requirementsHelp')}
        value={composer.form.requirements.join(', ')}
        onChangeText={(text) =>
          composer.patch({
            requirements: text
              .split(',')
              .map((r) => r.trim())
              .filter((r) => r.length > 0),
          })
        }
      />
      <Select<JobApplicationMethod>
        testID="job-composer-application-method"
        label={t('jobs:composer.fields.applicationMethod')}
        required
        value={composer.form.applicationMethod}
        options={[
          { value: 'in_app', label: t('jobs:applicationMethod.in_app') },
          {
            value: 'external_instructions',
            label: t('jobs:applicationMethod.external_instructions'),
          },
        ]}
        onChange={(value) => composer.patch({ applicationMethod: value })}
      />
      <Textarea
        testID="job-composer-instructions"
        label={t('jobs:composer.fields.applicationInstructions')}
        helpText={t('jobs:composer.instructionsHelp')}
        value={composer.form.applicationInstructions ?? ''}
        onChangeText={(value) =>
          composer.patch({ applicationInstructions: value.length > 0 ? value : null })
        }
        minHeight={80}
      />
      <DatePicker
        testID="job-composer-deadline"
        label={t('jobs:composer.fields.deadline')}
        value={composer.form.deadline ? new Date(composer.form.deadline) : null}
        onChange={(date) => composer.patch({ deadline: date ? date.toISOString() : null })}
      />
      <Checkbox
        testID="job-composer-terms"
        checked={composer.form.publisherTermsAccepted}
        onCheckedChange={(value) => composer.patch({ publisherTermsAccepted: value })}
        label={t('jobs:composer.terms')}
        error={!!composer.fieldErrors.publisherTermsAccepted}
      />
      {errorText('publisherTermsAccepted') ? (
        <Text variant="caption" color="accent" testID="job-composer-terms-error">
          {errorText('publisherTermsAccepted')}
        </Text>
      ) : null}

      {composer.error ? (
        <Banner
          variant="error"
          message={t(jobErrorKey(composer.error))}
          testID="job-composer-error"
        />
      ) : null}

      <Button
        fullWidth
        loading={composer.busy}
        label={t('jobs:composer.submit')}
        onPress={() => {
          void submit();
        }}
        testID="job-composer-submit"
      />
      <View style={{ height: theme.spacing[4] }} />
    </JobScaffold>
  );
}
