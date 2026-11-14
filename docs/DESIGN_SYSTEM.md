# DESIGN SYSTEM — عازب | AZIB

> **Stub.** This file is being filled across Parts 1–7 of Phase P04.
> Full content (usage rules, do/don't, tier matrix) is finalized in Part 7.

## Status by Part

| Part | Content | Status |
|------|---------|--------|
| 1 | Tokens, ThemeProvider, hooks, contrast utility | **Done** |
| 2 | Icon, Text, Screen, Button | **Done** |
| 3a | Field, TextInput, Textarea, Search, Switch, Checkbox, Radio, Chip, PhoneInput | **Done** |
| 3b | Select, OTPInput, DatePicker | **Done** |
| 4a | Toast, Banner, Badge, Card | **Done** |
| 4b | Dialog, BottomSheet, Tabs, SegmentedControl | **Done** |
| 5a | ArchHero, QamariyaPattern, GlowView, GlassView | **Done** |
| 5b | DoubleRingLoader, DoubleRingSuccess, Hero3D | **Done** |
| 6a | Divider, SectionHeader, Skeleton, ProgressBar, Avatar | **Done** |
| 6b | ListItem, Stepper, RingProgress, EmptyState, ErrorState, NotConnectedState | **Done** |
| 7 | Full rules & closing | Pending |
## Tokens (Part 1 — done)

- **Colors:** palette + semantic tokens in `src/theme/colors.ts`. WCAG AA pairs are tested in `src/theme/__tests__/contrast.test.ts`.
- **Typography:** IBM Plex Sans Arabic (body) + Cairo (display), letter-spacing 0. See `src/theme/typography.ts`.
- **Spacing:** 4pt scale. Min touch target 44dp.
- **Radius:** xs 4 → xl 24 → full 9999.
- **Shadows:** sm/md/lg (elevation for Android). **Glows:** purple/gold via shadowColor — disable on Tier low.
- **Motion:** durations 90/160/240/360/560, easings (standard/decelerate/accelerate), springs (gentle/bouncy). All durations honored via `useMotion().duration(ms)`.

## Hooks (Part 1 — done)

- `useDeviceTier()` → `{ tier, isHigh, isMid, isLow }` + `useDeviceTierStore.setOverride()` for the Gallery.
- `useMotion()` → `{ reduceMotion, enabled, duration(ms) }` — respects Reduce Motion.
- `useHaptics()` → `{ enabled, setEnabled, light, medium, success, error }`.
- `useDirection()` → `{ isRTL, direction }` from current i18n language.

## Rules

- One glow per screen maximum (two only for ceremonial hero).
- Glass surfaces only on Dock and Sheet (Part 5).
- Small purple text on dark backgrounds uses `text.accent` (#9B5CFF) on canvas/surface, and `text.accentOnRaised` (#B88AFF) on raised cards. Never `#7136C9` for small text.
- Buttons on `accent.fill` (purple) use `text.primary` (white). Buttons on `gold.fill` (mustard) use `text.inverse` (dark).
- Tier low disables glows, shadows, parallax.

## Components (Part 2 — done)

### `<Icon>`

Wraps `lucide-react-native` (ISC). 39 curated icons in `src/components/ui/icons.ts`.

```tsx
<Icon name="check" size={20} color={theme.colors.text.primary} />
<Icon name="arrowRight" /> {/* mirrors automatically in RTL */}
<Icon name="arrowRight" mirrorInRTL={false} /> {/* opt out */}
```

### `<Text>`

Typography-aware text. Renders children OR `i18nKey` (mutually exclusive; i18nKey wins).

```tsx
<Text variant="h1">Title</Text>
<Text variant="body" color="accent">Highlighted</Text>
<Text i18nKey="appName" />
<Text variant="caption" color="secondary" align="center">Centered</Text>
```

### `<Screen>`

Safe-area container with theme background. Uses logical padding (`paddingStart`/`paddingEnd`).

```tsx
<Screen scroll>
  <Text variant="h1">Home</Text>
</Screen>

<Screen safeTop={false} paddingX={false}>
  {/* Full-bleed content */}
</Screen>
```

### `<Button>`

Six variants × six states. Min height 44dp. Haptics on press (opt-out via `haptic={false}` — not yet exposed; will be added in Part 6 if needed).

| Variant | Background | Text | Glow |
|---------|------------|------|------|
| primary | accent.fill (purple) | text.primary (white) | On (high/mid tier) |
| secondary | bg.raised | text.primary | No |
| ghost | transparent | text.primary | No |
| gold | gold.fill (mustard) | text.inverse (dark) | On (high/mid tier) |
| danger | state.danger | text.primary | No |
| icon | bg.raised | — | No |

States: `default`, `pressed` (opacity 0.85), `disabled` (opacity 0.45), `loading` (spinner + `busy` a11y state), `error` (danger border), `focus` (accent border on web).

```tsx
<Button variant="primary" label="Confirm" onPress={handle} />
<Button variant="gold" i18nKey="buttons.continue" size="lg" fullWidth />
<Button variant="icon" leftIcon="check" accessibilityLabel="Confirm" />
<Button label="Saving" loading />
```

## Components (Part 3a — done)

### `<Field>`
Wrapper for form inputs. Provides label, required asterisk, help text, and error text. Error text overrides help text.

```tsx
<Field label="Email" required helpText="We'll never share your email.">
  <TextInput placeholder="you@example.com" />
</Field>
```

### `<TextInput>`

Text input with 3 sizes (sm, md, lg), left/right icons, focus/error states, and RTL support. Numeric inputs remain LTR.

```tsx
<TextInput label="Full Name" placeholder="Enter your name" leftIcon="user" />
<TextInput label="Phone" keyboardType="phone-pad" />
<TextInput label="Email" errorText="Invalid email format" />
```

### `<Textarea>`

Multiline text input. Extends TextInput with multiline and a minHeight prop (default 96).

```tsx
<Textarea label="Notes" placeholder="Write your message here..." minHeight={120} />
```

### `<Search>`

Pre-configured TextInput with a search icon and an optional clear button when text is present.

```tsx
<Search value={query} onChangeText={setQuery} onClear={() => setQuery('')} placeholder="Search..." />
```

### `<Switch>`

Animated toggle switch. RTL-aware. Respects Reduce Motion.

```tsx
<Switch label="Enable Notifications" value={enabled} onValueChange={setEnabled} />
```

### `<Checkbox>`

Standard checkbox with support for indeterminate state. Includes label and haptics.

```tsx
<Checkbox label="I agree to the terms" checked={agreed} onCheckedChange={setAgreed} />
<Checkbox label="Select All" indeterminate checked={false} onCheckedChange={handleSelectAll} />
```

### `<RadioGroup>`

Generic radio group (RadioGroup<V extends string>). Supports column or row layout.

```tsx
<RadioGroup
  options={[
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
  ]}
  value={gender}
  onValueChange={setGender}
/>
```

### `<Chip>`

Small interactive tag. Can be static or pressable. Supports default, accent, and gold variants.

```tsx
<Chip label="Filter" selected={true} onPress={toggleFilter} />
<Chip label="New" variant="accent" />
```

### `<PhoneInput>`

Yemen-specific phone input with a fixed +967 prefix and numeric-only input. (Multi-country picker planned for P06).

```tsx
<PhoneInput label="Phone Number" value={phone} onChangeText={setPhone} />
```

## Form — Advanced (Part 3b)

### `<Select>`

Single-choice picker. Uses `Modal` from RN (not BottomSheet — that lands in Part 4).

```tsx
<Select
  value={city}
  onChange={setCity}
  placeholder="Choose a city"
  options={[
    { value: 'sanaa', label: 'Sanaa' },
    { value: 'aden', label: 'Aden' },
    { value: 'hodeidah', label: 'Hodeidah', disabled: true },
  ]}
/>
```

- Auto-disables when `options.length === 0`.
- Modal centered, scrollable, RTL-aware.
- Accessibility: trigger has `accessibilityState.expanded`; each option has `menuitem` role.

### `<OTPInput>`

N-digit code. Uses a single hidden `TextInput` overlaying visual cells.

- Paste works (multi-digit).
- iOS `textContentType="oneTimeCode"` and Android `autoComplete="sms-otp"` auto-fill.
- Backspace & cursor behave naturally.
- One accessibility target (screen readers announce "verification code, N digits").

```tsx
<OTPInput
  label="Verification code"
  value={otp}
  onChangeText={setOtp}
  onComplete={(code) => verify(code)}
/>
```

### `<DatePicker>`

Custom calendar modal (no external date picker). Works identically on iOS/Android/Web.

- Month navigation, weekday headers (`Intl.DateTimeFormat`).
- Today highlight, selected day highlight.
- `minDate` / `maxDate` respected.
- Clear / Today actions.
- RTL-aware (grid reversed, chevrons mirrored).

```tsx
<DatePicker
  label="Wedding date"
  value={date}
  onChange={setDate}
  minDate={new Date()}
/>
```
## Feedback & Display (Part 4a)

### `<ToastProvider>` + `useToast()`

Global toast provider. Wrap the app once at `app/_layout.tsx`.

```tsx
const toast = useToast();
toast.show({ message: t('saved'), variant: 'success' });
toast.show({ message: 'Error!', variant: 'error', duration: 5000 });
toast.show({ message: 'Stays until dismissed', duration: 0 });
```

- Renders at the top safe area.
- One toast at a time (new replaces old).
- Auto-dismiss after `duration` (default 3000). `0` disables.
- `accessibilityRole="alert"` + `accessibilityLiveRegion="polite"`.
- Dismiss button (X) in all toasts.

### `<Banner>`

Inline message block. Four variants: `info` (default), `demo` (gold/attention), `warning`, `error`.

```tsx
<Banner title="Note" message="Welcome back" onDismiss={() => {}} />
<Banner variant="demo" message="This data is for demonstration only." onDismiss={() => {}} />
<Banner variant="error" message="Could not save." actionLabel="Retry" onAction={retry} />
```

### `<Badge>`

Small pill. Nine variants: `neutral`, `accent`, `success`, `warning`, `danger`, `info` (raw) + `verified`, `pending`, `demo` (presets with icons).

```tsx
<Badge label="Verified" variant="verified" />
<Badge label="Draft" />
<Badge label="Demo" variant="demo" size="sm" />
```

### `<Card>`

Four variants:
- `flat` (default): surface + subtle border.
- `crest`: gold top accent — reserved for hero content.
- `pressable`: flat + haptic + press feedback.
- `stat`: title + big value + optional icon/caption.

```tsx
<Card><Text>Flat content</Text></Card>
<Card variant="crest"><Text>Hero</Text></Card>
<Card variant="pressable" onPress={open} accessibilityLabel="Open">…</Card>
<Card variant="stat" title="Total donations" value={1250} leftIcon="wallet" />
```
## Feedback & Overlay (Part 4b)

### `<Dialog>`

Modal centered dialog with backdrop. Do not open a Dialog and a BottomSheet simultaneously — iOS Modal stacking is fragile.

```tsx
<Dialog
  visible={open}
  onClose={() => setOpen(false)}
  title="Delete account?"
  description="This action cannot be undone."
>
  <View style={{ flexDirection: 'row', gap: 8 }}>
    <Button variant="ghost" label="Cancel" onPress={cancel} />
    <Button variant="danger" label="Delete" onPress={confirm} />
  </View>
</Dialog>
```

- `dismissOnBackdrop` default true; `showCloseButton` default true.
- `accessibilityViewIsModal` on surface.
- Fade + scale animation, respects Reduce Motion.

### `<BottomSheet>`

Modal bottom sheet. Single snap (maxHeightPercent of screen, default 85). Drag down to dismiss (threshold 100px or vy > 0.5). Do not open simultaneously with a Dialog.

```tsx
<BottomSheet visible={open} onClose={() => setOpen(false)}>
  <Text variant="h2">Sheet content</Text>
</BottomSheet>
```

- `dismissOnBackdrop` default true; `showHandle` default true.
- Uses `PanResponder` (not Reanimated) — kept simple and testable. Migration to Reanimated deferred until P20 if performance requires.

### `<Tabs>`

Tab header. Content rendering is the caller's responsibility.

```tsx
<Tabs
  tabs={[
    { key: 'overview', label: 'Overview' },
    { key: 'activity', label: 'Activity', badge: 3 },
    { key: 'settings', label: 'Settings' },
  ]}
  value={tab}
  onChange={setTab}
  variant="default" // or "pills"
/>
```

- `accessibilityRole="tablist"` + `role="tab"` per tab.
- Equal width via `flex: 1`. Scrollable tabs deferred to P07+.

### `<SegmentedControl>`

Material-style segmented control with animated indicator. Same role/state as Tabs.

```tsx
<SegmentedControl
  segments={[
    { value: 'all', label: 'All' },
    { value: 'active', label: 'Active' },
    { value: 'done', label: 'Done' },
  ]}
  value={filter}
  onChange={setFilter}
  size="md" // or "sm"
/>
```

- Indicator animates via `Animated.timing` (respects Reduce Motion).
- RTL-aware via `start: 0` + `translateX` flip.

## Brand Components (Part 5a)

### `<ArchHero>`

Islamic/Yemeni-style arch frame (mihrab silhouette). Uses `borderTopLeftRadius: 9999` (clamped to `width/2` by RN), producing a perfect semicircle top without SVG.

```tsx
<ArchHero width={240}>
  <Text variant="h2" color="gold">عازب</Text>
</ArchHero>

<ArchHero variant="outlined" width={200}>
  <Text>Outlined</Text>
</ArchHero>
```

- `width` is required (defines arch dimensions; height = `width * 4/3` via `aspectRatio`).
- Two variants: `filled` (surface bg) and `outlined` (transparent).
- Gold border by default; override via `borderColor`.
- Symmetric — RTL-agnostic.

### `<QamariyaPattern>`

Repeated geometric motif (interlocking rings + center dot). Echoes the AZIB brand identity. Uses SVG `<Pattern>` for efficiency.

```tsx
<View style={{ height: 200, position: 'relative' }}>
  <QamariyaPattern width={340} height={200} opacity={0.12} />
  <View>{/* foreground content */}</View>
</View>
```

- `color` default `#F0CA68` (soft gold).
- `opacity` default `0.06` — subtle.
- `pointerEvents="none"` — never intercepts touches.
- Unique SVG id per instance (no clashes).
- Tile size default 80dp.

### `<GlowView>`

Soft glow wrapper. **Disabled on Device Tier low** (ADR-0003). Uses `shadowColor`/`shadowRadius` on iOS, `elevation` on Android.

```tsx
<GlowView radius={20} intensity={0.5}>
  <Button label="Primary" />
</GlowView>
```

- `color`: `'accent'` (purple, default) or `'gold'`.
- `radius` default 20, `intensity` default 0.45.
- One glow per screen maximum per brief §7. Two only for ceremonial hero.

### `<GlassView>`

Glass blur surface via `expo-blur`. **Restricted to Dock and Sheet** per `AGENT_RULES`. Falls back to a semi-transparent surface on Tier low (blur disabled).

```tsx
<GlassView intensity={60} style={{ borderRadius: 24, padding: 16 }}>
  <Text>Dock content</Text>
</GlassView>
```

- `intensity` default 60, `tint` default `dark`.
- On Web, uses `backdrop-filter` (Chrome 76+, Safari 9+, Firefox 103+).
- On Android without GPU support (low-end), fallback engages automatically via `useDeviceTier`.

## Brand Motion (Part 5b)

### `<DoubleRingLoader>`

Two interlocking rings rotating continuously. Reanimated `withRepeat` driven.

```tsx
<DoubleRingLoader size={64} />
<DoubleRingLoader size={80} color={theme.colors.gold.fill} />
```

- Respects Reduce Motion (static when enabled).
- SVG stroke-dasharray for 70%/62% partial rings.
- `accessibilityRole="progressbar"` + label "loading".

### `<DoubleRingSuccess>`

One-shot success animation on mount.
- Phase 1 (0→0.6): rings visible, pulse in.
- Phase 2 (0.6→1): rings fade out, checkmark scales in.
- Respects Reduce Motion (jumps to final state: checkmark visible).

```tsx
<DoubleRingSuccess size={72} />
```

### `<Hero3D>`

Three-layer parallax hero (ADR-0003). Caller controls the `progress: SharedValue<number>` (0..1).

```tsx
const progress = useSharedValue(0);
useAnimatedScrollHandler((e) => { progress.value = e.contentOffset.y / 400; });

<Hero3D
  progress={progress}
  height={400}
  background={<QamariyaPattern width={400} height={400} opacity={0.15} />}
  midground={<View>{/* decorative layer */}</View>}
  foreground={<ArchHero width={220}>{/* title/CTA */}</ArchHero>}
/>
```

- Three layers with translateY rates: 12 / 36 / 72 dp per progress unit.
- Background scaled 1.08× to prevent edge gaps.
- Disabled on Tier low and Reduce Motion (layers flat).
- **One glow per screen maximum** per brief §7. Two only for ceremonial hero.

## Utility Components (Part 6a)

### `<Divider>`

Thin separator. Hidden from accessibility tree by default.

```tsx
<Divider />
<Divider inset />
<Divider color={theme.colors.accent.fill} thickness={2} />
<Divider orientation="vertical" />
```

- `orientation` default `horizontal`.
- `inset` for `paddingStart/End` margin.
- `accessibilityElementsHidden` — not announced by screen readers.

### `<SectionHeader>`

Section title + optional subtitle + optional action.

```tsx
<SectionHeader title="Recent" subtitle="Last 30 days" />
<SectionHeader title="Recent" actionLabel="See all" onAction={openAll} />
```

- Action chevron mirrors in RTL.
- `accessibilityRole="button"` on the action.

### `<Skeleton>`

Placeholder with shimmer (disabled on Tier low or Reduce Motion).

```tsx
<Skeleton variant="text" />
<Skeleton variant="circle" size={48} />  {/* actually width=height=48 by default */}
<Skeleton variant="rect" height={120} />
<Skeleton width={120} height={24} />
```

- `variant`: `'text'` (14dp height), `'circle'` (48×48), `'rect'` (default).
- Hidden from accessibility (`accessibilityElementsHidden`).
- Shimmer uses Reanimated opacity pulse (0.35 ↔ 0.85, 900ms).

### `<ProgressBar>`

Linear progress bar. Determinate (with `value`) or indeterminate (omit `value`).

```tsx
<ProgressBar value={0.42} showLabel />
<ProgressBar value={0.75} color="success" />
<ProgressBar size="sm" /> {/* indeterminate */}
```

- `size`: `sm` (4dp), `md` (8dp), `lg` (12dp).
- `color`: `accent`, `gold`, `success`, `danger`.
- `accessibilityRole="progressbar"` + `accessibilityValue` (determinate only).
- Indeterminate uses Reanimated opacity pulse (respects Reduce Motion).

### `<Avatar>`

Initials-based avatar (image support arrives in P06).

```tsx
<Avatar name="Ahmed Yemeni" size="md" />
<Avatar name="Fatima" size="lg" ring />
```

- Initials: first letter of first word + first letter of last word. Falls back to `?` for empty.
- `size`: `xs` (24), `sm` (32), `md` (44), `lg` (64), `xl` (96).
- `ring` → gold border.
- `accessibilityRole="image"` + `accessibilityLabel={name}`.

## Composite & State (Part 6b)

### `<ListItem>`

Row with leading/trailing content + title + subtitle. Interactive or static.

```tsx
<ListItem title="Account" subtitle="Manage" onPress={open} />
<ListItem title="Notifications" onPress={open} trailing={<Badge label="3" variant="accent" />} />
<ListItem title="Delete account" destructive onPress={confirm} />
<ListItem title="Info" subtitle="Read-only" />
```

- Variants: `default` (transparent) / `card` (surface + border).
- `onPress` → interactive (button role, haptic). `showChevron` defaults to true when `onPress` present and `trailing` absent.
- `destructive` → title in `state.danger`.
- Disabled → 45% opacity, ignores press.
- RTL: chevron mirrored automatically.

### `<Stepper>`

Horizontal multi-step progress. 3 states per step: completed / current / pending.

```tsx
<Stepper steps={['Account', 'Profile', 'Verify', 'Done']} currentStep={1} />
```

- `accessibilityRole="progressbar"` + `accessibilityValue`.
- RTL: flex direction reversed.
- Vertical variant planned for P14 if needed.

### `<RingProgress>`

Circular determinate progress. Echoes the DoubleRing brand motif.

```tsx
<RingProgress value={0.42} showLabel />
<RingProgress value={0.75} color={theme.colors.state.success} />
<RingProgress value={0.3} size={48} strokeWidth={4} />
```

- `value` clamped to 0..1.
- `size` (default 80), `strokeWidth` (default 6).
- `showLabel` renders center percent; `label` overrides text.
- Uses `react-native-svg` directly — no Reanimated in P04 (values snap). Smooth transitions when wired in P05+.
- Accessibility: `role="progressbar"` + `accessibilityValue`.

### `<EmptyState>`, `<ErrorState>`, `<NotConnectedState>`

Three canonical states, all built on an internal `<StateView>` base.

| Component | Tone | Default title | Actions |
|-----------|------|---------------|---------|
| EmptyState | neutral | `common.states.empty` | Primary + optional secondary |
| ErrorState | danger | `errors.unknown` | Retry (primary) + optional secondary |
| NotConnectedState | accent | `errors.notConnected` | Retry (primary) + optional secondary |

```tsx
<EmptyState
  title="No items yet"
  description="When you add items, they'll appear here."
  action={{ label: 'Add item', onPress: add }}
/>

<ErrorState onRetry={refetch} retrying={isFetching} />

<NotConnectedState
  title="Not connected"
  description="This feature will activate later."
  onRetry={retry}
/>
```

- `title`/`description` override the i18n defaults.
- `illustration` overrides the default icon circle (for custom visuals).
- `secondaryAction` accepts `{ label, onPress, variant? }`.
- **NotConnectedState vs NotConnectedScreen:** `NotConnectedState` is a composable block (inside a card / section). The P03 `NotConnectedScreen` remains for full-screen use in P05+.
