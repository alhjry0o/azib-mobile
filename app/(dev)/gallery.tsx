// Internal Design System Gallery. Grows in Parts 4–7.
// Route: /gallery (group (dev) does not appear in the URL).
// Arabic preview strings are intentionally wrapped with i18n-allow-arabic.

import { useState, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import {
  ALL_ICON_NAMES,
  Badge,
  Banner,
  BottomSheet,
  Button,
  Card,
  Checkbox,
  Chip,
  DatePicker,
  Dialog,
  Icon,
  OTPInput,
  PhoneInput,
  RadioGroup,
  Screen,
  Search,
  SegmentedControl,
  Select,
  Switch,
  Tabs,
  Text,
  Textarea,
  TextInput,
  useToast,
  Avatar,
  Divider,
  ProgressBar,
  SectionHeader,
  Skeleton,
} from '@/components/ui';

import {
  ArchHero,
  DoubleRingLoader,
  DoubleRingSuccess,
  GlassView,
  GlowView,
  Hero3D,
  QamariyaPattern,
} from '@/components/brand';
import { useSharedValue } from 'react-native-reanimated';
import type { ButtonSize, ButtonVariant } from '@/components/ui';
import { useDeviceTier, useDeviceTierStore, useDirection } from '@/hooks';
import { setLanguage } from '@/i18n';
import { useTheme } from '@/theme';

export default function GalleryScreen() {
  return (
    <Screen scroll testID="gallery-screen">
      <DevOverrides />
      <ColorsSection />
      <SpacingSection />
      <IconSection />
      <TextSection />
      <ButtonsSection />
      <FormsBaseSection />
      <FormsAdvancedSection />
      <FeedbackSection />
      <DisplaySection />
      <OverlaysSection />
      <NavSection />
      <BrandSection />
      <BrandMotionSection />
      <UtilitySection />
      <Text variant="caption" color="tertiary" align="center" style={{ marginTop: 24 }}>
        Part 7 will finalize docs/DESIGN_SYSTEM.md.
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

function ColorsSection() {
  const theme = useTheme();
  const { direction } = useDirection();
  const { tier } = useDeviceTier();
  return (
    <>
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

function FormsBaseSection() {
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

function FormsAdvancedSection() {
  const [city, setCity] = useState<'sanaa' | 'aden' | 'taiz' | 'hodeidah' | null>(null);
  const [otp, setOtp] = useState('');
  const [date, setDate] = useState<Date | null>(null);

  return (
    <>
      <Section title="Form — Select">
        <Select
          value={city}
          onChange={setCity}
          placeholder="Choose a city"
          options={[
            { value: 'sanaa' as const, label: 'Sanaa' },
            { value: 'aden' as const, label: 'Aden' },
            { value: 'taiz' as const, label: 'Taiz' },
            { value: 'hodeidah' as const, label: 'Hodeidah (disabled)', disabled: true },
          ]}
        />
      </Section>

      <Section title="Form — OTPInput">
        <OTPInput
          label="Verification code"
          value={otp}
          onChangeText={setOtp}
          onComplete={() => {}}
          helpText="Enter the 6-digit code we sent you"
        />
        <Text variant="caption" color="secondary">
          current: {otp || '—'}
        </Text>
      </Section>

      <Section title="Form — DatePicker">
        <DatePicker label="Wedding date" value={date} onChange={setDate} placeholder="Pick a date" />
      </Section>
    </>
  );
}

function FeedbackSection() {
  const toast = useToast();
  return (
    <Section title="Feedback — Toast">
      <View style={styles.row}>
        <Button
          label="Success"
          onPress={() => toast.show({ message: 'Saved', variant: 'success', duration: 2500 })}
        />
        <Button
          label="Error"
          variant="danger"
          onPress={() => toast.show({ message: 'Something went wrong', variant: 'error' })}
        />
        <Button
          label="Info"
          variant="secondary"
          onPress={() => toast.show({ message: 'FYI', variant: 'info' })}
        />
        <Button
          label="Warning"
          variant="secondary"
          onPress={() => toast.show({ message: 'Careful', variant: 'warning' })}
        />
      </View>

      <Text variant="h3" style={{ marginTop: 12 }}>
        Banner — info
      </Text>
      <Banner
        title="Heads up"
        message="This is an informational banner."
        actionLabel="Learn more"
        onAction={() => {}}
        onDismiss={() => {}}
      />
      <Text variant="h3" style={{ marginTop: 12 }}>
        Banner — demo
      </Text>
      <Banner variant="demo" message="This data is for demonstration only." onDismiss={() => {}} />
      <Text variant="h3" style={{ marginTop: 12 }}>
        Banner — warning
      </Text>
      <Banner variant="warning" message="Something needs your attention." />
      <Text variant="h3" style={{ marginTop: 12 }}>
        Banner — error
      </Text>
      <Banner variant="error" title="Failed" message="Could not reach the server." actionLabel="Retry" onAction={() => {}} />
    </Section>
  );
}

function DisplaySection() {
  return (
    <>
      <Section title="Badge">
        <View style={styles.row}>
          <Badge label="Neutral" />
          <Badge label="Accent" variant="accent" />
          <Badge label="Success" variant="success" />
          <Badge label="Warning" variant="warning" />
          <Badge label="Danger" variant="danger" />
          <Badge label="Info" variant="info" />
          <Badge label="Verified" variant="verified" />
          <Badge label="Pending" variant="pending" />
          <Badge label="Demo" variant="demo" />
          <Badge label="Small" size="sm" variant="accent" />
        </View>
      </Section>

      <Section title="Card">
        <Card>
          <Text variant="h3">Flat card</Text>
          <Text variant="body" color="secondary">
            Default card with subtle border.
          </Text>
        </Card>
        <Card variant="crest">
          <Text variant="h3" color="gold">
            Crest card
          </Text>
          <Text variant="body" color="secondary">
            Hero card with gold top accent.
          </Text>
        </Card>
        <Card variant="pressable" onPress={() => {}} accessibilityLabel="open details">
          <Text variant="bodyStrong">Pressable card</Text>
          <Text variant="caption" color="secondary">
            Tap to open
          </Text>
        </Card>
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Card variant="stat" title="Total donations" value={1250} leftIcon="wallet" />
          </View>
          <View style={{ flex: 1 }}>
            <Card variant="stat" title="Applications" value="42" caption="this month" leftIcon="users" />
          </View>
        </View>
      </Section>
    </>
  );
}

function OverlaysSection() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  return (
    <>
      <Section title="Overlays — Dialog">
        <Button label="Open dialog" onPress={() => setDialogOpen(true)} />
        <Dialog
          visible={dialogOpen}
          onClose={() => setDialogOpen(false)}
          title="Delete account?"
          description="This action cannot be undone."
          testID="gal-dialog"
        >
          <View style={styles.row}>
            <Button variant="ghost" label="Cancel" onPress={() => setDialogOpen(false)} />
            <Button variant="danger" label="Delete" onPress={() => setDialogOpen(false)} />
          </View>
        </Dialog>
      </Section>

      <Section title="Overlays — BottomSheet">
        <Button label="Open sheet" onPress={() => setSheetOpen(true)} />
        <BottomSheet
          visible={sheetOpen}
          onClose={() => setSheetOpen(false)}
          testID="gal-sheet"
        >
          <Text variant="h2" style={{ marginBottom: 12 }}>
            Sheet content
          </Text>
          <Text variant="body" color="secondary" style={{ marginBottom: 16 }}>
            Drag down or tap backdrop to dismiss.
          </Text>
          <Button label="Close" variant="secondary" onPress={() => setSheetOpen(false)} />
        </BottomSheet>
      </Section>
    </>
  );
}

function NavSection() {
  const [tab, setTab] = useState<'overview' | 'activity' | 'settings'>('overview');
  const [filter, setFilter] = useState<'all' | 'active' | 'done'>('all');
  return (
    <>
      <Section title="Navigation — Tabs (default)">
        <Tabs
          tabs={[
            { key: 'overview' as const, label: 'Overview' },
            { key: 'activity' as const, label: 'Activity', badge: 3 },
            { key: 'settings' as const, label: 'Settings' },
          ]}
          value={tab}
          onChange={setTab}
        />
        <Text variant="body" color="secondary">
          Content for: {tab}
        </Text>
      </Section>

      <Section title="Navigation — Tabs (pills)">
        <Tabs
          variant="pills"
          tabs={[
            { key: 'overview' as const, label: 'Overview' },
            { key: 'activity' as const, label: 'Activity' },
            { key: 'settings' as const, label: 'Settings' },
          ]}
          value={tab}
          onChange={setTab}
        />
      </Section>

      <Section title="Navigation — SegmentedControl">
        <SegmentedControl
          segments={[
            { value: 'all' as const, label: 'All' },
            { value: 'active' as const, label: 'Active' },
            { value: 'done' as const, label: 'Done' },
          ]}
          value={filter}
          onChange={setFilter}
        />
        <SegmentedControl
          segments={[
            { value: 'all' as const, label: 'All' },
            { value: 'active' as const, label: 'Active' },
            { value: 'done' as const, label: 'Done' },
          ]}
          value={filter}
          onChange={setFilter}
          size="sm"
        />
        <Text variant="caption" color="secondary">
          Filter: {filter}
        </Text>
      </Section>
    </>
  );
}

function BrandSection() {
  const theme = useTheme();
  return (
    <>
      <Section title="Brand — ArchHero">
        <View style={{ alignItems: 'center' }}>
          <ArchHero width={240}>
            <Text variant="h2" color="gold" align="center">
              عازب {/* i18n-allow-arabic */}
            </Text>
            <Text variant="caption" color="secondary" align="center" style={{ marginTop: 4 }}>
              AZIB
            </Text>
          </ArchHero>
        </View>
        <View style={{ alignItems: 'center', marginTop: 12 }}>
          <ArchHero variant="outlined" width={200}>
            <Text variant="bodyStrong" color="primary" align="center">
              Outlined
            </Text>
          </ArchHero>
        </View>
      </Section>

      <Section title="Brand — QamariyaPattern">
        <View
          style={{
            height: 200,
            backgroundColor: theme.colors.bg.surface,
            borderRadius: theme.radius.lg,
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <QamariyaPattern width={340} height={200} opacity={0.12} />
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text variant="h2" color="gold">
              Qamariya
            </Text>
          </View>
        </View>
      </Section>

      <Section title="Brand — GlowView">
        <View style={styles.row}>
          <GlowView radius={20} intensity={0.5}>
            <Button label="Primary glow" />
          </GlowView>
          <GlowView color="gold" radius={20} intensity={0.55}>
            <Button variant="gold" label="Gold glow" />
          </GlowView>
        </View>
      </Section>

      <Section title="Brand — GlassView">
        <View style={{ alignItems: 'stretch' }}>
          <GlassView
            intensity={60}
            style={{
              height: 100,
              borderRadius: theme.radius.xl,
              padding: 16,
              justifyContent: 'center',
            }}
          >
            <Text variant="bodyStrong" color="primary">
              Glass surface
            </Text>
            <Text variant="caption" color="secondary">
              Dock / Sheet only per AGENT_RULES.
            </Text>
          </GlassView>
        </View>
      </Section>
    </>
  );
}

function BrandMotionSection() {
  const theme = useTheme();
  const progress = useSharedValue(0);
  return (
    <>
      <Section title="Brand — DoubleRingLoader">
        <View style={styles.row}>
          <DoubleRingLoader size={48} />
          <DoubleRingLoader size={64} />
          <DoubleRingLoader size={80} color={theme.colors.gold.fill} />
        </View>
      </Section>

      <Section title="Brand — DoubleRingSuccess">
        <View style={styles.row}>
          <DoubleRingSuccess size={56} />
          <DoubleRingSuccess size={72} />
          <DoubleRingSuccess size={88} color={theme.colors.text.accent} />
        </View>
      </Section>

      <Section title="Brand — Hero3D (progress-driven parallax)">
        <View style={styles.row}>
          <Button
            size="sm"
            variant="secondary"
            label="0%"
            onPress={() => {
              progress.value = 0;
            }}
          />
          <Button
            size="sm"
            variant="secondary"
            label="50%"
            onPress={() => {
              // eslint-disable-next-line react-hooks/immutability
              progress.value = 0.5;
            }}
          />
          <Button
            size="sm"
            variant="secondary"
            label="100%"
            onPress={() => {
              // eslint-disable-next-line react-hooks/immutability
              progress.value = 1;
            }}
          />
        </View>
        <Hero3D
          progress={progress}
          height={320}
          background={
            <View style={StyleSheet.absoluteFill}>
              <View
                style={{
                  ...StyleSheet.absoluteFill,
                  backgroundColor: theme.colors.bg.surface,
                }}
              />
              <QamariyaPattern width={400} height={320} opacity={0.15} />
            </View>
          }
          midground={
            <View style={styles.row} pointerEvents="none">
              <View
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  backgroundColor: theme.colors.accent.fill,
                  opacity: 0.4,
                }}
              />
              <View
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 30,
                  backgroundColor: theme.colors.gold.fill,
                  opacity: 0.4,
                }}
              />
            </View>
          }
          foreground={
            <ArchHero width={200} variant="outlined">
              <Text variant="h2" color="gold" align="center">
                عازب {/* i18n-allow-arabic */}
              </Text>
            </ArchHero>
          }
        />
      </Section>
    </>
  );
}

function UtilitySection() {
  const theme = useTheme();
  return (
    <>
      <Section title="Utility — Divider">
        <Text variant="body">Above</Text>
        <Divider />
        <Text variant="body">Below</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', height: 40 }}>
          <Text variant="body">Left</Text>
          <Divider orientation="vertical" />
          <Text variant="body">Right</Text>
        </View>
        <Text variant="caption" color="secondary">
          Custom color:
        </Text>
        <Divider color={theme.colors.accent.fill} thickness={2} />
      </Section>

      <Section title="Utility — SectionHeader">
        <SectionHeader title="Recent" subtitle="Last 30 days" />
        <SectionHeader
          title="Recent"
          actionLabel="See all"
          onAction={() => {}}
        />
        <SectionHeader
          title="Notifications"
          subtitle="You have 3 unread"
          actionLabel="Mark read"
          onAction={() => {}}
        />
      </Section>

      <Section title="Utility — Skeleton">
        <Skeleton variant="text" />
        <Skeleton variant="text" width="60%" />
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <Skeleton variant="circle" />
          <View style={{ flex: 1, gap: 8 }}>
            <Skeleton variant="text" width="80%" />
            <Skeleton variant="text" width="60%" />
          </View>
        </View>
        <Skeleton variant="rect" height={120} />
      </Section>

      <Section title="Utility — ProgressBar">
        <ProgressBar value={0.25} />
        <ProgressBar value={0.5} showLabel />
        <ProgressBar value={0.75} color="success" showLabel />
        <ProgressBar value={0.9} color="gold" showLabel />
        <ProgressBar color="danger" />
        <Text variant="caption" color="secondary">
          Sizes:
        </Text>
        <ProgressBar value={0.4} size="sm" />
        <ProgressBar value={0.4} size="md" />
        <ProgressBar value={0.4} size="lg" />
      </Section>

      <Section title="Utility — Avatar">
        <View style={styles.row}>
          <Avatar name="Ahmed Yemeni" size="xs" />
          <Avatar name="Fatima Sanaa" size="sm" />
          <Avatar name="Khalid" size="md" />
          <Avatar name="Samira Taiz" size="lg" />
          <Avatar name="Yemen Family" size="xl" />
        </View>
        <View style={styles.row}>
          <Avatar name="Ahmed Yemeni" size="md" ring />
          <Avatar name="Fatima Sanaa" size="lg" ring />
          <Avatar name="Test" size="md" ring />
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
