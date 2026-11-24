import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import {
  Badge,
  Banner,
  Button,
  Card,
  EmptyState,
  ErrorState,
  Skeleton,
  Text,
} from '@/components/ui';
import { ROUTES, href } from '@/constants/routes';
import { DoubleRingSuccess } from '@/components/brand';
import { authErrorKey } from '@/features/auth/errors';
import { useHomeFormatters } from '@/features/home/hooks/use-home-formatters';
import { useShellStore } from '@/stores';
import { useTheme } from '@/theme';
import { WeddingScaffold } from '../components/WeddingScaffold';
import { useWeddingBudget } from '../hooks/use-wedding-budget';
import { useWeddingGroup } from '../hooks/use-wedding-group';
import { useWeddingMembership } from '../hooks/use-wedding-membership';
import { agreementComplete } from '../state/approvals';
import { can } from '../state/roles';

export function GroupAgreementScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ id?: string }>();
  const groupId = params.id ?? '';
  const group = useWeddingGroup(groupId);
  const budget = useWeddingBudget(groupId);
  const membership = useWeddingMembership(groupId);
  const format = useHomeFormatters();
  const openDialog = useShellStore((s) => s.openDialog);

  const data = budget.data;
  const agreement = data?.agreement ?? null;
  const memberIds = data?.memberIds ?? [];
  const complete = agreement ? agreementComplete(memberIds, agreement.acknowledgements) : false;
  const role = group.data?.myRole ?? null;
  const canCancel = role !== null && can(role, 'cancel_group');

  const confirmCancel = (): void => {
    openDialog({
      title: t('weddings:agreement.cancelTitle'),
      description: t('weddings:agreement.cancelDescription'),
      confirmLabel: t('weddings:agreement.cancelConfirm'),
      cancelLabel: t('common:buttons.cancel'),
      destructive: true,
      onConfirm: () => {
        void membership.transition('cancelled', 'weddings:agreement.cancelReason');
      },
    });
  };

  return (
    <WeddingScaffold
      testID="group-agreement-screen"
      title={t('weddings:agreement.title')}
      subtitle={t('weddings:agreement.subtitle')}
      notConnectedRetry={budget.refetch}
    >
      {budget.isLoading ? <Skeleton variant="rect" height={140} /> : null}
      {budget.error ? (
        <ErrorState
          title={t('weddings:discovery.errorTitle')}
          description={t('weddings:discovery.errorDescription')}
          onRetry={budget.refetch}
          testID="agreement-error"
        />
      ) : null}
      {budget.actionError ? (
        <Banner
          variant="error"
          message={t(authErrorKey(budget.actionError))}
          testID="agreement-action-error"
        />
      ) : null}

      {!budget.isLoading && !agreement ? (
        <EmptyState
          icon="info"
          title={t('weddings:agreement.empty')}
          description={t('weddings:agreement.emptyDescription')}
          action={{
            label: t('weddings:budget.title'),
            onPress: () => router.replace(href(ROUTES.weddings.budget(groupId))),
          }}
          testID="agreement-empty"
        />
      ) : null}

      {agreement ? (
        <Card variant="crest" style={{ gap: theme.spacing[3] }} testID="agreement-card">
          {complete ? <DoubleRingSuccess size={64} testID="agreement-success" /> : null}
          <Text variant="h3">{t(agreement.summaryKey)}</Text>
          <Text variant="caption" color="secondary">
            {t('weddings:agreement.progress', {
              done: format.number(agreement.acknowledgements.length),
              total: format.number(memberIds.length),
            })}
          </Text>
          {complete ? (
            <Badge variant="verified" label={t('weddings:agreement.complete')} testID="agreement-complete" />
          ) : (
            <Badge variant="pending" label={t('weddings:agreement.pending')} />
          )}
          {data?.report ? (
            <Text variant="bodyStrong">
              {t('weddings:budget.grandTotal', { value: format.number(data.report.grandTotal) })}
            </Text>
          ) : null}
        </Card>
      ) : null}

      {agreement && group.data?.isMember ? (
        <Button
          fullWidth
          loading={budget.busy}
          label={t('weddings:agreement.acknowledge')}
          onPress={() => {
            void budget.acknowledge();
          }}
          testID="agreement-acknowledge"
        />
      ) : null}

      {agreement ? (
        <Button
          variant="secondary"
          fullWidth
          label={t('weddings:countdown.title')}
          onPress={() => router.push(href(ROUTES.weddings.countdown(groupId)))}
          testID="agreement-open-countdown"
        />
      ) : null}

      {canCancel ? (
        <Button
          variant="ghost"
          fullWidth
          loading={membership.busy}
          label={t('weddings:agreement.cancel')}
          onPress={confirmCancel}
          testID="agreement-cancel"
        />
      ) : null}
    </WeddingScaffold>
  );
}
