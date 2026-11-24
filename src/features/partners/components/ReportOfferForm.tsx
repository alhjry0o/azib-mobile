import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { Button, Card, Select, Text, Textarea } from '@/components/ui';
import { useTheme } from '@/theme';

const REPORT_REASONS: readonly string[] = [
  'marketplace:report.reasons.wrongDiscount',
  'marketplace:report.reasons.expired',
  'marketplace:report.reasons.unreachable',
  'marketplace:report.reasons.misleading',
];

export interface ReportOfferFormProps {
  readonly busy: boolean;
  readonly onSubmit: (reasonKey: string, detail: string) => void;
  readonly onCancel: () => void;
}

export function ReportOfferForm({ busy, onSubmit, onCancel }: ReportOfferFormProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const [reasonKey, setReasonKey] = useState<string | null>(null);
  const [detail, setDetail] = useState('');
  const [error, setError] = useState<string | null>(null);

  const submit = (): void => {
    if (!reasonKey) {
      setError('marketplace:validation.reportReason');
      return;
    }
    if (detail.trim().length < 10) {
      setError('marketplace:validation.reportDetail');
      return;
    }
    setError(null);
    onSubmit(reasonKey, detail.trim());
  };

  return (
    <Card style={{ gap: theme.spacing[3] }} testID="report-form">
      <Text variant="h3">{t('marketplace:report.title')}</Text>
      <Select
        testID="report-reason"
        label={t('marketplace:report.reason')}
        required
        value={reasonKey}
        options={REPORT_REASONS.map((key) => ({ value: key, label: t(key) }))}
        onChange={setReasonKey}
      />
      <Textarea
        testID="report-detail"
        label={t('marketplace:report.detail')}
        required
        value={detail}
        onChangeText={setDetail}
        minHeight={90}
        errorText={error ? t(error) : undefined}
      />
      <View style={[styles.row, { gap: theme.spacing[2] }]}>
        <Button
          style={styles.action}
          variant="ghost"
          label={t('common:buttons.cancel')}
          onPress={onCancel}
          testID="report-cancel"
        />
        <Button
          style={styles.action}
          variant="danger"
          loading={busy}
          label={t('marketplace:report.submit')}
          onPress={submit}
          testID="report-submit"
        />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  action: { flex: 1 },
});
