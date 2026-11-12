// Internal Design System Gallery. Grows in Parts 3–7.
// Route: /gallery (group (dev) does not appear in the URL).
// Arabic preview strings are intentionally wrapped with i18n-allow-arabic.

import { ScrollView, StyleSheet, View } from 'react-native';
import type { ReactNode } from 'react';

import { ALL_ICON_NAMES, Button, Icon, Screen, Text } from '@/components/ui';
import { useDeviceTier, useDeviceTierStore, useDirection } from '@/hooks';
import { setLanguage } from '@/i18n';
import { useTheme } from '@/theme';
import type { ButtonVariant, ButtonSize } from '@/components/ui';

export default function GalleryScreen() {
  const theme = useTheme();
  const { direction } = useDirection();
  const { tier } = useDeviceTier();
  const setOverride = useDeviceTierStore((s) => s.setOverride);

  return (
    <Screen scroll testID="gallery-screen">
      <View style={{ marginTop: theme.spacing[6], gap: theme.spacing[2] }}>
        <Text variant="h1">Gallery</Text>
        <Text variant="caption" color="secondary">
          dir: {direction} · tier: {tier}
        </Text>
      </View>

      <Section title="Dev overrides">
        <View style={styles.row}>
          {(['high', 'mid', 'low'] as const).map((t) => (
            <Button
              key={t}
              variant={tier === t ? 'primary' : 'secondary'}
              size="sm"
              label={t}
              onPress={() => setOverride(t)}
            />
          ))}
          <Button variant="ghost" size="sm" label="auto" onPress={() => setOverride(null)} />
        </View>
        <View style={styles.row}>
          <Button variant="secondary" size="sm" label="AR" onPress={() => void setLanguage('ar')} />
          <Button variant="secondary" size="sm" label="EN" onPress={() => void setLanguage('en')} />
        </View>
      </Section>

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
              <Text variant="caption" color="secondary">{name}</Text>
            </View>
          ))}
        </View>
      </Section>

      <Section title="Typography">
        {(
          ['display', 'h1', 'h2', 'h3', 'body', 'bodyStrong', 'caption', 'captionStrong'] as const
        ).map((k) => (
          <Text key={k} variant={k}>
            {/* i18n-allow-arabic */}
            {k} — عازب AZIB
          </Text>
        ))}
      </Section>

      <Section title="Spacing">
        <View style={styles.row}>
          {(['1', '2', '3', '4', '5', '6', '8', '10'] as const).map((k) => (
            <View key={k} style={{ alignItems: 'center', gap: 4 }}>
              <View
                style={{
                  width: theme.spacing[Number(k) as keyof typeof theme.spacing],
                  height: theme.spacing[Number(k) as keyof typeof theme.spacing],
                  backgroundColor: theme.colors.accent.fill,
                  borderRadius: theme.radius.xs,
                }}
              />
              <Text variant="caption" color="secondary">{k}</Text>
            </View>
          ))}
        </View>
      </Section>

      <Section title="Icons">
        <View style={styles.iconGrid}>
          {ALL_ICON_NAMES.map((name) => (
            <View key={name} style={styles.iconCell}>
              <Icon name={name} size={22} color={theme.colors.text.primary} />
              <Text variant="caption" color="secondary">{name}</Text>
            </View>
          ))}
        </View>
      </Section>

      <Section title="Text component">
        <Text variant="h3">Header 3</Text>
        <Text variant="body">Body text sample.</Text>
        <Text variant="body" color="accent">Accent body text.</Text>
        <Text variant="caption" color="secondary">Secondary caption.</Text>
        <Text variant="body" align="center">Centered paragraph.</Text>
      </Section>

      <Section title="Buttons — variants">
        <View style={styles.wrapRow}>
          {(
            ['primary', 'secondary', 'ghost', 'gold', 'danger'] as ButtonVariant[]
          ).map((v) => (
            <Button key={v} variant={v} label={v} />
          ))}
          <Button variant="icon" leftIcon="check" accessibilityLabel="confirm" />
        </View>
      </Section>

      <Section title="Buttons — sizes">
        <View style={styles.wrapRow}>
          {(['sm', 'md', 'lg'] as ButtonSize[]).map((s) => (
            <Button key={s} size={s} label={s.toUpperCase()} />
          ))}
        </View>
      </Section>

      <Section title="Buttons — states">
        <View style={styles.wrapRow}>
          <Button label="Default" />
          <Button label="Loading" loading />
          <Button label="Disabled" disabled />
          <Button label="Error" error />
          <Button label="With icon" leftIcon="check" />
          <Button label="Right icon" rightIcon="chevronRight" />
          <Button variant="secondary" label="Secondary error" error />
        </View>
        <Button label="Full width" fullWidth />
      </Section>

      <Text variant="caption" color="tertiary" align="center" style={{ marginTop: 24 }}>
        Components will be added in Parts 3–7.
      </Text>
    </Screen>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  const theme = useTheme();
  return (
    <View style={{ marginTop: theme.spacing[8], gap: theme.spacing[3] }}>
      <Text variant="h2">{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'flex-end' },
  wrapRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  swatchGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  swatchItem: { width: 100, gap: 4 },
  swatch: { width: '100%', height: 48, borderRadius: 8 },
  iconGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  iconCell: { width: 90, alignItems: 'center', gap: 4 },
});
