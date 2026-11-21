import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import {
  Badge,
  Banner,
  Button,
  Card,
  EmptyState,
  ErrorState,
  NotConnectedState,
  Screen,
  Skeleton,
  Text,
} from '@/components/ui';
import { ForbiddenView } from '@/components/shell';
import { ROUTES, href } from '@/constants/routes';
import { useProviderContainer } from '@/providers';
import { useShellStore } from '@/stores';
import { useHomeFormatters } from '@/features/home/hooks/use-home-formatters';
import { authErrorKey } from '@/features/auth/errors';
import { useTheme } from '@/theme';
import { toWorkflowStatus } from '../state-machine';
import { StatusTimeline } from '../components/StatusTimeline';
import {
  useApplicationDetail,
  useApplicationTimeline,
} from '../hooks/use-assistance-applications';
import { useAssistanceActions } from '../hooks/use-assistance-actions';
import { useEligibilityRules } from '../hooks/use-assistance-query';

const CANCELLABLE = ['draft', 'submitted', 'info_requested', 'rejected'];

export function ApplicationDetailScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ id?: string }>();
  const id = params.id ?? '';
  const container = useProviderContainer();
  const detail = useApplicationDetail(id);
  const timeline = useApplicationTimeline(id);
  const actions = useAssistanceActions(id);
  const rules = useEligibilityRules();
  const format = useHomeFormatters();
  const openDialog = useShellStore((s) => s.openDialog);

  if (container.mode !== 'demo') {
    return (
      <Screen testID="application-detail-screen" style={styles.center}>
        <NotConnectedState
          title={t('assistance:mine.notConnected')}
          description={t('assistance:mine.notConnectedDescription')}
          onRetry={detail.refetch}
        />
      </Screen>
    );
  }

  if (detail.forbidden) return <ForbiddenView />;

  if (detail.isLoading) {
    return (
      <Screen testID="application-detail-loading" contentStyle={styles.content}>
        <Skeleton variant="rect" height={120} />
        <Skeleton variant="text" width="60%" />
      </Screen>
    );
  }

  if (detail.error) {
    return (
      <Screen testID="application-detail-screen" style={styles.center}>
        <ErrorState
          title={t('assistance:mine.errorTitle')}
          description={t('assistance:mine.errorDescription')}
          onRetry={detail.refetch}
          testID="detail-error"
        />
      </Screen>
    );
  }

  const application = detail.application;
  if (!application) {
    return (
      <Screen testID="application-detail-screen" style={styles.center}>
        <EmptyState
          icon="info"
          title={t('assistance:detail.notFound')}
          description={t('assistance:detail.notFoundDescription')}
          action={{
            label: t('assistance:mine.title'),
            onPress: () => router.replace(href(ROUTES.assistance.mine)),
          }}
          testID="detail-not-found"
        />
      </Screen>
    );
  }

  const status = toWorkflowStatus(application.status);
  const decision = application.decision ?? null;
  const appeal = application.appeal ?? null;
  const decidedAt = decision?.decidedAt ? Date.parse(decision.decidedAt) : Number.NaN;
  const windowMs = rules.data.appealWindowDays * 24 * 60 * 60 * 1000;
  const withinWindow =
    !Number.isNaN(decidedAt) && Date.now() - decidedAt <= windowMs;
  const canAppeal = status === 'rejected' && appeal === null && withinWindow;

  const confirmCancel = (): void => {
    openDialog({
      title: t('assistance:detail.cancelConfirmTitle'),
      description: t('assistance:detail.cancelConfirmDescription'),
      confirmLabel: t('assistance:detail.cancelConfirm'),
      cancelLabel: t('common:buttons.cancel'),
      destructive: true,
      onConfirm: () => {
        void actions.cancel();
      },
    });
  };

  return (
    <Screen
      scroll
      testID="application-detail-screen"
      contentStyle={{ gap: theme.spacing[4], paddingBottom: theme.spacing[10] }}
    >
      <Button
        variant="ghost"
        size="sm"
        leftIcon="arrowLeft"
        label={t('common:buttons.back')}
        onPress={() => router.replace(href(ROUTES.assistance.mine))}
        testID="detail-back"
        style={styles.back}
      />
      <Text variant="h1">{t('assistance:detail.title')}</Text>

      <Card variant="crest" style={{ gap: theme.spacing[2] }} testID="detail-summary">
        <Text variant="caption" color="secondary">
          {t('assistance:reference.label')}
        </Text>
        <Text variant="h2" color="gold" testID="detail-reference">
          {application.referenceNumber ?? t('assistance:mine.draft')}
        </Text>
        <Badge
          variant={status === 'approved' ? 'success' : 'pending'}
          label={t(`assistance:workflow.status.${application.status}`)}
          testID="detail-status"
        />
        {detail.programNameKey ? (
          <Text variant="body" color="secondary">
            {t(detail.programNameKey)}
          </Text>
        ) : null}
        <Text variant="caption" color="secondary">
          {`${t('assistance:detail.amount')}: ${format.number(application.requestedAmount)}`}
        </Text>
        {application.dataOrigin === 'demo' ? (
          <Badge variant="demo" size="sm" label={t('common:demo.badge')} />
        ) : null}
      </Card>

      {application.infoRequest ? (
        <Banner
          variant="warning"
          message={t('assistance:infoRequest.intro')}
          testID="detail-info-banner"
        />
      ) : null}

      {actions.error ? (
        <Banner
          variant="error"
          message={t(authErrorKey(actions.error))}
          testID="detail-action-error"
        />
      ) : null}

      <View style={{ gap: theme.spacing[2] }}>
        <Text variant="h3">{t('assistance:detail.timeline')}</Text>
        <StatusTimeline createdAt={application.createdAt} entries={timeline.entries} />
      </View>

      <View style={{ gap: theme.spacing[2] }}>
        {application.infoRequest ? (
          <Button
            fullWidth
            label={t('assistance:detail.infoRequest')}
            onPress={() => router.push(href(ROUTES.assistance.infoRequest(id)))}
            testID="detail-open-info"
          />
        ) : null}
        {decision ? (
          <Button
            fullWidth
            variant="secondary"
            label={t('assistance:detail.decision')}
            onPress={() => router.push(href(ROUTES.assistance.decision(id)))}
            testID="detail-open-decision"
          />
        ) : null}
        {canAppeal ? (
          <Button
            fullWidth
            variant="secondary"
            label={t('assistance:detail.appeal')}
            onPress={() => router.push(href(ROUTES.assistance.appeal(id)))}
            testID="detail-open-appeal"
          />
        ) : null}
        {CANCELLABLE.includes(status) ? (
          <Button
            fullWidth
            variant="ghost"
            loading={actions.busy}
            label={t('assistance:detail.cancel')}
            onPress={confirmCancel}
            testID="detail-cancel"
          />
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { justifyContent: 'center' },
  content: { gap: 12, paddingVertical: 16 },
  back: { alignSelf: 'flex-start', marginTop: 8 },
});
