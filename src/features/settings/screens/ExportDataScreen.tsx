import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { Banner, Button, Card, Text } from '@/components/ui';
import { authErrorKey } from '@/features/auth/errors';
import { useTheme } from '@/theme';
import { SettingsScaffold } from '../components/SettingsScaffold';
import { EXPORT_NOTICES } from '../export-service';
import { useDataExport } from '../use-data-export';

export function ExportDataScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const exporter = useDataExport();

  return (
    <SettingsScaffold
      testID="settings-export-screen"
      title={t('profile:settings.rows.exportData')}
      guardBackend
    >
      <Card style={{ gap: theme.spacing[2] }}>
        <Text variant="h3">{t('auth:export.contentsTitle')}</Text>
        <Text variant="body" color="secondary">
          {t('auth:export.contentsBody')}
        </Text>
      </Card>
      {EXPORT_NOTICES.map((key) => (
        <Text key={key} variant="caption" color="secondary">
          {t(key)}
        </Text>
      ))}
      {exporter.error ? (
        <Banner
          variant="error"
          message={t(authErrorKey(exporter.error))}
          testID="export-error"
        />
      ) : null}
      {exporter.saved ? (
        <Banner
          variant="info"
          message={
            exporter.saved.shared
              ? t('auth:export.sharedSuccess', { uri: exporter.saved.uri })
              : t('auth:export.savedOnly', { uri: exporter.saved.uri })
          }
          testID="export-success"
        />
      ) : null}
      <View style={styles.actions}>
        <Button
          fullWidth
          loading={exporter.busy}
          label={t('auth:export.action')}
          onPress={() => {
            void exporter.run();
          }}
          testID="export-run"
        />
      </View>
    </SettingsScaffold>
  );
}

const styles = StyleSheet.create({
  actions: { width: '100%', marginTop: 8 },
});
