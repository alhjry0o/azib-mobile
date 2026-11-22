import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Badge, Button, Card, EmptyState, ErrorState, Skeleton, Text } from '@/components/ui';
import { ROUTES, href } from '@/constants/routes';
import { useHomeFormatters } from '@/features/home/hooks/use-home-formatters';
import { useTheme } from '@/theme';
import { CertaintyBadge } from '../components/CertaintyBadge';
import { FinanceScaffold } from '../components/FinanceScaffold';
import { useDonor } from '../hooks/use-donor';

export function MyDonationsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const donor = useDonor();
  const format = useHomeFormatters();

  return (
    <FinanceScaffold
      testID="my-donations-screen"
      title={t('assistance:finance.donations.title')}
      subtitle={t('assistance:finance.donations.subtitle')}
      guardBackend
      notConnectedRetry={donor.refetch}
    >
      <Button
        variant="ghost"
        fullWidth
        leftIcon="checkCircle"
        label={t('assistance:finance.receipts.title')}
        onPress={() => router.push(href(ROUTES.programs.receipts))}
        testID="donations-open-receipts"
      />

      {donor.isLoading ? <Skeleton variant="rect" height={110} /> : null}
      {donor.error ? (
        <ErrorState
          title={t('assistance:finance.donations.errorTitle')}
          description={t('assistance:finance.donations.errorDescription')}
          onRetry={donor.refetch}
          testID="donations-error"
        />
      ) : null}
      {!donor.isLoading && !donor.error && donor.donations.length === 0 ? (
        <EmptyState
          icon="wallet"
          title={t('assistance:finance.donations.empty')}
          description={t('assistance:finance.donations.emptyDescription')}
          action={{
            label: t('assistance:finance.donations.action'),
            onPress: () => router.replace(href(ROUTES.programs.root)),
          }}
          testID="donations-empty"
        />
      ) : null}

      {donor.donations.map((donation) => {
        const nameKey = donation.programId ? donor.programNames[donation.programId] : undefined;
        return (
          <Card
            key={donation.id}
            style={{ gap: theme.spacing[2] }}
            testID={`donation-${donation.id}`}
          >
            <CertaintyBadge status={donation.status} testID={`donation-certainty-${donation.id}`} />
            <Text variant="h3">{format.number(donation.amount)}</Text>
            {nameKey ? (
              <Text variant="caption" color="secondary">
                {t(nameKey)}
              </Text>
            ) : null}
            {donation.anonymous ? (
              <Badge
                variant="neutral"
                size="sm"
                label={t('assistance:finance.donations.anonymousLabel')}
              />
            ) : null}
            {donation.dataOrigin === 'demo' ? (
              <Badge variant="demo" size="sm" label={t('common:demo.badge')} />
            ) : null}
          </Card>
        );
      })}
    </FinanceScaffold>
  );
}
