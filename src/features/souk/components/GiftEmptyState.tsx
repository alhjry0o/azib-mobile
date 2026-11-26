// 3D gift illustration for the empty state (HRD P12 §7).
// Reuses the existing brand layers; Hero3D disables parallax on Tier low
// and under Reduce Motion, so no extra motion logic is needed here.
import { useTranslation } from 'react-i18next';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import { ArchHero, Hero3D, QamariyaPattern } from '@/components/brand';
import { EmptyState, Icon, Text } from '@/components/ui';
import { useTheme } from '@/theme';

export interface GiftEmptyStateProps {
  readonly title: string;
  readonly description: string;
  readonly actionLabel?: string;
  readonly onAction?: () => void;
  readonly testID?: string;
}

export function GiftEmptyState({
  title,
  description,
  actionLabel,
  onAction,
  testID,
}: GiftEmptyStateProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const progress = useSharedValue(0);

  return (
    <View style={{ gap: theme.spacing[3] }}>
      <View testID={testID ? `${testID}-gift` : undefined}>
        <Hero3D
          progress={progress}
          height={200}
          background={
            <View style={StyleSheet.absoluteFill}>
              <View
                style={[StyleSheet.absoluteFill, { backgroundColor: theme.colors.bg.surface }]}
              />
              <QamariyaPattern width={width} height={200} opacity={0.12} />
            </View>
          }
          foreground={
            <ArchHero width={130} variant="outlined">
              <Icon name="gift" size={44} color={theme.colors.gold.fill} />
              <Text variant="caption" color="secondary" align="center">
                {t('marketplace:souk.demo.inKindOnly')}
              </Text>
            </ArchHero>
          }
        />
      </View>
      <EmptyState
        icon="gift"
        testID={testID}
        title={title}
        description={description}
        action={
          actionLabel && onAction ? { label: actionLabel, onPress: onAction } : undefined
        }
      />
    </View>
  );
}
