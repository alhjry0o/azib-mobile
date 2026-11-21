import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorState,
  NotConnectedState,
  Screen,
  Skeleton,
  Text,
} from '@/components/ui';
import { ROUTES, href } from '@/constants/routes';
import { useProviderContainer } from '@/providers';
import { useHomeFormatters } from '@/features/home/hooks/use-home-formatters';
import { useTheme } from '@/theme';
import { useMyApplications } from '../hooks/use-assistance-applications';

export function MyApplicationsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const container = useProviderContainer();
  const mine = useMyApplications();
  const format = useHomeFormatters();

  if (container.mode !== 'demo') {
    return (
      <Screen testID="my-applications-screen" style={styles.center}>
        <NotConnectedState
          title={t('assistance:mine.notConnected')}
          description={t('assistance:mine.notConnectedDescription')}
          onRetry={mine.refetch}
        />
      </Screen>
    );
  }

  return (
    <Screen
      scroll
      testID="my-applications-screen"
      contentStyle={{ gap: theme.spacing[4], paddingBottom: theme.spacing[10] }}
    >
      <Button
        variant="ghost"
        size="sm"
        leftIcon="arrowLeft"
        label={t('common:buttons.back')}
        onPress={() => router.replace(href(ROUTES.assistance.root))}
        testID="mine-back"
        style={styles.back}
      />
      <Text variant="h1">{t('assistance:mine.title')}</Text>
      <Text variant="body" color="secondary">
        {t('assistance:mine.subtitle')}
      </Text>

      {mine.isLoading ? <Skeleton variant="rect" height={110} /> : null}
      {mine.error ? (
        <ErrorState
          title={t('assistance:mine.errorTitle')}
          description={t('assistance:mine.errorDescription')}
          onRetry={mine.refetch}
          testID="mine-error"
        />
      ) : null}
      {!mine.isLoading && !mine.error && mine.applications.length === 0 ? (
        <EmptyState
          icon="wallet"
          title={t('assistance:mine.empty')}
          description={t('assistance:mine.emptyDescription')}
          action={{
            label: t('assistance:mine.action'),
            onPress: () => router.replace(href(ROUTES.assistance.root)),
          }}
          testID="mine-empty"
        />
      ) : null}

      {mine.applications.map((application) => (
        <Card
          key={application.id}
          variant="pressable"
          accessibilityLabel={application.referenceNumber ?? application.id}
          onPress={() => router.push(href(ROUTES.assistance.detail(application.id)))}
          testID={`application-${application.id}`}
          style={{ gap: theme.spacing[2] }}
        >
          <Text variant="bodyStrong">
            {application.referenceNumber ?? t('assistance:mine.draft')}
          </Text>
          <Badge
            variant={application.status === 'approved' ? 'success' : 'pending'}
            label={t(`assistance:workflow.status.${application.status}`)}
            testID={`application-status-${application.id}`}
          />
          <Text variant="caption" color="secondary">
            {format.number(application.requestedAmount)}
          </Text>
          <Text variant="caption" color="secondary">
            {format.date(application.createdAt)}
          </Text>
          {application.dataOrigin === 'demo' ? (
            <Badge variant="demo" size="sm" label={t('common:demo.badge')} />
          ) : null}
        </Card>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { justifyContent: 'center' },
  back: { alignSelf: 'flex-start', marginTop: 8 },
});
