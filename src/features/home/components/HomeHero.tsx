import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';
import { ArchHero, Hero3D, QamariyaPattern } from '@/components/brand';
import { Button, Text } from '@/components/ui';
import { ROUTES, href } from '@/constants/routes';
import { useAuth } from '@/features/auth';
import { useDirection } from '@/hooks';
import { useTheme } from '@/theme';

export interface HomeHeroProps {
  readonly progress: SharedValue<number>;
}

export function HomeHero({ progress }: HomeHeroProps) {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const { isRTL } = useDirection();
  const { width } = useWindowDimensions();
  const auth = useAuth();

  const isApplicant = auth.user?.roles?.includes('applicant') === true;
  const primaryLabel = isApplicant ? t('home:hero.startRequest') : t('home:hero.exploreWeddings');
  const primaryRoute = isApplicant ? ROUTES.assistance.root : ROUTES.tabs.weddings;

  return (
    <View style={styles.wrapper} testID="home-hero">
      <Hero3D
        progress={progress}
        height={300}
        testID="home-hero-3d"
        background={
          <View style={StyleSheet.absoluteFill}>
            <View style={[StyleSheet.absoluteFill, { backgroundColor: theme.colors.bg.surface }]} />
            <QamariyaPattern width={width} height={300} opacity={0.14} />
          </View>
        }
        midground={
          <View
            style={[
              styles.midground,
              { flexDirection: isRTL ? 'row-reverse' : 'row', gap: theme.spacing[8] },
            ]}
            pointerEvents="none"
          >
            <View style={[styles.orb, { backgroundColor: theme.colors.accent.fill, opacity: 0.3 }]} />
            <View style={[styles.orbSmall, { backgroundColor: theme.colors.gold.fill, opacity: 0.3 }]} />
          </View>
        }
        foreground={
          <ArchHero width={180} variant="outlined" testID="home-hero-arch">
            <Text variant="h2" color="gold" align="center">
              {t('home:hero.title')}
            </Text>
            <Text variant="caption" color="secondary" align="center" style={styles.subtitle}>
              {t('home:hero.subtitle')}
            </Text>
          </ArchHero>
        }
      />
      <View
        style={[
          styles.actions,
          {
            flexDirection: isRTL ? 'row-reverse' : 'row',
            gap: theme.spacing[2],
            paddingHorizontal: theme.spacing[4],
          },
        ]}
      >
        <Button
          style={styles.action}
          label={primaryLabel}
          leftIcon={isApplicant ? 'wallet' : 'heart'}
          onPress={() => router.navigate(href(primaryRoute))}
          testID="hero-primary"
        />
        <Button
          style={styles.action}
          variant="secondary"
          label={t('home:hero.browseServices')}
          leftIcon="menu"
          onPress={() => router.navigate(href(ROUTES.tabs.services))}
          testID="hero-secondary"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 12, paddingTop: 8 },
  midground: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  orb: { width: 96, height: 96, borderRadius: 48 },
  orbSmall: { width: 64, height: 64, borderRadius: 32 },
  subtitle: { marginTop: 6 },
  actions: { alignItems: 'center' },
  action: { flex: 1 },
});
