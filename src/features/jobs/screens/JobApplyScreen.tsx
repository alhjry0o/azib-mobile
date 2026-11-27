import { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { Badge, Banner, Button, Card, Text, TextInput, Textarea } from '@/components/ui';
import { ROUTES, href } from '@/constants/routes';
import { useTheme } from '@/theme';
import { JobScaffold } from '../components/JobScaffold';
import { useJobApply } from '../hooks/use-job-application';
import { JobApplicationSchema } from '../schemas';
import { jobErrorKey } from '../state/error-keys';

export function JobApplyScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ id?: string }>();
  const jobId = params.id ?? '';
  const apply = useJobApply(jobId);
  const [headline, setHeadline] = useState('');
  const [message, setMessage] = useState('');
  const [validation, setValidation] = useState<string | null>(null);

  const submit = async (): Promise<void> => {
    const parsed = JobApplicationSchema.safeParse({ headline, message });
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      setValidation(first ? first.message : 'jobs:validation.message');
      return;
    }
    setValidation(null);
    const result = await apply.apply(parsed.data.headline, parsed.data.message);
    if (result.ok) router.replace(href(ROUTES.jobs.applications));
  };

  return (
    <JobScaffold
      testID="job-apply-screen"
      title={t('jobs:apply.title')}
      subtitle={t('jobs:apply.subtitle')}
      backTo={ROUTES.jobs.detail(jobId)}
    >
      <Banner variant="info" message={t('jobs:apply.privacyNote')} testID="job-apply-privacy" />
      <TextInput
        testID="job-apply-headline"
        label={t('jobs:apply.headline')}
        required
        value={headline}
        onChangeText={setHeadline}
      />
      <Textarea
        testID="job-apply-message"
        label={t('jobs:apply.message')}
        required
        value={message}
        onChangeText={setMessage}
        minHeight={110}
        errorText={validation ? t(validation) : undefined}
      />

      <Card style={{ gap: theme.spacing[2] }} testID="job-apply-cv">
        <Text variant="bodyStrong">{t('jobs:cv.title')}</Text>
        <Text variant="caption" color="secondary">
          {t('jobs:cv.privateNote')}
        </Text>
        <View style={{ gap: theme.spacing[2] }}>
          <Button
            variant="secondary"
            size="sm"
            leftIcon="plus"
            disabled={apply.uploading}
            label={t('jobs:cv.pickPdf')}
            onPress={() => {
              void apply.uploadCv('pdf');
            }}
            testID="job-apply-cv-pdf"
          />
          <Button
            variant="secondary"
            size="sm"
            leftIcon="plus"
            disabled={apply.uploading}
            label={t('jobs:cv.pickImage')}
            onPress={() => {
              void apply.uploadCv('image');
            }}
            testID="job-apply-cv-image"
          />
        </View>
        {apply.uploading ? (
          <Text variant="caption" color="secondary" testID="job-apply-cv-uploading">
            {t('jobs:cv.uploading')}
          </Text>
        ) : null}
        {apply.cv ? (
          <View style={{ gap: theme.spacing[2] }}>
            <Badge variant="verified" size="sm" label={t('jobs:cv.attached')} />
            <Text variant="caption" color="secondary">
              {apply.cv.fileName}
            </Text>
            <Button
              variant="ghost"
              size="sm"
              label={t('jobs:cv.remove')}
              onPress={apply.removeCv}
              testID="job-apply-cv-remove"
            />
          </View>
        ) : (
          <Text variant="caption" color="tertiary" testID="job-apply-cv-empty">
            {t('jobs:cv.optional')}
          </Text>
        )}
      </Card>

      {apply.error ? (
        <Banner
          variant="error"
          message={t(jobErrorKey(apply.error))}
          testID="job-apply-error"
        />
      ) : null}

      <Button
        fullWidth
        loading={apply.busy}
        label={t('jobs:apply.submit')}
        onPress={() => {
          void submit();
        }}
        testID="job-apply-submit"
      />
      <View style={{ height: theme.spacing[4] }} />
    </JobScaffold>
  );
}
