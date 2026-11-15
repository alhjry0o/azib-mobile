// Five-step onboarding: brand, mission, features, privacy, language.
// Always-visible skip. Completion persists onboardingCompleted (P05.1 store).
// Parallax via Hero3D (self-disables on Tier low + Reduce Motion, ADR-0003).
import { useEffect, useState } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Hero3D, QamariyaPattern } from '@/components/brand';
import { Button, ProgressBar, Screen, Text } from '@/components/ui';
import { ROUTES, href } from '@/constants/routes';
import { useDirection, useHaptics, useMotion } from '@/hooks';
import { useOnboardingStore } from '@/stores';
import { useTheme } from '@/theme';
import { BrandStep, FeaturesStep, LanguageStep, MissionStep, PrivacyStep } from './steps';

const STEP_IDS = ['brand', 'mission', 'features', 'privacy', 'language'] as const;
export type OnboardingStepId = (typeof STEP_IDS)[number];

function StepContent({ id }: { id: OnboardingStepId }) {
  switch (id) {
    case 'brand':
      return <BrandStep />;
    case 'mission':
      return <MissionStep />;
    case 'features':
      return <FeaturesStep />;
    case 'privacy':
      return <PrivacyStep />;
    case 'language':
      return <LanguageStep />;
  }
}

export function OnboardingFlow() {
  const [index, setIndex] = useState(0);
  const router = useRouter();
  const { t } = useTranslation();
  const theme = useTheme();
  const { isRTL } = useDirection();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const complete = useOnboardingStore((s) => s.complete);
  const haptics = useHaptics();
  const motion = useMotion();
  const progress = useSharedValue(0);

  const step = STEP_IDS[index] ?? 'brand';
  const isLast = index === STEP_IDS.length - 1;

  useEffect(() => {
    progress.value = withTiming(index / (STEP_IDS.length - 1), {
      duration: motion.duration(theme.durations.slow),
    });
  }, [index, progress, motion, theme.durations.slow]);

  const finish = (): void => {
    haptics.success();
    complete();
    router.replace(href(ROUTES.signIn));
  };

  const heroHeight = Math.max(340, height - insets.top - insets.bottom - 240);

  return (
    <Screen testID="onboarding-flow">
      <View
        style={[
          styles.header,
          { flexDirection: isRTL ? 'row-reverse' : 'row', gap: theme.spacing[3] },
        ]}
      >
        <View style={styles.progressBlock}>
          <ProgressBar value={(index + 1) / STEP_IDS.length} testID="onboarding-progress" />
          <Text variant="caption" color="secondary" align="center">
            {`${index + 1} / ${STEP_IDS.length}`}
          </Text>
        </View>
        <Button
          variant="ghost"
          size="sm"
          label={t('common:buttons.skip')}
          onPress={finish}
          testID="onboarding-skip"
        />
      </View>

      <Hero3D
        progress={progress}
        height={heroHeight}
        testID="onboarding-hero"
        background={
          <View style={StyleSheet.absoluteFill}>
            <View
              style={[StyleSheet.absoluteFill, { backgroundColor: theme.colors.bg.canvas }]}
            />
            <QamariyaPattern width={width} height={heroHeight} opacity={0.1} />
          </View>
        }
        midground={
          <View
            style={[
              styles.midground,
              { flexDirection: isRTL ? 'row-reverse' : 'row', gap: theme.spacing[6] },
            ]}
            pointerEvents="none"
          >
            <View
              style={[styles.orb, { backgroundColor: theme.colors.accent.fill, opacity: 0.25 }]}
            />
            <View
              style={[styles.orbSmall, { backgroundColor: theme.colors.gold.fill, opacity: 0.25 }]}
            />
          </View>
        }
        foreground={<StepContent id={step} />}
      />

      <View style={[styles.footer, { gap: theme.spacing[2], paddingBottom: theme.spacing[2] }]}>
        {index > 0 ? (
          <Button
            variant="ghost"
            fullWidth
            label={t('common:buttons.back')}
            onPress={() => setIndex((i) => Math.max(0, i - 1))}
            testID="onboarding-back"
          />
        ) : null}
        <Button
          fullWidth
          label={isLast ? t('onboarding:finish') : t('common:buttons.continue')}
          onPress={() => {
            if (isLast) {
              finish();
            } else {
              setIndex((i) => Math.min(STEP_IDS.length - 1, i + 1));
            }
          }}
          testID="onboarding-continue"
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', paddingVertical: 8 },
  progressBlock: { flex: 1, gap: 4 },
  midground: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  orb: { width: 90, height: 90, borderRadius: 45 },
  orbSmall: { width: 64, height: 64, borderRadius: 32 },
  footer: { marginTop: 8 },
});
