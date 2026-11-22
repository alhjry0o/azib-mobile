import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Badge, Button, Card, EmptyState, ErrorState, Skeleton, Text } from '@/components/ui';
import { ROUTES, href } from '@/constants/routes';
import { useHomeFormatters } from '@/features/home/hooks/use-home-formatters';
import { useTheme } from '@/theme';
import { PROGRAM_KIND_CATALOG, programKindOf } from '../catalog/program-kinds';
import { FinanceScaffold } from '../components/FinanceScaffold';
import { useProgramCatalog } from '../hooks/use-program-catalog';

const KIND_LABEL_KEYS: Readonly<Record<string, string>> = {
  grant: 'grant.label',
  partial: 'partial.label',
  qard_hasan: 'qardHasan.label',
  in_kind: 'inKind.label',
  donor_contribution: 'donorContribution.label',
};

export function ProgramCatalogScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const catalog = useProgramCatalog();
  const format = useHomeFormatters();

  return (
    <FinanceScaffold
      testID="program-catalog-screen"
      title={t('assistance:finance.catalog.title')}
      subtitle={t('assistance:finance.catalog.subtitle')}
      backTo={ROUTES.tabs.home}
      guardBackend
      notConnectedRetry={catalog.refetch}
    >
      <Button
        variant="secondary"
        fullWidth
        leftIcon="wallet"
        label={t('assistance:finance.donations.title')}
        onPress={() => router.push(href(ROUTES.programs.donations))}
        testID="catalog-open-donations"
      />
      <Button
        variant="ghost"
        fullWidth
        leftIcon="checkCircle"
        label={t('assistance:finance.receipts.title')}
        onPress={() => router.push(href(ROUTES.programs.receipts))}
        testID="catalog-open-receipts"
      />
      <Button
        variant="ghost"
        fullWidth
        leftIcon="creditCard"
        label={t('assistance:finance.disbursements.title')}
        onPress={() => router.push(href(ROUTES.programs.disbursements))}
        testID="catalog-open-disbursements"
      />
      <Button
        variant="ghost"
        fullWidth
        leftIcon="info"
        label={t('assistance:finance.impact.title')}
        onPress={() => router.push(href(ROUTES.programs.impact))}
        testID="catalog-open-impact"
      />

      <Text variant="h3">{t('assistance:finance.catalog.kindsTitle')}</Text>
      {PROGRAM_KIND_CATALOG.map((kind) => (
        <Card
          key={kind.kind}
          variant="pressable"
          accessibilityLabel={t(kind.labelKey)}
          onPress={() => router.push(href(ROUTES.programs.kind(kind.kind)))}
          testID={`program-kind-${kind.kind}`}
          style={{ gap: theme.spacing[2] }}
        >
          <Text variant="bodyStrong">{t(kind.labelKey)}</Text>
          <Text variant="caption" color="secondary">
            {t(kind.descriptionKey)}
          </Text>
          {kind.referralOnly ? (
            <Badge variant="info" size="sm" label={t('assistance:finance.kind.referralOnly')} />
          ) : null}
          {kind.inKind ? (
            <Badge variant="accent" size="sm" label={t('assistance:finance.kind.inKind')} />
          ) : null}
        </Card>
      ))}

      <Text variant="h3">{t('assistance:finance.catalog.programsTitle')}</Text>
      {catalog.isLoading ? <Skeleton variant="rect" height={110} /> : null}
      {catalog.error ? (
        <ErrorState
          title={t('assistance:finance.catalog.errorTitle')}
          description={t('assistance:finance.catalog.errorDescription')}
          onRetry={catalog.refetch}
          testID="catalog-error"
        />
      ) : null}
      {!catalog.isLoading && !catalog.error && catalog.programs.length === 0 ? (
        <EmptyState
          icon="wallet"
          title={t('assistance:finance.catalog.empty')}
          description={t('assistance:finance.catalog.emptyDescription')}
          testID="catalog-empty"
        />
      ) : null}

      {catalog.programs.map((program) => (
        <Card
          key={program.id}
          variant="crest"
          style={{ gap: theme.spacing[2] }}
          testID={`catalog-program-${program.id}`}
        >
          <Text variant="h3">{t(program.nameKey)}</Text>
          <Text variant="body" color="secondary">
            {t(program.descriptionKey)}
          </Text>
          <Text variant="caption" color="secondary">
            {t('assistance:finance.detail.range', {
              min: format.number(program.minAmount),
              max: format.number(program.maxAmount),
            })}
          </Text>
          <Badge
            variant="pending"
            size="sm"
            label={t(
              `assistance:finance.kinds.${KIND_LABEL_KEYS[programKindOf(program)] ?? 'grant.label'}`,
            )}
          />
          <Button
            fullWidth
            label={t('assistance:finance.catalog.openProgram')}
            onPress={() => router.push(href(ROUTES.programs.detail(program.id)))}
            testID={`catalog-open-${program.id}`}
          />
        </Card>
      ))}
    </FinanceScaffold>
  );
}
