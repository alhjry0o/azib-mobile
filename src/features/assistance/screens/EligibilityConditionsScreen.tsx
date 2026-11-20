import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';
import { Badge, Banner, Button, Card, Screen, Text } from '@/components/ui';
import { ROUTES, href } from '@/constants/routes';
import { useHomeFormatters } from '@/features/home/hooks/use-home-formatters';
import { useTheme } from '@/theme';
import { useEligibilityRules } from '../hooks/use-assistance-query';

export function EligibilityConditionsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const rules = useEligibilityRules();
  const format = useHomeFormatters();
  const data = rules.data;

  const weights = [
    ['needSeverity', data.weights.needSeverity],
    ['incomeToNeeds', data.weights.incomeToNeeds],
    ['obligations', data.weights.obligations],
    ['availableAssets', data.weights.availableAssets],
    ['seriousness', data.weights.seriousness],
    ['jobStability', data.weights.jobStability],
  ] as const;

  return (
    <Screen
      scroll
      testID="conditions-screen"
      contentStyle={{ gap: theme.spacing[4], paddingBottom: theme.spacing[10] }}
    >
      <Button
        variant="ghost"
        size="sm"
        leftIcon="arrowLeft"
        label={t('common:buttons.back')}
        onPress={() => router.replace(href(ROUTES.assistance.root))}
        testID="conditions-back"
        style={styles.back}
      />
      <Text variant="h1">{t('assistance:conditions.title')}</Text>
      <Badge
        variant="pending"
        label={t('assistance:conditions.version', { version: data.version })}
        testID="conditions-version"
      />
      <Banner variant="warning" message={t('assistance:policy.pending')} testID="conditions-pending" />
      <Banner variant="info" message={t('assistance:policy.advisory')} />

      <Card style={{ gap: theme.spacing[2] }} testID="conditions-gates">
        <Text variant="h3">{t('assistance:conditions.gates')}</Text>
        <Text variant="body" color="secondary">
          {t('assistance:gates.realIncome.pass')}
        </Text>
        <Text variant="body" color="secondary">
          {t('assistance:conditions.assetsRule', {
            value: format.number(data.gates.availableAssetsThreshold),
          })}
        </Text>
        <Text variant="body" color="secondary">
          {data.gates.allowPriorAssistanceException
            ? t('assistance:conditions.priorOpen')
            : t('assistance:conditions.priorClosed')}
        </Text>
        <Text variant="body" color="secondary">
          {t('assistance:gates.truth.fail')}
        </Text>
      </Card>

      <Card style={{ gap: theme.spacing[2] }} testID="conditions-weights">
        <Text variant="h3">{t('assistance:conditions.weights')}</Text>
        {weights.map(([key, weight]) => (
          <Text key={key} variant="body" color="secondary">
            {`${t(`assistance:engine.explain.${key}`)} — ${format.number(weight)}`}
          </Text>
        ))}
      </Card>

      <Card style={{ gap: theme.spacing[2] }} testID="conditions-bands">
        <Text variant="h3">{t('assistance:conditions.bands')}</Text>
        {data.bands.map((band) => (
          <Text key={band.id} variant="body" color="secondary" testID={`band-${band.id}`}>
            {`${t(band.labelKey)}: ${format.number(band.min)}–${format.number(band.max)}`}
          </Text>
        ))}
      </Card>

      <Card style={{ gap: theme.spacing[2] }}>
        <Text variant="h3">{t('assistance:conditions.limits')}</Text>
        <Text variant="body" color="secondary">
          {t('assistance:conditions.appealWindow', { days: format.number(data.appealWindowDays) })}
        </Text>
        <Text variant="body" color="secondary">
          {t('assistance:documents.limits')}
        </Text>
        <Text variant="body" color="secondary" testID="conditions-excluded">
          {t('assistance:engine.excluded')}
        </Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  back: { alignSelf: 'flex-start', marginTop: 8 },
});
