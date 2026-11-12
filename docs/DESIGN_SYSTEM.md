# DESIGN SYSTEM — عازب | AZIB

> **Stub.** This file is being filled across Parts 1–7 of Phase P04.
> Full content (usage rules, do/don't, tier matrix) is finalized in Part 7.

## Status by Part

| Part | Content | Status |
|------|---------|--------|
| 1 | Tokens, ThemeProvider, hooks, contrast utility | **Done** |
| 2 | Icon, Text, Screen, Button | **Done** |
| 3a | Field, TextInput, Textarea, Search, Switch, Checkbox, Radio, Chip, PhoneInput | **Done** |
| 3b | Select, OTPInput, DatePicker | Pending |
| 4 | Feedback & Overlay | Pending |
| 5 | Brand + 3D | Pending |
| 6 | Utility | Pending |
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

```
