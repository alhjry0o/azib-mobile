// Temporary onboarding entry for P05.1. P05.2 replaces this with the full
// five-step flow. The completion action is REAL: it persists the flag.
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { ArchHero } from '@/components/brand';
import { Button, Screen, Text } from '@/components/ui';
import { ROUTES, href } from '@/constants/routes';
import { useOnboardingStore } from '@/stores';

export function OnboardingPlaceholder() {
  const complete = useOnboardingStore((s) => s.complete);
  const router = useRouter();
  const { t } = useTranslation();

  const finish = (): void => {
    complete();
    router.replace(href(ROUTES.signIn));
  };

  return (
    <Screen testID="onboarding-screen" style={styles.center}>
      <View style={styles.hero}>
        <ArchHero width={220}>
          <Text variant="display" color="gold" align="center">
            {t('common:appName')}
          </Text>
        </ArchHero>
      </View>
      <Text variant="h2" align="center" style={styles.title}>
        {t('common:shell.features.onboarding.title')}
      </Text>
      <Text variant="body" color="secondary" align="center" style={styles.description}>
        {t('common:shell.features.onboarding.description')}
      </Text>
      <Button
        fullWidth
        label={t('common:shell.features.onboarding.action')}
        onPress={finish}
        testID="onboarding-continue"
      />
      <Button
        variant="ghost"
        fullWidth
        label={t('common:buttons.skip')}
        onPress={finish}
        testID="onboarding-skip"
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { justifyContent: 'center', gap: 16 },
  hero: { alignItems: 'center' },
  title: { marginTop: 8 },
  description: { marginBottom: 8 },
});
