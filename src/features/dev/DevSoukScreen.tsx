// Demo-only Souk simulator. Runs the SAME services the staff console will use
// in P17, with an explicit admin actor. Never in the user path.
import { useCallback, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';
import {
  Badge,
  Banner,
  Button,
  Card,
  ListItem,
  NotConnectedState,
  Screen,
  Text,
} from '@/components/ui';
import { ROUTES, href } from '@/constants/routes';
import { useProviderContainer } from '@/providers';
import type { Result } from '@/core/result';
import type { SoukItem } from '@/repositories/contracts/souk';
import type { SoukRequest } from '@/repositories/contracts/souk-request';
import type { SoukReport } from '@/repositories/contracts/souk-report';
import { SoukItemStatusBadge, SoukRequestStatusBadge } from '../souk/components/SoukBadges';
import { soukErrorKey } from '../souk/state/error-keys';
import { expireItem, reviewItem } from '../souk/services/item-service';
import { decideRequest } from '../souk/services/request-service';
import { resolveReport } from '../souk/services/report-service';
import { DEFAULT_SOUK_LIMITS } from '../souk/state/limits';
import { useTheme } from '@/theme';

export function DevSoukScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const container = useProviderContainer();
  const client = useQueryClient();
  const [itemId, setItemId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [failure, setFailure] = useState<string | null>(null);

  const itemDeps = useMemo(
    () => ({ souk: container.repositories.souk, audit: container.repositories.audit }),
    [container],
  );
  const requestDeps = useMemo(
    () => ({
      souk: container.repositories.souk,
      requests: container.repositories.soukRequests,
      audit: container.repositories.audit,
    }),
    [container],
  );
  const reportDeps = useMemo(
    () => ({ reports: container.repositories.soukReports, audit: container.repositories.audit }),
    [container],
  );

  const itemsQuery = useQuery({
    queryKey: ['dev', 'souk', 'items', container.mode],
    enabled: container.mode === 'demo',
    staleTime: 3_000,
    queryFn: async (): Promise<Result<readonly SoukItem[]>> => {
      const listed = await container.repositories.souk.list({ limit: 50 });
      if (!listed.ok) return listed;
      return { ok: true, value: listed.value.items };
    },
  });

  const requestsQuery = useQuery({
    queryKey: ['dev', 'souk', 'requests', container.mode, itemId],
    enabled: container.mode === 'demo' && itemId !== null,
    staleTime: 3_000,
    queryFn: async (): Promise<Result<readonly SoukRequest[]>> => {
      if (!itemId) return { ok: true, value: [] };
      return container.repositories.soukRequests.listByItem(itemId);
    },
  });

  const reportsQuery = useQuery({
    queryKey: ['dev', 'souk', 'reports', container.mode],
    enabled: container.mode === 'demo',
    staleTime: 3_000,
    queryFn: () => container.repositories.soukReports.list({ limit: 20 }),
  });

  const refresh = useCallback(async (): Promise<void> => {
    await client.invalidateQueries({ queryKey: ['dev'] });
    await client.invalidateQueries({ queryKey: ['souk'] });
  }, [client]);

  const settle = useCallback(
    async (run: () => Promise<Result<unknown>>): Promise<void> => {
      setBusy(true);
      setMessage(null);
      setFailure(null);
      const result = await run();
      if (result.ok) setMessage(t('marketplace:souk.dev.applied'));
      else setFailure(t(soukErrorKey(result.error)));
      await refresh();
      setBusy(false);
    },
    [refresh, t],
  );

  if (container.mode !== 'demo') {
    return (
      <Screen testID="dev-souk-screen" style={styles.center}>
        <NotConnectedState
          title={t('marketplace:souk.dev.notDemo')}
          description={t('marketplace:souk.browser.notConnectedDescription')}
        />
      </Screen>
    );
  }

  const items = itemsQuery.data?.ok ? itemsQuery.data.value : [];
  const requests = requestsQuery.data?.ok ? requestsQuery.data.value : [];
  const reports = reportsQuery.data?.ok ? reportsQuery.data.value.items : [];
  const selected = items.find((item) => item.id === itemId) ?? null;

  return (
    <Screen
      scroll
      testID="dev-souk-screen"
      contentStyle={{ gap: theme.spacing[4], paddingBottom: theme.spacing[10] }}
    >
      <Button
        variant="ghost"
        size="sm"
        leftIcon="arrowLeft"
        label={t('common:buttons.back')}
        onPress={() => router.replace(href(ROUTES.dev))}
        testID="dev-souk-back"
        style={styles.back}
      />
      <Text variant="h1">{t('marketplace:souk.dev.title')}</Text>
      <Badge variant="demo" label={t('marketplace:souk.demo.badge')} />
      <Text variant="body" color="secondary">
        {t('marketplace:souk.dev.subtitle')}
      </Text>

      {message ? <Banner variant="info" message={message} testID="dev-souk-message" /> : null}
      {failure ? <Banner variant="error" message={failure} testID="dev-souk-error" /> : null}

      <Text variant="h3">{t('marketplace:souk.dev.itemsTitle')}</Text>
      {items.length === 0 ? (
        <Text variant="body" color="secondary" testID="dev-souk-items-empty">
          {t('marketplace:souk.dev.itemsEmpty')}
        </Text>
      ) : (
        items.map((item) => (
          <ListItem
            key={item.id}
            variant="card"
            title={item.title ?? t(item.titleKey)}
            subtitle={t(`marketplace:souk.itemStatus.${item.status}`)}
            onPress={() => setItemId(item.id)}
            testID={`dev-souk-item-${item.id}`}
          />
        ))
      )}

      {selected ? (
        <Card style={{ gap: theme.spacing[2] }} testID="dev-souk-item-actions">
          <Text variant="h3">{selected.title ?? t(selected.titleKey)}</Text>
          <SoukItemStatusBadge status={selected.status} testID="dev-souk-item-status" />
          {selected.status === 'pending_review' ? (
            <>
              <Button
                size="sm"
                loading={busy}
                label={t('marketplace:souk.dev.approveItem')}
                onPress={() => {
                  void settle(() =>
                    reviewItem(
                      itemDeps,
                      selected.id,
                      'admin',
                      'dev-moderator',
                      'available',
                      DEFAULT_SOUK_LIMITS,
                      new Date(),
                    ),
                  );
                }}
                testID="dev-souk-approve-item"
              />
              <Button
                size="sm"
                variant="secondary"
                loading={busy}
                label={t('marketplace:souk.dev.rejectItem')}
                onPress={() => {
                  void settle(() =>
                    reviewItem(
                      itemDeps,
                      selected.id,
                      'admin',
                      'dev-moderator',
                      'rejected',
                      DEFAULT_SOUK_LIMITS,
                      new Date(),
                      'marketplace:souk.dev.rejectReason',
                    ),
                  );
                }}
                testID="dev-souk-reject-item"
              />
            </>
          ) : null}
          {selected.status === 'available' ? (
            <Button
              size="sm"
              variant="ghost"
              loading={busy}
              label={t('marketplace:souk.dev.expireItem')}
              onPress={() => {
                void settle(() => expireItem(itemDeps, selected.id, 'dev-system'));
              }}
              testID="dev-souk-expire-item"
            />
          ) : null}
        </Card>
      ) : null}

      {selected ? (
        <>
          <Text variant="h3">{t('marketplace:souk.dev.requestsTitle')}</Text>
          {requests.length === 0 ? (
            <Text variant="body" color="secondary" testID="dev-souk-requests-empty">
              {t('marketplace:souk.dev.requestsEmpty')}
            </Text>
          ) : (
            requests.map((request) => (
              <Card
                key={request.id}
                style={{ gap: theme.spacing[2] }}
                testID={`dev-souk-request-${request.id}`}
              >
                <SoukRequestStatusBadge status={request.status} />
                {request.status === 'pending' ? (
                  <>
                    <Button
                      size="sm"
                      loading={busy}
                      label={t('marketplace:souk.dev.acceptRequest')}
                      onPress={() => {
                        void settle(() =>
                          decideRequest(
                            requestDeps,
                            request.id,
                            'dev-moderator',
                            'admin',
                            'accepted',
                            new Date(),
                          ),
                        );
                      }}
                      testID={`dev-souk-accept-request-${request.id}`}
                    />
                    <Button
                      size="sm"
                      variant="secondary"
                      loading={busy}
                      label={t('marketplace:souk.dev.rejectRequest')}
                      onPress={() => {
                        void settle(() =>
                          decideRequest(
                            requestDeps,
                            request.id,
                            'dev-moderator',
                            'admin',
                            'rejected',
                            new Date(),
                            'marketplace:souk.dev.rejectReason',
                          ),
                        );
                      }}
                      testID={`dev-souk-reject-request-${request.id}`}
                    />
                  </>
                ) : null}
              </Card>
            ))
          )}
        </>
      ) : null}

      <Text variant="h3">{t('marketplace:souk.dev.reportsTitle')}</Text>
      {reports.length === 0 ? (
        <Text variant="body" color="secondary" testID="dev-souk-reports-empty">
          {t('marketplace:souk.dev.reportsEmpty')}
        </Text>
      ) : (
        reports.map((report: SoukReport) => (
          <Card
            key={report.id}
            style={{ gap: theme.spacing[2] }}
            testID={`dev-souk-report-${report.id}`}
          >
            <Text variant="bodyStrong">{t(report.reasonKey)}</Text>
            <Badge
              variant={report.status === 'resolved' ? 'success' : 'pending'}
              size="sm"
              label={t(`marketplace:souk.dev.reportStatus.${report.status}`)}
            />
            {report.status === 'open' ? (
              <Button
                size="sm"
                loading={busy}
                label={t('marketplace:souk.dev.resolveReport')}
                onPress={() => {
                  void settle(() =>
                    resolveReport(reportDeps, report.id, 'admin', 'dev-moderator', 'resolved'),
                  );
                }}
                testID={`dev-souk-resolve-report-${report.id}`}
              />
            ) : null}
          </Card>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { justifyContent: 'center' },
  back: { alignSelf: 'flex-start', marginTop: 8 },
});
