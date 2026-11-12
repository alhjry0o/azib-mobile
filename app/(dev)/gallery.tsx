// Internal Design System Gallery. Grows in Parts 2–7.
// Route: /gallery (group (dev) does not appear in the URL).

import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useDirection, useDeviceTier } from '@/hooks';
import { useTheme } from '@/theme';

export default function GalleryScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { direction } = useDirection();
  const { tier } = useDeviceTier();

  return (
    <ScrollView
      style={{ backgroundColor: theme.colors.bg.canvas }}
      contentContainerStyle={[
        styles.container,
        {
          paddingTop: insets.top + theme.spacing[6],
          paddingBottom: insets.bottom + theme.spacing[6],
        },
      ]}
    >
      <Text style={[styles.title, theme.typography.h1, { color: theme.colors.text.primary }]}>
        Gallery
      </Text>
      <Text
        style={[styles.subtitle, theme.typography.caption, { color: theme.colors.text.secondary }]}
      >
        dir: {direction} · tier: {tier}
      </Text>

      <Section title="Colors">
        <View style={styles.swatchGrid}>
          {(
            [
              ['bg.canvas', theme.colors.bg.canvas],
              ['bg.surface', theme.colors.bg.surface],
              ['bg.raised', theme.colors.bg.raised],
              ['accent.fill', theme.colors.accent.fill],
              ['accent.text', theme.colors.accent.text],
              ['gold.fill', theme.colors.gold.fill],
              ['gold.text', theme.colors.gold.text],
              ['state.success', theme.colors.state.success],
              ['state.danger', theme.colors.state.danger],
              ['state.info', theme.colors.state.info],
            ] as const
          ).map(([name, color]) => (
            <View key={name} style={styles.swatchItem}>
              <View style={[styles.swatch, { backgroundColor: color }]} />
              <Text
                style={[
                  styles.swatchLabel,
                  theme.typography.caption,
                  { color: theme.colors.text.secondary },
                ]}
              >
                {name}
              </Text>
            </View>
          ))}
        </View>
      </Section>

      <Section title="Typography">
        {(['display', 'h1', 'h2', 'h3', 'body', 'bodyStrong', 'caption'] as const).map((k) => (
          <Text
            key={k}
            style={[theme.typography[k], { color: theme.colors.text.primary, marginBottom: 8 }]}
          >
            {k} — عازب AZIB
          </Text>
        ))}
      </Section>

      <Section title="Spacing">
        <View style={styles.spacingRow}>
          {(['1', '2', '3', '4', '5', '6', '8', '10'] as const).map((k) => (
            <View key={k} style={styles.spacingItem}>
              <View
                style={{
                  width: theme.spacing[Number(k) as keyof typeof theme.spacing],
                  height: theme.spacing[Number(k) as keyof typeof theme.spacing],
                  backgroundColor: theme.colors.accent.fill,
                  borderRadius: theme.radius.xs,
                }}
              />
              <Text
                style={[styles.caption, theme.typography.caption, { color: theme.colors.text.secondary }]}
              >
                {k}
              </Text>
            </View>
          ))}
        </View>
      </Section>

      <Text style={[styles.comingSoon, theme.typography.caption, { color: theme.colors.text.tertiary }]}>
        Components will be added in Parts 2–7.
      </Text>
    </ScrollView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const theme = useTheme();
  return (
    <View style={{ marginTop: theme.spacing[8], gap: theme.spacing[3] }}>
      <Text style={[theme.typography.h2, { color: theme.colors.text.primary }]}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
  },
  title: { marginBottom: 4 },
  subtitle: { marginBottom: 8 },
  swatchGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  swatchItem: { width: 100, gap: 4 },
  swatch: { width: '100%', height: 48, borderRadius: 8 },
  swatchLabel: { fontSize: 11 },
  spacingRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, flexWrap: 'wrap' },
  spacingItem: { alignItems: 'center', gap: 4 },
  caption: { fontSize: 11 },
  comingSoon: { marginTop: 24, textAlign: 'center' },
});
