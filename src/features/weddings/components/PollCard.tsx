import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { Badge, Button, Card, ProgressBar, Text } from '@/components/ui';
import { useDirection } from '@/hooks';
import { useHomeFormatters } from '@/features/home/hooks/use-home-formatters';
import { useTheme } from '@/theme';
import type { PollRow } from '../hooks/use-wedding-polls';

export interface PollCardProps {
  readonly row: PollRow;
  readonly canVote: boolean;
  readonly busy: boolean;
  readonly onVote: (optionId: string) => void;
}

export function PollCard({ row, canVote, busy, onVote }: PollCardProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const { isRTL } = useDirection();
  const format = useHomeFormatters();
  const { poll, tally, myOptionId } = row;

  return (
    <Card style={{ gap: theme.spacing[3] }} testID={`poll-${poll.id}`}>
      <Text variant="h3">{t(poll.questionKey)}</Text>
      <View
        style={[
          styles.row,
          { flexDirection: isRTL ? 'row-reverse' : 'row', gap: theme.spacing[2] },
        ]}
      >
        <Badge
          variant={tally.closed ? 'neutral' : 'pending'}
          size="sm"
          label={tally.closed ? t('weddings:polls.closed') : t('weddings:polls.open')}
        />
        <Badge
          variant={tally.quorumMet ? 'success' : 'warning'}
          size="sm"
          label={
            tally.quorumMet
              ? t('weddings:polls.quorumMet')
              : t('weddings:polls.quorumNotMet')
          }
          testID={`poll-quorum-${poll.id}`}
        />
      </View>
      <Text variant="caption" color="secondary">
        {t('weddings:polls.tieBreak', {
          rule: t(
            poll.tieBreak === 'organizer_vote'
              ? 'weddings:polls.tieBreakOrganizer'
              : 'weddings:polls.tieBreakOrder',
          ),
        })}
      </Text>

      {poll.options.map((option) => {
        const count = tally.counts[option.id] ?? 0;
        const ratio = tally.totalVotes > 0 ? count / tally.totalVotes : 0;
        const isMine = myOptionId === option.id;
        const isWinner = tally.winnerOptionId === option.id;
        return (
          <View key={option.id} style={{ gap: theme.spacing[1] }}>
            <View
              style={[
                styles.row,
                { flexDirection: isRTL ? 'row-reverse' : 'row', gap: theme.spacing[2] },
              ]}
            >
              <Text variant="bodyStrong" style={styles.label}>
                {t(option.labelKey)}
              </Text>
              <Text variant="caption" color="secondary" testID={`poll-count-${poll.id}-${option.id}`}>
                {format.number(count)}
              </Text>
              {isWinner ? (
                <Badge variant="success" size="sm" label={t('weddings:polls.winner')} />
              ) : null}
            </View>
            <ProgressBar value={ratio} size="sm" color={isMine ? 'gold' : 'accent'} />
            {canVote ? (
              <Button
                variant={isMine ? 'secondary' : 'ghost'}
                size="sm"
                disabled={busy}
                label={isMine ? t('weddings:polls.changeVote') : t('weddings:polls.cast')}
                onPress={() => onVote(option.id)}
                testID={`poll-vote-${poll.id}-${option.id}`}
              />
            ) : null}
          </View>
        );
      })}

      <Text variant="caption" color="secondary" testID={`poll-reason-${poll.id}`}>
        {t(tally.reasonKey)}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { alignItems: 'center' },
  label: { flex: 1 },
});
