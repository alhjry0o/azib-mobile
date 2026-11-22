import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Badge, Button, Card, EmptyState, ErrorState, Skeleton, Text } from '@/components/ui';
import { ROUTES, href } from '@/constants/routes';
import { useHomeFormatters } from '@/features/home/hooks/use-home-formatters';
import { useTheme } from '@/theme';
import { kindInfo, programKindOf } from '../catalog/program-kinds';
import { FinanceScaffold } from '../components/FinanceScaffold';
import { useProgramDetail } from '../hooks/use-program-catalog';

export function ProgramDetailScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ id?: string }>();
  const id = params.id ?? '';
  const detail = useProgramDetail(id);
  const format = useHomeFormatters();

  const program = detail.program;
  const kind = program ? programKindOf(program) : 'grant';
  const info = kindInfo(kind);
  const canDonate = program !== null && program.status === 'open' && info.donatable;

  return (
    <FinanceScaffold
      testID="program-detail-screen"
      title={t('assistance:finance.detail.title')}
      guardBackend
      notConnectedRetry={detail.refetch}
    >
      {detail.isLoading ? <Skeleton variant="rect" height={140} /> : null}
      {detail.error ? (
        <ErrorState
          title={t('assistance:finance.catalog.errorTitle')}
          description={t('assistance:finance.catalog.errorDescription')}
          onRetry={detail.refetch}
          testID="program-detail-error"
        />
      ) : null}
      {!detail.isLoading && !detail.error && !program ? (
        <EmptyState
          icon="info"
          title={t('assistance:finance.detail.notFound')}
          description={t('assistance:finance.detail.notFoundDescription')}
          action={{
            label: t('assistance:finance.catalog.title'),
            onPress: () => router.replace(href(ROUTES.programs.root)),
          }}
          testID="program-detail-missing"
        />
      ) : null}

      {program ? (
        <Card variant="crest" style={{ gap: theme.spacing[2] }} testID="program-detail-card">
          <Text variant="h2">{t(program.nameKey)}</Text>
          <Text variant="body" color="secondary">
            {t(program.descriptionKey)}
          </Text>
          <Text variant="caption" color="secondary" testID="program-detail-range">
            {t('assistance:finance.detail.range', {
              min: format.number(program.minAmount),
              max: format.number(program.maxAmount),
            })}
          </Text>
          <Badge variant="pending" size="sm" label={t(info.labelKey)} testID="program-detail-kind" />
          {program.dataOrigin === 'demo' ? (
            <Badge variant="demo" size="sm" label={t('common:demo.badge')} />
          ) : null}
        </Card>
      ) : null}

      {program ? (
        <Button
          variant="ghost"
          fullWidth
          leftIcon="info"
          label={t('assistance:finance.detail.kindInfo')}
          onPress={() => router.push(href(ROUTES.programs.kind(kind)))}
          testID="program-detail-kind-info"
        />
      ) : null}

      {canDonate ? (
        <Button
          fullWidth
          leftIcon="wallet"
          label={t('assistance:finance.detail.donate')}
          onPress={() => router.push(href(ROUTES.programs.donate(id)))}
          testID="program-detail-donate"
        />
      ) : null}

      {program && !canDonate ? (
        <Text variant="body" color="secondary" testID="program-detail-blocked">
          {info.donatable
            ? t('assistance:finance.detail.notOpen')
            : t('assistance:finance.detail.notDonatable')}
        </Text>
      ) : null}
    </FinanceScaffold>
  );
}
