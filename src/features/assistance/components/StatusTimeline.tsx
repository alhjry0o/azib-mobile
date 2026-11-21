import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { Text } from '@/components/ui';
import { useDirection } from '@/hooks';
import { useHomeFormatters } from '@/features/home/hooks/use-home-formatters';
import { useTheme } from '@/theme';
import type { TimelineEntry } from '../hooks/use-assistance-applications';

export interface StatusTimelineProps {
  readonly createdAt: string;
  readonly entries: readonly TimelineEntry[];
}

export function StatusTimeline({ createdAt, entries }: StatusTimelineProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const { isRTL } = useDirection();
  const format = useHomeFormatters();

  const nodes: readonly TimelineEntry[] = [
    { id: 'created', status: 'draft', at: createdAt },
    ...entries,
  ];

  return (
    <View style={{ gap: theme.spacing[3] }} testID="status-timeline">
      {nodes.map((node, index) => {
        const isLast = index === nodes.length - 1;
        return (
          <View
            key={node.id}
            style={[
              styles.row,
              { flexDirection: isRTL ? 'row-reverse' : 'row', gap: theme.spacing[3] },
            ]}
            testID={`timeline-node-${node.status}-${index}`}
          >
            <View style={styles.rail}>
              <View
                style={[
                  styles.dot,
                  {
                    backgroundColor: isLast
                      ? theme.colors.accent.fill
                      : theme.colors.gold.fill,
                  },
                ]}
              />
              {!isLast ? (
                <View style={[styles.line, { backgroundColor: theme.colors.border.subtle }]} />
              ) : null}
            </View>
            <View style={styles.body}>
              <Text variant="bodyStrong">
                {t(`assistance:workflow.status.${node.status}`)}
              </Text>
              <Text variant="caption" color="secondary">
                {format.date(node.at)}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { alignItems: 'flex-start' },
  rail: { alignItems: 'center', width: 16 },
  dot: { width: 12, height: 12, borderRadius: 6 },
  line: { width: 2, flex: 1, minHeight: 28, marginTop: 4 },
  body: { flex: 1, gap: 2, paddingBottom: 8 },
});
