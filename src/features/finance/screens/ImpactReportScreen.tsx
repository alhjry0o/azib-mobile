import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Badge, Banner, Card, EmptyState, ErrorState, Skeleton, Text } from '@/components/ui';
import { ROUTES, href } from '@/constants/routes';
import { useHomeFormatters } from '@/features/home/hooks/use-home-formatters';
import { useTheme } from '@/theme';
import { FinanceScaffold } from '../components/FinanceScaffold';
import { useImpactReport } from '../hooks/use-impact-report';
import type { StatValue } from '@/features/home/stats-privacy';

export function ImpactReportScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const impact = useImpactReport();
  const format = useHomeFormatters();
  const report = impact.report;

  const renderValue = (value: StatValue): string =>
    value.kind === 'value'
      ? format.number(value.value)
      : t('assistance:finance.impact.suppressed');

  return (
    <FinanceScaffold
      testID="impact-report-screen"
      title={t('assistance:finance.impact.title')}
      subtitle={t('assistance:finance.impact.subtitle')}
      guardBackend
      notConnectedRetry={impact.refetch}
    >
      <Banner
        variant="warning"
        message={t('assistance:finance.impact.realOnly')}
        testID="impact-real-only"
      />

      {impact.isLoading ? <Skeleton variant="rect" height={110} /> : null}
      {impact.error ? (
        <ErrorState
          title={t('assistance:finance.impact.errorTitle')}
          description={t('assistance:finance.impact.errorDescription')}
          onRetry={impact.refetch}
          testID="impact-error"
        />
      ) : null}

      {report && !report.hasRealData ? (
        <EmptyState
          icon="info"
          title={t('assistance:finance.impact.empty')}
          description={t('assistance:finance.impact.emptyDescription')}
          action={{
            label: t('assistance:finance.catalog.title'),
            onPress: () => router.replace(href(ROUTES.programs.root)),
          }}
          testID="impact-empty"
        />
      ) : null}

      {report && report.hasRealData
        ? report.metrics.map((metric) => (
            <Card
              key={metric.key}
              variant="stat"
              title={t(`assistance:finance.impact.metrics.${metric.key}`)}
              value={renderValue(metric.count)}
              leftIcon="wallet"
              caption={
                metric.total
                  ? renderValue(metric.total)
                  : t(metric.definitionKey)
              }
              testID={`impact-metric-${metric.key}`}
            />
          ))
        : null}

      {report ? (
        <>
          <Badge
            variant="pending"
            size="sm"
            label={t('assistance:finance.impact.thresholdNote', {
              threshold: format.number(report.threshold),
            })}
            testID="impact-threshold"
          />
          {report.metrics.map((metric) => (
            <Text key={metric.key} variant="caption" color="secondary">
              {t(metric.definitionKey)}
            </Text>
          ))}
        </>
      ) : null}

      <Text variant="caption" color="secondary" style={{ marginTop: theme.spacing[2] }}>
        {t('assistance:finance.impact.noRealData')}
      </Text>
    </FinanceScaffold>
  );
}
