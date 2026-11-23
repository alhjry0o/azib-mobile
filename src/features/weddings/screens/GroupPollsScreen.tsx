import { useMemo } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Banner, Button, EmptyState, ErrorState, Skeleton, Text } from '@/components/ui';
import { authErrorKey } from '@/features/auth/errors';
import { WeddingScaffold } from '../components/WeddingScaffold';
import { PollCard } from '../components/PollCard';
import { useWeddingGroup } from '../hooks/use-wedding-group';
import { useWeddingPolls } from '../hooks/use-wedding-polls';
import { can } from '../state/roles';

export function GroupPollsScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ id?: string }>();
  const groupId = params.id ?? '';
  const group = useWeddingGroup(groupId);
  const activeCount = group.data?.activeCount ?? 0;
  const polls = useWeddingPolls(groupId, activeCount);

  const role = group.data?.myRole ?? null;
  const isMember = group.data?.isMember === true;
  const canVote = isMember && role !== null && can(role, 'vote');
  const evaluatedAt = useMemo(
    () => (polls.evaluatedAt ? new Date(polls.evaluatedAt) : null),
    [polls.evaluatedAt],
  );

  return (
    <WeddingScaffold
      testID="group-polls-screen"
      title={t('weddings:polls.title')}
      subtitle={t('weddings:polls.subtitle')}
      notConnectedRetry={polls.refetch}
    >
      {!isMember ? (
        <Banner variant="info" message={t('weddings:polls.notMember')} testID="polls-not-member" />
      ) : null}
      {polls.actionError ? (
        <Banner
          variant="error"
          message={t(authErrorKey(polls.actionError))}
          testID="polls-action-error"
        />
      ) : null}
      {polls.isLoading ? <Skeleton variant="rect" height={140} /> : null}
      {polls.error ? (
        <ErrorState
          title={t('weddings:discovery.errorTitle')}
          description={t('weddings:discovery.errorDescription')}
          onRetry={polls.refetch}
          testID="polls-error"
        />
      ) : null}
      {!polls.isLoading && !polls.error && polls.rows.length === 0 ? (
        <EmptyState
          icon="checkCircle"
          title={t('weddings:polls.empty')}
          description={t('weddings:polls.emptyDescription')}
          testID="polls-empty"
        />
      ) : null}

      {polls.rows.map((row) => {
        const open = evaluatedAt ? evaluatedAt.getTime() < Date.parse(row.poll.deadline) : false;
        return (
          <PollCard
            key={row.poll.id}
            row={row}
            canVote={canVote && open && row.poll.status === 'open'}
            busy={polls.busy}
            onVote={(optionId) => {
              void polls.vote(row.poll.id, optionId);
            }}
          />
        );
      })}

      {role !== null && can(role, 'close_poll') ? (
        <Button
          variant="ghost"
          fullWidth
          label={t('weddings:polls.refresh')}
          onPress={polls.refetch}
          testID="polls-refresh"
        />
      ) : null}
      <Text variant="caption" color="secondary">
        {t('weddings:polls.resultsNote')}
      </Text>
    </WeddingScaffold>
  );
}
