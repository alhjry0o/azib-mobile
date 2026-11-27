import { useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Banner, Button, Select, Textarea } from '@/components/ui';
import { ROUTES } from '@/constants/routes';
import { JobScaffold } from '../components/JobScaffold';
import { useJobReport } from '../hooks/use-job-report';
import { jobErrorKey } from '../state/error-keys';

const REASON_KEYS: readonly string[] = [
  'jobs:report.reasons.fake',
  'jobs:report.reasons.expired',
  'jobs:report.reasons.unpaid',
  'jobs:report.reasons.misleading',
];

export function JobReportScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ id?: string }>();
  const jobId = params.id ?? '';
  const report = useJobReport(jobId);
  const [reasonKey, setReasonKey] = useState<string | null>(null);
  const [detail, setDetail] = useState('');
  const [validation, setValidation] = useState<string | null>(null);

  const submit = async (): Promise<void> => {
    if (!reasonKey) {
      setValidation('jobs:validation.reportReason');
      return;
    }
    if (detail.trim().length < 10) {
      setValidation('jobs:validation.reportDetail');
      return;
    }
    setValidation(null);
    await report.submit(reasonKey, detail.trim());
  };

  return (
    <JobScaffold
      testID="job-report-screen"
      title={t('jobs:reportScreen.title')}
      subtitle={t('jobs:reportScreen.subtitle')}
      backTo={ROUTES.jobs.detail(jobId)}
    >
      <Select
        testID="job-report-reason"
        label={t('jobs:reportScreen.reason')}
        required
        value={reasonKey}
        options={REASON_KEYS.map((key) => ({ value: key, label: t(key) }))}
        onChange={setReasonKey}
      />
      <Textarea
        testID="job-report-detail"
        label={t('jobs:reportScreen.detail')}
        required
        value={detail}
        onChangeText={setDetail}
        minHeight={110}
        errorText={validation ? t(validation) : undefined}
      />
      {report.error ? (
        <Banner
          variant="error"
          message={t(jobErrorKey(report.error))}
          testID="job-report-error"
        />
      ) : null}
      {report.submitted ? (
        <Banner
          variant="info"
          message={t('jobs:reportScreen.received')}
          testID="job-report-received"
        />
      ) : (
        <Button
          fullWidth
          variant="danger"
          loading={report.busy}
          label={t('jobs:reportScreen.submit')}
          onPress={() => {
            void submit();
          }}
          testID="job-report-submit"
        />
      )}
    </JobScaffold>
  );
}
