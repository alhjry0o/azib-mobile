import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { Banner, Button, Card, EmptyState, ErrorState, Skeleton, Text } from '@/components/ui';
import { ROUTES, href } from '@/constants/routes';
import { useTheme } from '@/theme';
import { SoukRequestStatusBadge } from '../components/SoukBadges';
import { SoukScaffold } from '../components/SoukScaffold';
import { useSoukInbox } from '../hooks/use-souk-inbox';
import { soukErrorKey } from '../state/error-keys';
import { toRequestWorkflowStatus } from '../state/request-machine';

export function SoukInboxScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const inbox = useSoukInbox();

  return (
    <SoukScaffold
      testID="souk-inbox-screen"
      title={t('marketplace:souk.inbox.title')}
      subtitle={t('marketplace:souk.inbox.subtitle')}
      notConnectedRetry={inbox.refetch}
    >
      {inbox.isLoading ? <Skeleton variant="rect" height={120} /> : null}
      {inbox.error ? (
        <ErrorState
          title={t('marketplace:souk.browser.errorTitle')}
          description={t('marketplace:souk.browser.errorDescription')}
          onRetry={inbox.refetch}
          testID="souk-inbox-error"
        />
      ) : null}
      {inbox.actionError ? (
        <Banner
          variant="error"
          message={t(soukErrorKey(inbox.actionError))}
          testID="souk-inbox-action-error"
        />
      ) : null}
      {!inbox.isLoading && !inbox.error && inbox.rows.length === 0 ? (
        <EmptyState
          icon="bell"
          title={t('marketplace:souk.inbox.empty')}
          description={t('marketplace:souk.inbox.emptyDescription')}
          testID="souk-inbox-empty"
        />
      ) : null}

      <View style={{ gap: theme.spacing[3] }}>
        {inbox.rows.map((row) => {
          const status = toRequestWorkflowStatus(row.request.status);
          return (
            <Card
              key={row.request.id}
              style={{ gap: theme.spacing[2] }}
              testID={`souk-inbox-${row.request.id}`}
            >
              <Text variant="bodyStrong">{row.itemTitle}</Text>
              <SoukRequestStatusBadge
                status={row.request.status}
                testID={`souk-inbox-status-${row.request.id}`}
              />
              <Text variant="body" color="secondary">
                {row.request.reason}
              </Text>
              {status === 'pending' ? (
                <>
                  <Button
                    size="sm"
                    loading={inbox.busy}
                    label={t('marketplace:souk.inbox.accept')}
                    onPress={() => {
                      void inbox.decide(row.request.id, 'accepted');
                    }}
                    testID={`souk-inbox-accept-${row.request.id}`}
                  />
                  <Button
                    size="sm"
                    variant="secondary"
                    loading={inbox.busy}
                    label={t('marketplace:souk.inbox.reject')}
                    onPress={() => {
                      void inbox.decide(
                        row.request.id,
                        'rejected',
                        'marketplace:souk.inbox.rejectReason',
                      );
                    }}
                    testID={`souk-inbox-reject-${row.request.id}`}
                  />
                </>
              ) : null}
              {status === 'accepted' ? (
                <Button
                  size="sm"
                  variant="secondary"
                  label={t('marketplace:souk.inbox.openCoordination')}
                  onPress={() => router.push(href(ROUTES.souk.coordination(row.request.id)))}
                  testID={`souk-inbox-coordinate-${row.request.id}`}
                />
              ) : null}
            </Card>
          );
        })}
      </View>
    </SoukScaffold>
  );
}
