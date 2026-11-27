import { useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Banner, Button, Select, Textarea } from '@/components/ui';
import { ROUTES } from '@/constants/routes';
import { SoukScaffold } from '../components/SoukScaffold';
import { useSoukReport } from '../hooks/use-souk-report';
import { soukErrorKey } from '../state/error-keys';

const REASON_KEYS: readonly string[] = [
  'marketplace:souk.report.reasons.forSale',
  'marketplace:souk.report.reasons.misleading',
  'marketplace:souk.report.reasons.unavailable',
  'marketplace:souk.report.reasons.unsafe',
];

export function SoukReportScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ id?: string }>();
  const itemId = params.id ?? '';
  const report = useSoukReport(itemId);
  const [reasonKey, setReasonKey] = useState<string | null>(null);
  const [detail, setDetail] = useState('');
  const [validation, setValidation] = useState<string | null>(null);

  const submit = async (): Promise<void> => {
    if (!reasonKey) {
      setValidation('marketplace:souk.validation.reportReason');
      return;
    }
    if (detail.trim().length < 10) {
      setValidation('marketplace:souk.validation.reportDetail');
      return;
    }
    setValidation(null);
    await report.submit(reasonKey, detail.trim());
  };

  return (
    <SoukScaffold
      testID="souk-report-screen"
      title={t('marketplace:souk.reportScreen.title')}
      subtitle={t('marketplace:souk.reportScreen.subtitle')}
      backTo={ROUTES.souk.detail(itemId)}
    >
      <Select
        testID="souk-report-reason"
        label={t('marketplace:souk.reportScreen.reason')}
        required
        value={reasonKey}
        options={REASON_KEYS.map((key) => ({ value: key, label: t(key) }))}
        onChange={setReasonKey}
      />
      <Textarea
        testID="souk-report-detail"
        label={t('marketplace:souk.reportScreen.detail')}
        required
        value={detail}
        onChangeText={setDetail}
        minHeight={110}
        errorText={validation ? t(validation) : undefined}
      />
      {report.error ? (
        <Banner
          variant="error"
          message={t(soukErrorKey(report.error))}
          testID="souk-report-error"
        />
      ) : null}
      {report.submitted ? (
        <Banner
          variant="info"
          message={t('marketplace:souk.reportScreen.received')}
          testID="souk-report-received"
        />
      ) : (
        <Button
          fullWidth
          variant="danger"
          loading={report.busy}
          label={t('marketplace:souk.reportScreen.submit')}
          onPress={() => {
            void submit();
          }}
          testID="souk-report-submit"
        />
      )}
    </SoukScaffold>
  );
}
