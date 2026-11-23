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
  Skeleton,
  Text,
} from '@/components/ui';
import { ROUTES, href } from '@/constants/routes';
import { useAuth } from '@/features/auth';
import { authErrorKey } from '@/features/auth/errors';
import { useHomeFormatters } from '@/features/home/hooks/use-home-formatters';
import { useShellStore } from '@/stores';
import { useTheme } from '@/theme';
import { WeddingScaffold } from '../components/WeddingScaffold';
import { useWeddingGroup } from '../hooks/use-wedding-group';
import { useWeddingMembership } from '../hooks/use-wedding-membership';
import { toGroupStatus } from '../state/group-machine';
import { isWithdrawalWindowOpen } from '../engine/withdrawal-impact';

export function GroupDetailScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ id?: string }>();
  const groupId = params.id ?? '';
  const group = useWeddingGroup(groupId);
  const membership = useWeddingMembership(groupId);
  const auth = useAuth();
  const format = useHomeFormatters();
  const openDialog = useShellStore((s) => s.openDialog);

  const data = group.data;
  const status = data ? toGroupStatus(data.group.status) : 'open';
  const windowOpen = data
    ? isWithdrawalWindowOpen(data.group.scheduledDate, new Date(data.group.updatedAt))
    : false;

  const confirmWithdraw = (): void => {
    if (!data) return;
    openDialog({
      title: t('weddings:detail.withdrawConfirmTitle'),
      description: t(
        windowOpen
          ? 'weddings:detail.withdrawWindowOpen'
          : 'weddings:detail.withdrawWindowClosed',
      ),
      confirmLabel: t('weddings:detail.withdrawConfirm'),
      cancelLabel: t('common:buttons.cancel'),
      destructive: true,
      onConfirm: () => {
        void membership.withdraw(data.group.scheduledDate);
      },
    });
  };

  return (
    <WeddingScaffold
      testID="group-detail-screen"
      title={t('weddings:detail.title')}
      notConnectedRetry={group.refetch}
    >
      {group.isLoading ? <Skeleton variant="rect" height={140} /> : null}
      {group.error ? (
        <ErrorState
          title={t('weddings:discovery.errorTitle')}
          description={t('weddings:discovery.errorDescription')}
          onRetry={group.refetch}
          testID="group-detail-error"
        />
      ) : null}
      {!group.isLoading && !group.error && !data ? (
        <EmptyState
          icon="info"
          title={t('weddings:detail.notFound')}
          description={t('weddings:detail.notFoundDescription')}
          testID="group-detail-missing"
        />
      ) : null}

      {data ? (
        <>
          <Card variant="crest" style={{ gap: theme.spacing[2] }} testID="group-summary">
            <Text variant="h2">{data.group.title ?? t(data.group.titleKey)}</Text>
            <Badge
              variant="pending"
              size="sm"
              label={t(`weddings:discovery.status.${status}`)}
              testID="group-status"
            />
            <Text variant="caption" color="secondary">
              {t('weddings:detail.capacity', {
                count: format.number(data.activeCount),
                max: format.number(data.group.maxGroupSize ?? data.group.capacity),
              })}
            </Text>
            <Text variant="caption" color="secondary">
              {t('weddings:detail.scheduled', {
                date: format.date(data.group.scheduledDate),
              })}
            </Text>
            {data.group.description ? (
              <Text variant="body" color="secondary">
                {data.group.description}
              </Text>
            ) : null}
          </Card>

          {!data.isMember ? (
            <Banner
              variant="info"
              message={t('weddings:detail.publicNote')}
              testID="group-public-note"
            />
          ) : null}

          {membership.error ? (
            <Banner
              variant="error"
              message={t(authErrorKey(membership.error))}
              testID="group-action-error"
            />
          ) : null}

          {data.isMember ? (
            <View style={{ gap: theme.spacing[2] }}>
              <Button
                fullWidth
                leftIcon="users"
                label={t('weddings:detail.members')}
                onPress={() => router.push(href(ROUTES.weddings.members(groupId)))}
                testID="group-open-members"
              />
              <Button
                fullWidth
                variant="secondary"
                leftIcon="checkCircle"
                label={t('weddings:detail.polls')}
                onPress={() => router.push(href(ROUTES.weddings.polls(groupId)))}
                testID="group-open-polls"
              />
              <Text variant="caption" color="secondary">
                {t('weddings:detail.budgetComing')}
              </Text>
              {data.myRole !== 'organizer' ? (
                <Button
                  variant="ghost"
                  fullWidth
                  loading={membership.busy}
                  label={t('weddings:detail.withdraw')}
                  onPress={confirmWithdraw}
                  testID="group-withdraw"
                />
              ) : null}
            </View>
          ) : (
            <Button
              fullWidth
              loading={membership.busy}
              label={t('weddings:detail.join')}
              onPress={() => router.push(href(ROUTES.weddings.members(groupId)))}
              testID="group-join"
            />
          )}

          {auth.user?.dataOrigin === 'demo' ? (
            <Text variant="caption" color="secondary">
              {t('weddings:discovery.demoNote')}
            </Text>
          ) : null}
        </>
      ) : null}
    </WeddingScaffold>
  );
}

const styles = StyleSheet.create({
  row: { alignItems: 'center' },
});

void styles;
