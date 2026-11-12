// Internal Design System Gallery. Grows in Parts 3b–7.
// Route: /gallery (group (dev) does not appear in the URL).
// Arabic preview strings are intentionally wrapped with i18n-allow-arabic.

import { useState, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import {
  ALL_ICON_NAMES,
  Button,
  Checkbox,
  Chip,
  Icon,
  PhoneInput,
  RadioGroup,
  Screen,
  Search,
  Switch,
  Text,
  Textarea,
  TextInput,
} from '@/components/ui';
import type { ButtonSize, ButtonVariant } from '@/components/ui';
import { useDeviceTier, useDeviceTierStore, useDirection } from '@/hooks';
import { setLanguage } from '@/i18n';
import { useTheme } from '@/theme';

export default function GalleryScreen() {
  return (
    <Screen scroll testID="gallery-screen">
      <ColorsAndTypography />
      <SpacingSection />
      <IconSection />
      <TextSection />
      <ButtonsSection />
      <FormsSection />
      <Text variant="caption" color="tertiary" align="center" style={{ marginTop: 24 }}>
        Parts 3b–7 will add Select, OTPInput, DatePicker, and more.
      </Text>
    </Screen>
  );
}

function DevOverrides() {
  const theme = useTheme();
  const { tier } = useDeviceTier();
  const setOverride = useDeviceTierStore((s) => s.setOverride);
  return (
    <View style={{ marginTop: theme.spacing[6], gap: theme.spacing[2] }}>
      <Text variant="h1">Gallery</Text>
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
    </View>
  );
}

function ColorsAndTypography() {
  const theme = useTheme();
  const { direction } = useDirection();
  const { tier } = useDeviceTier();
  return (
    <>
      <DevOverrides />
      <Text variant="caption" color="secondary" style={{ marginTop: 8 }}>
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
              <Text variant="caption" color="secondary">
                {name}
              </Text>
            </View>
          ))}
        </View>
      </Section>
    </>
  );
}

function SpacingSection() {
  const theme = useTheme();
  return (
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
            <Text variant="caption" color="secondary">
              {k}
            </Text>
          </View>
        ))}
      </View>
    </Section>
  );
}

function IconSection() {
  const theme = useTheme();
  return (
    <Section title="Icons">
      <View style={styles.iconGrid}>
        {ALL_ICON_NAMES.map((name) => (
          <View key={name} style={styles.iconCell}>
            <Icon name={name} size={22} color={theme.colors.text.primary} />
            <Text variant="caption" color="secondary">
              {name}
            </Text>
          </View>
        ))}
      </View>
    </Section>
  );
}

function TextSection() {
  return (
    <Section title="Typography">
      {(
        ['display', 'h1', 'h2', 'h3', 'body', 'bodyStrong', 'caption', 'captionStrong'] as const
      ).map((k) => (
        <Text key={k} variant={k}>
          {k} — عازب AZIB {/* i18n-allow-arabic */}
        </Text>
      ))}
    </Section>
  );
}

function ButtonsSection() {
  return (
    <>
      <Section title="Buttons — variants">
        <View style={styles.row}>
          {(['primary', 'secondary', 'ghost', 'gold', 'danger'] as ButtonVariant[]).map((v) => (
            <Button key={v} variant={v} label={v} />
          ))}
          <Button variant="icon" leftIcon="check" accessibilityLabel="confirm" />
        </View>
      </Section>
      <Section title="Buttons — sizes">
        <View style={styles.row}>
          {(['sm', 'md', 'lg'] as ButtonSize[]).map((s) => (
            <Button key={s} size={s} label={s.toUpperCase()} />
          ))}
        </View>
      </Section>
      <Section title="Buttons — states">
        <View style={styles.row}>
          <Button label="Default" />
          <Button label="Loading" loading />
          <Button label="Disabled" disabled />
          <Button label="Error" error />
          <Button label="With icon" leftIcon="check" />
          <Button label="Right icon" rightIcon="chevronRight" />
        </View>
        <Button label="Full width" fullWidth />
      </Section>
    </>
  );
}

function FormsSection() {
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | null>(null);
  const [agree, setAgree] = useState(false);
  const [notify, setNotify] = useState(true);
  const [search, setSearch] = useState('');

  return (
    <>
      <Section title="Form — TextInput">
        <TextInput label="Empty" placeholder="Type something" />
        <TextInput label="Filled" defaultValue="Hello" />
        <TextInput label="With icon" leftIcon="user" placeholder="Your name" />
        <TextInput label="Error" errorText="This field is required" />
        <TextInput label="Disabled" disabled defaultValue="Read only" />
        <TextInput label="Password" secureTextEntry placeholder="••••••••" />
      </Section>

      <Section title="Form — Textarea & Search">
        <Textarea label="Notes" placeholder="Write here..." />
        <Search
          value={search}
          onChangeText={setSearch}
          onClear={() => setSearch('')}
          placeholder="Search..."
        />
      </Section>

      <Section title="Form — PhoneInput">
        <PhoneInput label="Phone" value={phone} onChangeText={setPhone} />
      </Section>

      <Section title="Form — Switch">
        <Switch value={notify} onValueChange={setNotify} label="Notifications" />
        <Switch value={false} onValueChange={() => {}} label="Disabled" disabled />
        <Switch value={true} onValueChange={() => {}} label="Small" size="sm" />
      </Section>

      <Section title="Form — Checkbox">
        <Checkbox checked={agree} onCheckedChange={setAgree} label="I agree to terms" />
        <Checkbox checked={true} onCheckedChange={() => {}} label="Checked" />
        <Checkbox checked={false} indeterminate onCheckedChange={() => {}} label="Indeterminate" />
        <Checkbox checked={false} onCheckedChange={() => {}} label="Disabled" disabled />
      </Section>

      <Section title="Form — Radio">
        <RadioGroup
          options={[
            { value: 'male' as const, label: 'Male' },
            { value: 'female' as const, label: 'Female' },
          ]}
          value={gender}
          onValueChange={setGender}
        />
      </Section>

      <Section title="Form — Chip">
        <View style={styles.row}>
          <Chip label="Static" />
          <Chip label="Selectable" onPress={() => {}} selected />
          <Chip label="Not selected" onPress={() => {}} />
          <Chip label="Accent" variant="accent" />
          <Chip label="Gold" variant="gold" />
          <Chip label="With icon" leftIcon="check" onPress={() => {}} />
          <Chip label="Disabled" disabled onPress={() => {}} />
        </View>
      </Section>
    </>
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
  swatchGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  swatchItem: { width: 100, gap: 4 },
  swatch: { width: '100%', height: 48, borderRadius: 8 },
  iconGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  iconCell: { width: 90, alignItems: 'center', gap: 4 },
});
