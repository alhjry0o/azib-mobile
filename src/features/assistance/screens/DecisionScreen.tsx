import { useMemo } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { Badge, Banner, Button, Card, EmptyState, Screen, Text } from '@/components/ui';
import { ROUTES, href } from '@/constants/routes';
import { useHomeFormatters } from '@/features/home/hooks/use-home-formatters';
import { useTheme } from '@/theme';
import { useApplicationDetail } from '../hooks/use-assistance-applications';
import { useEligibilityRules } from '../hooks/use-assistance-query';

export function DecisionScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ id?: string }>();
  const id = params.id ?? '';
  const detail = useApplicationDetail(id);
  const rules = useEligibilityRules();
  const format = useHomeFormatters();

  const application = detail.application;
  const decision = application?.decision ?? null;

  if (!application || !decision) {
    return (
      <Screen testID="decision-screen" style={styles.center}>
        <EmptyState
          icon="info"
          title={t('assistance:decision.pendingTitle')}
          description={t('assistance:decision.pendingDescription')}
          action={{
            label: t('assistance:detail.title'),
            onPress: () => router.replace(href(ROUTES.assistance.detail(id))),
          }}
          testID="decision-pending"
        />
      </Screen>
    );
  }

  const appeal = application.appeal ?? null;
  const decidedAt = Date.parse(decision.decidedAt);
  const withinWindow = useMemo(() => {
    if (Number.isNaN(decidedAt)) return false;
    // eslint-disable-next-line react-hooks/purity
    return Date.now() - decidedAt <= rules.data.appealWindowDays * 24 * 60 * 60 * 1000;
  }, [decidedAt, rules.data.appealWindowDays]);
  
  const canAppeal = decision.outcome === 'rejected' && appeal === null && withinWindow;

  return (
    <Screen
      scroll
      testID="decision-screen"
      contentStyle={{ gap: theme.spacing[4], paddingBottom: theme.spacing[10] }}
    >
      <Button
        variant="ghost"
        size="sm"
        leftIcon="arrowLeft"
        label={t('common:buttons.back')}
        onPress={() => router.replace(href(ROUTES.assistance.detail(id)))}
        testID="decision-back"
        style={styles.back}
      />
      <Text variant="h1">{t('assistance:decision.title')}</Text>

      <Card variant="crest" style={{ gap: theme.spacing[2] }} testID="decision-card">
        <Badge
          variant={decision.outcome === 'approved' ? 'success' : 'danger'}
          label={t(`assistance:decision.${decision.outcome}`)}
          testID="decision-outcome"
        />
        <Text variant="caption" color="secondary">
          {t('assistance:decision.reviewer')}
        </Text>
        <Text variant="caption" color="secondary" testID="decision-date">
          {format.date(decision.decidedAt)}
        </Text>
      </Card>

      <Text variant="h3">{t('assistance:decision.reasons')}</Text>
      <View style={{ gap: theme.spacing[2] }} testID="decision-reasons">
        {decision.reasonKeys.map((key) => (
          <Text key={key} variant="body" color="secondary" testID={`decision-reason-${key}`}>
            {t(key)}
          </Text>
        ))}
      </View>

      <Banner
        variant="info"
        message={t('assistance:decision.noScores')}
        testID="decision-no-scores"
      />

      {canAppeal ? (
        <Button
          fullWidth
          variant="secondary"
          label={t('assistance:decision.appealCta')}
          onPress={() => router.push(href(ROUTES.assistance.appeal(id)))}
          testID="decision-appeal"
        />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { justifyContent: 'center' },
  back: { alignSelf: 'flex-start', marginTop: 8 },
});
