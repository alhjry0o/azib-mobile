import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { Banner, Button, Card, EmptyState, ErrorState, Skeleton, Text } from '@/components/ui';
import { ROUTES, href } from '@/constants/routes';
import { useTheme } from '@/theme';
import { SoukRequestStatusBadge } from '../components/SoukBadges';
import { SoukScaffold } from '../components/SoukScaffold';
import { useSoukMine } from '../hooks/use-souk-mine';
import { soukErrorKey } from '../state/error-keys';
import { isActiveRequestStatus, toRequestWorkflowStatus } from '../state/request-machine';

export function SoukMyRequestsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const mine = useSoukMine();

  return (
    <SoukScaffold
      testID="souk-requests-screen"
      title={t('marketplace:souk.requests.title')}
      subtitle={t('marketplace:souk.requests.subtitle')}
      notConnectedRetry={mine.refetch}
    >
      {mine.isLoading ? <Skeleton variant="rect" height={120} /> : null}
      {mine.error ? (
        <ErrorState
          title={t('marketplace:souk.browser.errorTitle')}
          description={t('marketplace:souk.browser.errorDescription')}
          onRetry={mine.refetch}
          testID="souk-requests-error"
        />
      ) : null}
      {mine.actionError ? (
        <Banner
          variant="error"
          message={t(soukErrorKey(mine.actionError))}
          testID="souk-requests-action-error"
        />
      ) : null}
      {!mine.isLoading && !mine.error && mine.requests.length === 0 ? (
        <EmptyState
          icon="heart"
          title={t('marketplace:souk.requests.empty')}
          description={t('marketplace:souk.requests.emptyDescription')}
          action={{
            label: t('marketplace:souk.browser.title'),
            onPress: () => router.replace(href(ROUTES.souk.root)),
          }}
          testID="souk-requests-empty"
        />
      ) : null}

      <View style={{ gap: theme.spacing[3] }}>
        {mine.requests.map((request) => {
          const status = toRequestWorkflowStatus(request.status);
          return (
            <Card
              key={request.id}
              style={{ gap: theme.spacing[2] }}
              testID={`souk-request-${request.id}`}
            >
              <SoukRequestStatusBadge
                status={request.status}
                testID={`souk-request-status-${request.id}`}
              />
              <Text variant="body" color="secondary">
                {request.reason}
              </Text>
              {request.reasonKey ? (
                <Text variant="caption" color="secondary">
                  {t(request.reasonKey)}
                </Text>
              ) : null}
              <Button
                variant="ghost"
                size="sm"
                label={t('marketplace:souk.browser.openItem')}
                onPress={() => router.push(href(ROUTES.souk.detail(request.itemId)))}
                testID={`souk-request-open-${request.id}`}
              />
              {status === 'accepted' || status === 'handed_over' ? (
                <Button
                  size="sm"
                  variant="secondary"
                  label={t('marketplace:souk.coordination.title')}
                  onPress={() => router.push(href(ROUTES.souk.coordination(request.id)))}
                  testID={`souk-request-coordinate-${request.id}`}
                />
              ) : null}
              {status === 'accepted' ? (
                <Button
                  size="sm"
                  label={t('marketplace:souk.handover.title')}
                  onPress={() => router.push(href(ROUTES.souk.handover(request.id)))}
                  testID={`souk-request-handover-${request.id}`}
                />
              ) : null}
              {isActiveRequestStatus(status) ? (
                <Button
                  size="sm"
                  variant="ghost"
                  loading={mine.busy}
                  label={t('marketplace:souk.requests.cancel')}
                  onPress={() => {
                    void mine.cancel(request.id);
                  }}
                  testID={`souk-request-cancel-${request.id}`}
                />
              ) : null}
            </Card>
          );
        })}
      </View>
    </SoukScaffold>
  );
}
