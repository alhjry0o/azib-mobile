import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Button, EmptyState, Skeleton, Text } from '@/components/ui';
import { ROUTES, href } from '@/constants/routes';
import { useHomeFormatters } from '@/features/home/hooks/use-home-formatters';
import { RingCountdown } from '../components/RingCountdown';
import { WeddingScaffold } from '../components/WeddingScaffold';
import { useWeddingCountdown } from '../hooks/use-wedding-countdown';
import { useWeddingGroup } from '../hooks/use-wedding-group';

export function GroupCountdownScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const groupId = params.id ?? '';
  const countdown = useWeddingCountdown(groupId);
  const group = useWeddingGroup(groupId);
  const format = useHomeFormatters();
  const value = countdown.data?.ok ? countdown.data.value : null;
  const isMember = group.data?.isMember === true;

  return (
    <WeddingScaffold
      testID="group-countdown-screen"
      title={t('weddings:countdown.title')}
      subtitle={t('weddings:countdown.subtitle')}
    >
      {countdown.isLoading ? <Skeleton variant="rect" height={200} /> : null}
      {!countdown.isLoading && !value ? (
        <EmptyState
          icon="calendar"
          title={t('weddings:detail.notFound')}
          description={t('weddings:detail.notFoundDescription')}
          testID="countdown-missing"
        />
      ) : null}
      {value && isMember ? (
        <>
          <RingCountdown
            days={value.days}
            hours={value.hours}
            isPast={value.isPast}
            testID="ring-countdown"
          />
          <Text variant="caption" color="secondary" align="center">
            {t('weddings:detail.scheduled', { date: format.date(value.scheduledDate) })}
          </Text>
          <Button
            fullWidth
            variant="secondary"
            label={t('weddings:completion.title')}
            onPress={() => router.push(href(ROUTES.weddings.completion(groupId)))}
            testID="countdown-open-completion"
          />
        </>
      ) : null}
      {value && !isMember ? (
        <>
          <Text
            variant="caption"
            color="secondary"
            align="center"
            testID="countdown-public-month"
          >
            {t('weddings:discovery.approximateDate', {
              month: value.scheduledDate.slice(0, 7),
            })}
          </Text>
          <Text variant="body" color="secondary" testID="countdown-public-note">
            {t('weddings:detail.publicNote')}
          </Text>
        </>
      ) : null}
    </WeddingScaffold>
  );
}
