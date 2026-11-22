// Demo-only Maker/Checker simulator (P09.3). Runs the SAME disbursement
// service the real console will use in P17. Maker ≠ Checker is enforced by
// the domain, and the fields here are editable so it can be exercised.
import { useCallback, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import {
  Badge,
  Banner,
  Button,
  Card,
  ListItem,
  NotConnectedState,
  Screen,
  Text,
  TextInput,
} from '@/components/ui';
import { ROUTES, href } from '@/constants/routes';
import { useProviderContainer } from '@/providers';
import type { Application } from '@/repositories/contracts/application';
import type { Disbursement } from '@/repositories/contracts/disbursement';
import type { Result } from '@/core/result';
import { authErrorKey } from '@/features/auth/errors';
import { useDirection } from '@/hooks';
import { useTheme } from '@/theme';
import { AmountField } from '../finance/components/AmountField';
import { DisbursementStatusBadge } from '../finance/components/DisbursementStatusBadge';
import {
  decideDisbursement,
  proposeDisbursement,
  recordDisbursementPayment,
} from '../finance/services/disbursement-service';

export function DevFinanceScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const { isRTL } = useDirection();
  const container = useProviderContainer();
  const client = useQueryClient();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [amount, setAmount] = useState<number | null>(50000);
  const [makerId, setMakerId] = useState('dev-maker');
  const [checkerId, setCheckerId] = useState('dev-checker');
  const [proof, setProof] = useState('dev-proof-1');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [failure, setFailure] = useState<string | null>(null);

  const deps = useMemo(
    () => ({
      disbursements: container.repositories.disbursements,
      applications: container.repositories.applications,
      audit: container.repositories.audit,
    }),
    [container],
  );

  const applicationsQuery = useQuery({
    queryKey: ['dev', 'finance', 'applications', container.mode],
    enabled: container.mode === 'demo',
    staleTime: 5_000,
    queryFn: async (): Promise<Result<readonly Application[]>> => {
      const listed = await container.repositories.applications.list({ limit: 50 });
      if (!listed.ok) return listed;
      return { ok: true, value: listed.value.items };
    },
  });

  const disbursementsQuery = useQuery({
    queryKey: ['dev', 'finance', 'disbursements', container.mode, selectedId],
    enabled: container.mode === 'demo' && selectedId !== null,
    staleTime: 5_000,
    queryFn: async (): Promise<Result<readonly Disbursement[]>> => {
      if (!selectedId) return { ok: true, value: [] };
      const listed = await container.repositories.disbursements.listByApplication(selectedId);
      if (!listed.ok) return listed;
      return { ok: true, value: listed.value.items };
    },
  });

  const refresh = useCallback(async (): Promise<void> => {
    await client.invalidateQueries({ queryKey: ['dev', 'finance'] });
    await client.invalidateQueries({ queryKey: ['finance'] });
  }, [client]);

  const settle = useCallback(
    async (run: () => Promise<Result<unknown>>): Promise<void> => {
      setBusy(true);
      setMessage(null);
      setFailure(null);
      const result = await run();
      if (result.ok) setMessage(t('assistance:finance.dev.applied'));
      else setFailure(t(authErrorKey(result.error)));
      await refresh();
      setBusy(false);
    },
    [refresh, t],
  );

  if (container.mode !== 'demo') {
    return (
      <Screen testID="dev-finance-screen" style={styles.center}>
        <NotConnectedState
          title={t('assistance:finance.dev.notDemo')}
          description={t('assistance:finance.requirements.intro')}
        />
      </Screen>
    );
  }

  const applications = applicationsQuery.data?.ok ? applicationsQuery.data.value : [];
  const disbursements = disbursementsQuery.data?.ok ? disbursementsQuery.data.value : [];
  const selected = applications.find((a) => a.id === selectedId) ?? null;

  const createApplication = (): void => {
    void settle(async () => {
      const created = await container.repositories.applications.create({
        applicantId: 'demo-user-test',
        programId: 'dev-program',
        requestedAmount: 200000,
      });
      if (!created.ok) return created;
      return container.repositories.applications.updateStatus(created.value.id, 'approved');
    });
  };

  const propose = (): void => {
    if (!selected || amount === null) return;
    void settle(() =>
      proposeDisbursement(deps, {
        applicationId: selected.id,
        amount,
        makerId,
      }),
    );
  };

  const decide = (id: string, outcome: 'approved' | 'rejected'): void => {
    void settle(() =>
      decideDisbursement(deps, id, {
        checkerId,
        outcome,
        reasonKey: 'assistance:finance.reasons.rejected',
      }),
    );
  };

  const recordPayment = (id: string): void => {
    void settle(() => recordDisbursementPayment(deps, id, proof, 'dev-finance'));
  };

  return (
    <Screen
      scroll
      testID="dev-finance-screen"
      contentStyle={{ gap: theme.spacing[4], paddingBottom: theme.spacing[10] }}
    >
      <Button
        variant="ghost"
        size="sm"
        leftIcon="arrowLeft"
        label={t('common:buttons.back')}
        onPress={() => router.replace(href(ROUTES.dev))}
        testID="dev-finance-back"
        style={styles.back}
      />
      <Text variant="h1">{t('assistance:finance.dev.title')}</Text>
      <Badge variant="demo" label={t('common:demo.badge')} />
      <Text variant="body" color="secondary">
        {t('assistance:finance.dev.subtitle')}
      </Text>

      <Button
        fullWidth
        loading={busy}
        label={t('assistance:finance.dev.createApplication')}
        onPress={createApplication}
        testID="dev-finance-create-application"
      />

      {message ? (
        <Banner variant="info" message={message} testID="dev-finance-message" />
      ) : null}
      {failure ? (
        <Banner variant="error" message={failure} testID="dev-finance-error" />
      ) : null}

      <Text variant="h3">{t('assistance:finance.dev.applicationsTitle')}</Text>
      {applications.length === 0 ? (
        <Text variant="body" color="secondary" testID="dev-finance-no-applications">
          {t('assistance:finance.dev.noApplications')}
        </Text>
      ) : (
        applications.map((application) => (
          <ListItem
            key={application.id}
            variant="card"
            title={application.referenceNumber ?? application.id}
            subtitle={t(`assistance:workflow.status.${application.status}`)}
            onPress={() => setSelectedId(application.id)}
            testID={`dev-finance-application-${application.id}`}
          />
        ))
      )}

      {selected ? (
        <Card style={{ gap: theme.spacing[3] }} testID="dev-finance-propose-card">
          <Text variant="h3">{t('assistance:finance.dev.proposeTitle')}</Text>
          <AmountField
            testID="dev-finance-amount"
            label={t('assistance:finance.dev.amount')}
            value={amount}
            onChange={setAmount}
          />
          <TextInput
            testID="dev-finance-maker"
            label={t('assistance:finance.dev.makerId')}
            value={makerId}
            onChangeText={setMakerId}
            autoCapitalize="none"
          />
          <Button
            fullWidth
            loading={busy}
            label={t('assistance:finance.dev.propose')}
            onPress={propose}
            testID="dev-finance-propose"
          />
        </Card>
      ) : null}

      {selected ? (
        <Card style={{ gap: theme.spacing[3] }}>
          <TextInput
            testID="dev-finance-checker"
            label={t('assistance:finance.dev.checkerId')}
            value={checkerId}
            onChangeText={setCheckerId}
            autoCapitalize="none"
          />
          <TextInput
            testID="dev-finance-proof"
            label={t('assistance:finance.dev.proofReference')}
            value={proof}
            onChangeText={setProof}
            autoCapitalize="none"
          />
        </Card>
      ) : null}

      <Text variant="h3">{t('assistance:finance.dev.disbursementsTitle')}</Text>
      {selected && disbursements.length === 0 ? (
        <Text variant="body" color="secondary" testID="dev-finance-no-disbursements">
          {t('assistance:finance.dev.noDisbursements')}
        </Text>
      ) : null}

      {disbursements.map((disbursement) => (
        <Card
          key={disbursement.id}
          style={{ gap: theme.spacing[2] }}
          testID={`dev-finance-disbursement-${disbursement.id}`}
        >
          <DisbursementStatusBadge
            status={disbursement.status}
            testID={`dev-finance-status-${disbursement.id}`}
          />
          <View
            style={[
              styles.row,
              { flexDirection: isRTL ? 'row-reverse' : 'row', gap: theme.spacing[2] },
            ]}
          >
            {disbursement.status === 'proposed' ? (
              <>
                <Button
                  style={styles.action}
                  size="sm"
                  label={t('assistance:finance.dev.approve')}
                  onPress={() => decide(disbursement.id, 'approved')}
                  testID={`dev-finance-approve-${disbursement.id}`}
                />
                <Button
                  style={styles.action}
                  size="sm"
                  variant="secondary"
                  label={t('assistance:finance.dev.reject')}
                  onPress={() => decide(disbursement.id, 'rejected')}
                  testID={`dev-finance-reject-${disbursement.id}`}
                />
              </>
            ) : null}
            {disbursement.status === 'approved' || disbursement.status === 'disputed' ? (
              <Button
                style={styles.action}
                size="sm"
                label={t('assistance:finance.dev.recordPayment')}
                onPress={() => recordPayment(disbursement.id)}
                testID={`dev-finance-record-${disbursement.id}`}
              />
            ) : null}
          </View>
          {disbursement.status === 'paid_recorded' ? (
            <Text variant="caption" color="secondary">
              {t('assistance:finance.dev.beneficiaryNote')}
            </Text>
          ) : null}
        </Card>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { justifyContent: 'center' },
  back: { alignSelf: 'flex-start', marginTop: 8 },
  row: { alignItems: 'center' },
  action: { flex: 1 },
});
