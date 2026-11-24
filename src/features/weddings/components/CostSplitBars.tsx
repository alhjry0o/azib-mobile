import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { Text } from '@/components/ui';
import { useHomeFormatters } from '@/features/home/hooks/use-home-formatters';
import { useTheme } from '@/theme';
import type { MemberCost } from '../engine/cost-sharing';

export interface CostSplitBarsProps {
  readonly shares: readonly MemberCost[];
  readonly labels: Readonly<Record<string, string>>;
  readonly testID?: string;
}

const BAR_HEIGHT = 10;

export function CostSplitBars({ shares, labels, testID }: CostSplitBarsProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const format = useHomeFormatters();
  const max = shares.reduce((best, s) => (s.total > best ? s.total : best), 0);

  return (
    <View style={{ gap: theme.spacing[3] }} testID={testID}>
      {shares.map((share) => {
        const ratio = max > 0 ? share.total / max : 0;
        return (
          <View key={share.memberId} style={{ gap: theme.spacing[1] }}>
            <View style={[styles.row, { gap: theme.spacing[2] }]}>
              <Text variant="captionStrong" style={styles.label} numberOfLines={1}>
                {labels[share.memberId] ?? t('weddings:members.anonymous')}
              </Text>
              <Text variant="caption" color="secondary">
                {format.number(share.total)}
              </Text>
            </View>
            <Svg width="100%" height={BAR_HEIGHT} testID={`cost-bar-${share.memberId}`}>
              <Rect
                x="0"
                y="0"
                width="100%"
                height={BAR_HEIGHT}
                rx={BAR_HEIGHT / 2}
                fill={theme.colors.bg.raised}
              />
              <Rect
                x="0"
                y="0"
                width={`${Math.round(ratio * 100)}%`}
                height={BAR_HEIGHT}
                rx={BAR_HEIGHT / 2}
                fill={theme.colors.gold.fill}
              />
            </Svg>
            <Text variant="caption" color="tertiary">
              {t('weddings:budget.splitDetail', {
                shared: format.number(share.shared),
                individual: format.number(share.individual),
              })}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  label: { flex: 1 },
});
