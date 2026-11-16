import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { ArchHero } from '@/components/brand';
import { Banner, Button, Text } from '@/components/ui';
import { ROUTES, href } from '@/constants/routes';
import { useTheme } from '@/theme';
import { useAuth } from '../use-auth';
import { AuthScaffold } from '../components/AuthScaffold';

export function WelcomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useTheme();
  const auth = useAuth();

  const continueAsGuest = (): void => {
    auth.continueAsGuest();
    router.replace(href(ROUTES.tabs.home));
  };

  return (
    <AuthScaffold
      testID="welcome-screen"
      title={t('auth:welcome.title')}
      subtitle={t('auth:welcome.subtitle')}
      guardBackend={false}
    >
      <View style={styles.hero}>
        <ArchHero width={170} variant="outlined">
          <Text variant="h1" color="gold" align="center">
            {t('common:appName')}
          </Text>
        </ArchHero>
      </View>
      <Button
        fullWidth
        label={t('auth:welcome.signIn')}
        onPress={() => router.push(href(ROUTES.auth.signIn))}
        testID="welcome-sign-in"
      />
      <Button
        variant="secondary"
        fullWidth
        label={t('auth:welcome.signUp')}
        onPress={() => router.push(href(ROUTES.auth.signUp))}
        testID="welcome-sign-up"
      />
      <Button
        variant="ghost"
        fullWidth
        label={t('auth:welcome.guest')}
        onPress={continueAsGuest}
        testID="welcome-guest"
      />
      <View style={{ marginTop: theme.spacing[2] }}>
        <Banner
          variant="info"
          title={t('auth:welcome.guestNoticeTitle')}
          message={t('auth:welcome.guestNotice')}
          testID="welcome-guest-notice"
        />
      </View>
    </AuthScaffold>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center' },
});
