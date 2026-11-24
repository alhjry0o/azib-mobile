import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { DoubleRingSuccess } from '@/components/brand';
import { Badge, Banner, Button, Card, Skeleton, Text } from '@/components/ui';
import { ROUTES, href } from '@/constants/routes';
import { authErrorKey } from '@/features/auth/errors';
import { useTheme } from '@/theme';
import { GoldConfetti } from '../components/GoldConfetti';
import { WeddingScaffold } from '../components/WeddingScaffold';
import { useWeddingGroup } from '../hooks/use-wedding-group';
import { useWeddingMembership } from '../hooks/use-wedding-membership';
import { toGroupStatus } from '../state/group-machine';
import { can } from '../state/roles';

export function GroupCompletionScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ id?: string }>();
  const groupId = params.id ?? '';
  const group = useWeddingGroup(groupId);
  const membership = useWeddingMembership(groupId);

  const status = group.data ? toGroupStatus(group.data.group.status) : 'open';
  const completed = status === 'completed';
  const role = group.data?.myRole ?? null;
  const canComplete = role !== null && can(role, 'complete_group') && status === 'agreed';

  return (
    <WeddingScaffold
      testID="group-completion-screen"
      title={t('weddings:completion.title')}
      subtitle={t('weddings:completion.subtitle')}
      notConnectedRetry={group.refetch}
    >
      {group.isLoading ? <Skeleton variant="rect" height={160} /> : null}
      {membership.error ? (
        <Banner
          variant="error"
          message={t(authErrorKey(membership.error))}
          testID="completion-error"
        />
      ) : null}

      <View style={styles.hero}>
        {completed ? <GoldConfetti size={140} testID="completion-confetti" /> : null}
        <DoubleRingSuccess size={88} testID="completion-rings" />
      </View>

      <Card variant="crest" style={{ gap: theme.spacing[2] }} testID="completion-card">
        <Text variant="h3">
          {completed ? t('weddings:completion.done') : t('weddings:completion.pending')}
        </Text>
        <Badge
          variant={completed ? 'verified' : 'pending'}
          label={t(`weddings:discovery.status.${status}`)}
          testID="completion-status"
        />
        <Text variant="caption" color="secondary">
          {t('weddings:completion.note')}
        </Text>
      </Card>

      {canComplete ? (
        <Button
          fullWidth
          variant="gold"
          loading={membership.busy}
          label={t('weddings:completion.mark')}
          onPress={() => {
            void membership.transition('completed');
          }}
          testID="completion-mark"
        />
      ) : null}

      <Button
        variant="secondary"
        fullWidth
        label={t('weddings:agreement.title')}
        onPress={() => router.replace(href(ROUTES.weddings.agreement(groupId)))}
        testID="completion-open-agreement"
      />
    </WeddingScaffold>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', justifyContent: 'center' },
});
