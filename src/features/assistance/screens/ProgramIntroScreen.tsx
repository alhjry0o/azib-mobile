import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorState,
  NotConnectedState,
  Screen,
  Skeleton,
  Text,
} from '@/components/ui';
import { ROUTES, href } from '@/constants/routes';
import { useProviderContainer } from '@/providers';
import { useAssistanceDraftStore } from '@/stores';
import { useTheme } from '@/theme';
import { useOpenPrograms } from '../hooks/use-assistance-query';

export function ProgramIntroScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const container = useProviderContainer();
  const programs = useOpenPrograms();
  const setProgram = useAssistanceDraftStore((s) => s.setProgram);

  if (container.mode !== 'demo') {
    return (
      <Screen testID="program-intro-screen" style={styles.center}>
        <NotConnectedState
          title={t('assistance:program.notConnected')}
          description={t('assistance:program.notConnectedDescription')}
          onRetry={programs.refetch}
        />
      </Screen>
    );
  }

  return (
    <Screen
      scroll
      testID="program-intro-screen"
      contentStyle={{ gap: theme.spacing[4], paddingBottom: theme.spacing[10] }}
    >
      <Text variant="h1" style={styles.title}>
        {t('assistance:program.title')}
      </Text>
      <Text variant="body" color="secondary">
        {t('assistance:program.subtitle')}
      </Text>
      <Badge variant="pending" label={t('assistance:policy.pending')} testID="program-policy-badge" />

      <Button
        variant="secondary"
        fullWidth
        leftIcon="info"
        label={t('assistance:program.conditions')}
        onPress={() => router.push(href(ROUTES.assistance.conditions))}
        testID="program-open-conditions"
      />
      <Button
        variant="ghost"
        fullWidth
        leftIcon="sparkles"
        label={t('assistance:program.preCheck')}
        onPress={() => router.push(href(ROUTES.assistance.preCheck))}
        testID="program-open-precheck"
      />

      {programs.isLoading ? <Skeleton variant="rect" height={120} /> : null}
      {programs.error ? (
        <ErrorState
          title={t('assistance:program.errorTitle')}
          description={t('assistance:program.errorDescription')}
          onRetry={programs.refetch}
          testID="program-error"
        />
      ) : null}
      {!programs.isLoading && !programs.error && programs.programs.length === 0 ? (
        <EmptyState
          icon="wallet"
          title={t('assistance:program.empty')}
          description={t('assistance:program.emptyDescription')}
          testID="program-empty"
        />
      ) : null}

      {programs.programs.map((program) => (
        <Card
          key={program.id}
          variant="crest"
          style={{ gap: theme.spacing[2] }}
          testID={`program-${program.id}`}
        >
          <Text variant="h3">{t(program.nameKey)}</Text>
          <Text variant="body" color="secondary">
            {t(program.descriptionKey)}
          </Text>
          {program.dataOrigin === 'demo' ? (
            <Badge variant="demo" size="sm" label={t('common:demo.badge')} />
          ) : null}
          <Button
            fullWidth
            label={t('assistance:program.start')}
            onPress={() => {
              setProgram(program.id);
              router.push(href(ROUTES.assistance.new));
            }}
            testID={`program-start-${program.id}`}
          />
        </Card>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { justifyContent: 'center' },
  title: { marginTop: 16 },
});
