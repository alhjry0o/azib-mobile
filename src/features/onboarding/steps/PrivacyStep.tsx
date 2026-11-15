import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { Text } from '@/components/ui';
import { useTheme } from '@/theme';
import { InfoRow } from './InfoRow';

export function PrivacyStep() {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <View testID="onboarding-step-privacy" style={[styles.container, { gap: theme.spacing[3] }]}>
      <Text variant="h2" align="center">
        {t('onboarding:privacy.title')}
      </Text>
      <InfoRow
        icon="xCircle"
        tint={theme.colors.state.danger}
        title={t('onboarding:privacy.noDating.title')}
        description={t('onboarding:privacy.noDating.description')}
      />
      <InfoRow
        icon="shield"
        tint={theme.colors.state.success}
        title={t('onboarding:privacy.encrypted.title')}
        description={t('onboarding:privacy.encrypted.description')}
      />
      <InfoRow
        icon="userCheck"
        tint={theme.colors.text.accent}
        title={t('onboarding:privacy.noPublicProfiles.title')}
        description={t('onboarding:privacy.noPublicProfiles.description')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', width: '100%', paddingHorizontal: 8 },
});
