import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';
import { Badge, Banner, Button, Card, EmptyState, Screen, Text } from '@/components/ui';
import { ROUTES, href } from '@/constants/routes';
import { useTheme } from '@/theme';
import { findLegalDocument } from './legal-documents';

export function LegalDocScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ doc?: string }>();
  const document = findLegalDocument(params.doc);

  if (!document) {
    return (
      <Screen testID="legal-screen" style={styles.center}>
        <EmptyState
          testID="legal-not-found"
          icon="info"
          title={t('legal:missing.title')}
          description={t('legal:missing.description')}
          action={{
            label: t('common:shell.placeholder.backHome'),
            onPress: () => router.replace(href(ROUTES.settings.root)),
          }}
        />
      </Screen>
    );
  }

  return (
    <Screen
      scroll
      testID="legal-screen"
      contentStyle={{ gap: theme.spacing[4], paddingBottom: theme.spacing[10] }}
    >
      <Button
        variant="ghost"
        size="sm"
        leftIcon="arrowLeft"
        label={t('common:buttons.back')}
        onPress={() => router.replace(href(ROUTES.settings.root))}
        testID="legal-back"
        style={styles.back}
      />
      <Text variant="h1">{t(document.titleKey)}</Text>
      <Badge
        variant="pending"
        label={t('legal:version', { version: document.version })}
        testID="legal-version"
      />
      <Banner
        variant="warning"
        message={t('legal:reviewBanner')}
        testID="legal-review-banner"
      />
      <Text variant="body" color="secondary">
        {t(document.summaryKey)}
      </Text>
      {document.sections.map((section) => (
        <Card
          key={section.id}
          style={{ gap: theme.spacing[2] }}
          testID={`legal-section-${section.id}`}
        >
          <Text variant="h3">{t(section.headingKey)}</Text>
          <Text variant="body" color="secondary">
            {t(section.bodyKey)}
          </Text>
        </Card>
      ))}
      <Text variant="caption" color="secondary">{t('legal:footer')}</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { justifyContent: 'center' },
  back: { alignSelf: 'flex-start', marginTop: 8 },
});
