import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { RadioGroup, Text } from '@/components/ui';
import { useLanguageSwitch } from '@/features/shell/use-language-switch';
import { useTheme } from '@/theme';

export function LanguageStep() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { language, switchLanguage } = useLanguageSwitch();

  return (
    <View testID="onboarding-step-language" style={[styles.container, { gap: theme.spacing[3] }]}>
      <Text variant="h2" align="center">
        {t('onboarding:language.title')}
      </Text>
      <Text variant="body" color="secondary" align="center">
        {t('onboarding:language.description')}
      </Text>
      <RadioGroup
        options={[
          { value: 'ar' as const, label: t('common:language.arabic') },
          { value: 'en' as const, label: t('common:language.english') },
        ]}
        value={language}
        onValueChange={(value) => {
          void switchLanguage(value);
        }}
      />
      <Text variant="caption" color="secondary" align="center">
        {t('onboarding:language.directionNote')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'stretch', width: '100%', paddingHorizontal: 8 },
});
