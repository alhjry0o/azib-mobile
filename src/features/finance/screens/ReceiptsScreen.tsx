import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Badge, Card, EmptyState, ErrorState, Skeleton, Text } from '@/components/ui';
import { ROUTES, href } from '@/constants/routes';
import { useHomeFormatters } from '@/features/home/hooks/use-home-formatters';
import { useTheme } from '@/theme';
import { FinanceScaffold } from '../components/FinanceScaffold';
import { useDonor } from '../hooks/use-donor';

export function ReceiptsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const donor = useDonor();
  const format = useHomeFormatters();

  return (
    <FinanceScaffold
      testID="receipts-screen"
      title={t('assistance:finance.receipts.title')}
      subtitle={t('assistance:finance.receipts.subtitle')}
      backTo={ROUTES.programs.donations}
      guardBackend
      notConnectedRetry={donor.refetch}
    >
      {donor.isLoading ? <Skeleton variant="rect" height={110} /> : null}
      {donor.error ? (
        <ErrorState
          title={t('assistance:finance.donations.errorTitle')}
          description={t('assistance:finance.donations.errorDescription')}
          onRetry={donor.refetch}
          testID="receipts-error"
        />
      ) : null}
      {!donor.isLoading && !donor.error && donor.receipts.length === 0 ? (
        <EmptyState
          icon="checkCircle"
          title={t('assistance:finance.receipts.empty')}
          description={t('assistance:finance.receipts.emptyDescription')}
          action={{
            label: t('assistance:finance.donations.title'),
            onPress: () => router.replace(href(ROUTES.programs.donations)),
          }}
          testID="receipts-empty"
        />
      ) : null}

      {donor.receipts.map((receipt) => (
        <Card
          key={receipt.receiptNumber}
          variant="crest"
          style={{ gap: theme.spacing[2] }}
          testID={`receipt-${receipt.receiptNumber}`}
        >
          <Text variant="caption" color="secondary">
            {t('assistance:finance.receipts.number')}
          </Text>
          <Text variant="h3" color="gold">
            {receipt.receiptNumber}
          </Text>
          <Text variant="bodyStrong">{format.number(receipt.amount)}</Text>
          <Text variant="caption" color="secondary">
            {t('assistance:finance.receipts.issuedAt', { date: format.date(receipt.issuedAt) })}
          </Text>
          {receipt.anonymous ? (
            <Badge
              variant="neutral"
              size="sm"
              label={t('assistance:finance.donations.anonymousLabel')}
            />
          ) : null}
          {receipt.dataOrigin === 'demo' ? (
            <Badge variant="demo" size="sm" label={t('assistance:finance.receipts.demoNote')} />
          ) : null}
        </Card>
      ))}
    </FinanceScaffold>
  );
}
