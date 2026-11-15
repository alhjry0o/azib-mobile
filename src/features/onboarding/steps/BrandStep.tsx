import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { ArchHero } from '@/components/brand';
import { Text } from '@/components/ui';
import { useTheme } from '@/theme';

export function BrandStep() {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <View testID="onboarding-step-brand" style={[styles.container, { gap: theme.spacing[3] }]}>
      <ArchHero width={150} variant="outlined">
        <Text variant="display" color="gold" align="center">
          {t('common:appName')}
        </Text>
      </ArchHero>
      <Text variant="h3" align="center">
        {t('onboarding:brand.subtitle')}
      </Text>
      <Text variant="body" color="secondary" align="center">
        {t('onboarding:brand.description')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', width: '100%', paddingHorizontal: 8 },
});
