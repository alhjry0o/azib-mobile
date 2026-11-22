import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { Badge, Button, Card, Text } from '@/components/ui';
import type { Application } from '@/repositories/contracts/application';
import type { Disbursement } from '@/repositories/contracts/disbursement';
import { useDirection } from '@/hooks';
import { useHomeFormatters } from '@/features/home/hooks/use-home-formatters';
import { useTheme } from '@/theme';
import { DisbursementStatusBadge } from './DisbursementStatusBadge';

export interface DisbursementRow {
  readonly disbursement: Disbursement;
  readonly application: Application;
}

export interface DisbursementCardProps {
  readonly row: DisbursementRow;
  readonly busy?: boolean;
  readonly onConfirm?: () => void;
  readonly onDispute?: () => void;
  readonly children?: React.ReactNode;
}

export function DisbursementCard({
  row,
  busy = false,
  onConfirm,
  onDispute,
  children,
}: DisbursementCardProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const { isRTL } = useDirection();
  const format = useHomeFormatters();
  const { disbursement, application } = row;
  const canRespond = disbursement.status === 'paid_recorded';

  return (
    <Card
      style={{ gap: theme.spacing[2] }}
      testID={`disbursement-${disbursement.id}`}
    >
      <DisbursementStatusBadge
        status={disbursement.status}
        testID={`disbursement-status-${disbursement.id}`}
      />
      <Text variant="h3" testID={`disbursement-amount-${disbursement.id}`}>
        {format.number(disbursement.amount)}
      </Text>
      <Text variant="caption" color="secondary">
        {`${t('assistance:finance.disbursements.application')}: ${
          application.referenceNumber ?? t('assistance:mine.draft')
        }`}
      </Text>
      {disbursement.providerReference ? (
        <Text variant="caption" color="secondary" testID={`disbursement-proof-${disbursement.id}`}>
          {`${t('assistance:finance.disbursements.proof')}: ${disbursement.providerReference}`}
        </Text>
      ) : null}
      {disbursement.rejectionReasonKey ? (
        <Text variant="caption" color="secondary">
          {t(disbursement.rejectionReasonKey)}
        </Text>
      ) : null}
      {disbursement.dataOrigin === 'demo' ? (
        <Badge variant="demo" size="sm" label={t('common:demo.badge')} />
      ) : null}
      {children}
      {canRespond && (onConfirm || onDispute) ? (
        <View
          style={[
            styles.actions,
            { flexDirection: isRTL ? 'row-reverse' : 'row', gap: theme.spacing[2] },
          ]}
        >
          {onConfirm ? (
            <Button
              style={styles.action}
              size="sm"
              loading={busy}
              label={t('assistance:finance.disbursements.confirm')}
              onPress={onConfirm}
              testID={`disbursement-confirm-${disbursement.id}`}
            />
          ) : null}
          {onDispute ? (
            <Button
              style={styles.action}
              size="sm"
              variant="secondary"
              disabled={busy}
              label={t('assistance:finance.disbursements.dispute')}
              onPress={onDispute}
              testID={`disbursement-dispute-${disbursement.id}`}
            />
          ) : null}
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  actions: { alignItems: 'center' },
  action: { flex: 1 },
});
