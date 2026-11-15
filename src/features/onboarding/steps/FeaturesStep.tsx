import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { Text } from '@/components/ui';
import { useTheme } from '@/theme';
import { InfoRow } from './InfoRow';

export function FeaturesStep() {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <View testID="onboarding-step-features" style={[styles.container, { gap: theme.spacing[3] }]}>
      <Text variant="h2" align="center">
        {t('onboarding:features.title')}
      </Text>
      <InfoRow
        icon="wallet"
        tint={theme.colors.text.accent}
        title={t('onboarding:features.assistance.title')}
        description={t('onboarding:features.assistance.description')}
      />
      <InfoRow
        icon="heart"
        tint={theme.colors.gold.text}
        title={t('onboarding:features.weddings.title')}
        description={t('onboarding:features.weddings.description')}
      />
      <InfoRow
        icon="users"
        tint={theme.colors.text.accent}
        title={t('onboarding:features.partners.title')}
        description={t('onboarding:features.partners.description')}
      />
      <InfoRow
        icon="shoppingBag"
        tint={theme.colors.gold.text}
        title={t('onboarding:features.souk.title')}
        description={t('onboarding:features.souk.description')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', width: '100%', paddingHorizontal: 8 },
});
