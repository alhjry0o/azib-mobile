import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { Icon, Text } from '@/components/ui';
import { useTheme } from '@/theme';

export function MissionStep() {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <View testID="onboarding-step-mission" style={[styles.container, { gap: theme.spacing[3] }]}>
      <View
        style={[
          styles.iconCircle,
          {
            borderColor: theme.colors.gold.fill,
            backgroundColor: 'rgba(217,169,40,0.16)',
          },
        ]}
      >
        <Icon name="heart" size={28} color={theme.colors.gold.text} />
      </View>
      <Text variant="h2" align="center">
        {t('onboarding:mission.title')}
      </Text>
      <Text variant="body" color="secondary" align="center">
        {t('onboarding:mission.description')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', width: '100%', paddingHorizontal: 8 },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
