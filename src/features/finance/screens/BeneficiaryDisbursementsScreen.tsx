import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import {
  Banner,
  Button,
  EmptyState,
  ErrorState,
  Skeleton,
  Text,
  Textarea,
} from '@/components/ui';
import { ROUTES, href } from '@/constants/routes';
import { authErrorKey } from '@/features/auth/errors';
import { useTheme } from '@/theme';
import { DisbursementCard } from '../components/DisbursementCard';
import { FinanceScaffold } from '../components/FinanceScaffold';
import { useBeneficiaryDisbursements } from '../hooks/use-beneficiary-disbursements';
import { useDisbursementActions } from '../hooks/use-disbursement-actions';

export function BeneficiaryDisbursementsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const list = useBeneficiaryDisbursements();
  const actions = useDisbursementActions();
  const [disputingId, setDisputingId] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [noteError, setNoteError] = useState<string | null>(null);

  const confirm = async (id: string): Promise<void> => {
    await actions.respond(id, 'confirmed_by_beneficiary');
  };

  const submitDispute = async (): Promise<void> => {
    if (!disputingId) return;
    if (note.trim().length === 0) {
      setNoteError('assistance:finance.disbursements.validation.note');
      return;
    }
    setNoteError(null);
    const result = await actions.respond(disputingId, 'disputed', note.trim());
    if (result.ok) {
      setDisputingId(null);
      setNote('');
    }
  };

  return (
    <FinanceScaffold
      testID="beneficiary-disbursements-screen"
      title={t('assistance:finance.disbursements.title')}
      subtitle={t('assistance:finance.disbursements.subtitle')}
      guardBackend
      notConnectedRetry={list.refetch}
    >
      <Banner
        variant="info"
        message={t('assistance:finance.disbursements.awaitingNote')}
        testID="disbursements-note"
      />

      {list.isLoading ? <Skeleton variant="rect" height={120} /> : null}
      {list.error ? (
        <ErrorState
          title={t('assistance:finance.disbursements.errorTitle')}
          description={t('assistance:finance.disbursements.errorDescription')}
          onRetry={list.refetch}
          testID="disbursements-error"
        />
      ) : null}
      {!list.isLoading && !list.error && list.rows.length === 0 ? (
        <EmptyState
          icon="wallet"
          title={t('assistance:finance.disbursements.empty')}
          description={t('assistance:finance.disbursements.emptyDescription')}
          action={{
            label: t('assistance:finance.disbursements.action'),
            onPress: () => router.replace(href(ROUTES.assistance.mine)),
          }}
          testID="disbursements-empty"
        />
      ) : null}

      {actions.error ? (
        <Banner
          variant="error"
          message={t(authErrorKey(actions.error))}
          testID="disbursements-action-error"
        />
      ) : null}

      {list.rows.map((row) => (
        <DisbursementCard
          key={row.disbursement.id}
          row={row}
          busy={actions.busy}
          onConfirm={() => {
            void confirm(row.disbursement.id);
          }}
          onDispute={() => {
            setDisputingId(row.disbursement.id);
            setNote('');
            setNoteError(null);
          }}
        >
          {disputingId === row.disbursement.id ? (
            <View style={{ gap: theme.spacing[2] }} testID="dispute-form">
              <Textarea
                testID="dispute-note"
                label={t('assistance:finance.disbursements.disputeNote')}
                required
                value={note}
                onChangeText={setNote}
                minHeight={90}
                errorText={noteError ? t(noteError) : undefined}
              />
              <View style={[styles.row, { gap: theme.spacing[2] }]}>
                <Button
                  style={styles.action}
                  size="sm"
                  variant="ghost"
                  label={t('assistance:finance.disbursements.disputeCancel')}
                  onPress={() => {
                    setDisputingId(null);
                    setNoteError(null);
                  }}
                  testID="dispute-cancel"
                />
                <Button
                  style={styles.action}
                  size="sm"
                  variant="danger"
                  loading={actions.busy}
                  label={t('assistance:finance.disbursements.disputeSubmit')}
                  onPress={() => {
                    void submitDispute();
                  }}
                  testID="dispute-submit"
                />
              </View>
            </View>
          ) : null}
        </DisbursementCard>
      ))}

      <Text variant="caption" color="secondary">
        {t('assistance:finance.disbursements.capNote')}
      </Text>
    </FinanceScaffold>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  action: { flex: 1 },
});
