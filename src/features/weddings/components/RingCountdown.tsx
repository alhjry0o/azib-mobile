import { useTranslation } from 'react-i18next';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { ArchHero, Hero3D, QamariyaPattern } from '@/components/brand';
import { Text } from '@/components/ui';
import { useHomeFormatters } from '@/features/home/hooks/use-home-formatters';
import { useTheme } from '@/theme';

export interface RingCountdownProps {
  readonly days: number;
  readonly hours: number;
  readonly isPast: boolean;
  readonly testID?: string;
}

export function RingCountdown({ days, hours, isPast, testID }: RingCountdownProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const format = useHomeFormatters();
  const progress = useSharedValue(0.5);
  const size = 132;
  const stroke = 6;
  const radius = size / 2 - stroke;
  const offset = radius * 0.32;

  return (
    <View testID={testID}>
      <Hero3D
        progress={progress}
        height={280}
        background={
          <View style={StyleSheet.absoluteFill}>
            <View
              style={[StyleSheet.absoluteFill, { backgroundColor: theme.colors.bg.surface }]}
            />
            <QamariyaPattern width={width} height={280} opacity={0.14} />
          </View>
        }
        foreground={
          <ArchHero width={190} variant="outlined">
            <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
              <Circle
                cx={size / 2 - offset}
                cy={size / 2}
                r={radius}
                stroke={theme.colors.gold.fill}
                strokeWidth={stroke}
                fill="none"
              />
              <Circle
                cx={size / 2 + offset}
                cy={size / 2}
                r={radius}
                stroke={theme.colors.accent.fill}
                strokeWidth={stroke}
                fill="none"
              />
            </Svg>
          </ArchHero>
        }
      />
      <View style={styles.body}>
        <Text variant="h1" color="gold" align="center" testID="countdown-days">
          {isPast ? t('weddings:countdown.today') : format.number(days)}
        </Text>
        <Text variant="body" color="secondary" align="center">
          {isPast
            ? t('weddings:countdown.pastNote')
            : t('weddings:countdown.remaining', { hours: format.number(hours) })}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  body: { gap: 4, paddingHorizontal: 16 },
});
