# DESIGN SYSTEM — عازب | AZIB

> **النسخة النهائية — P04 مغلقة.**
> يوافق كل قرار في هذا المستند ما هو مُنفَّذ في الكود. أي تعديل يستدعي تحديث هذا الملف.
> **عام المستودع:** لا أسرار، لا بيانات شخصية.

---

## 1) Foundations

### 1.1 Colors

Palette and semantic tokens live in `src/theme/colors.ts`. All required semantic pairs pass WCAG AA (4.5:1) — verified by `src/theme/__tests__/contrast.test.ts` (17 pairs).

| Token | Value | Notes |
|-------|-------|-------|
| `bg.canvas` | `#09080F` | Royal Black |
| `bg.surface` | `#100D19` | Inputs, standard card bg |
| `bg.raised` | `#1E1832` | Modal surface, disabled track |
| `bg.overlay` | `rgba(9,8,15,0.72)` | Modal backdrops |
| `border.subtle` | `rgba(255,255,255,0.08)` | Standard borders |
| `border.strong` | `rgba(255,255,255,0.16)` | Emphasized borders |
| `text.primary` | `#FFFFFF` | Body text |
| `text.secondary` | `#A7A2B3` | Labels, captions |
| `text.tertiary` | `#6B6776` | Only for large text (≥18pt) or decorative |
| `text.inverse` | `#09080F` | Text on gold surfaces |
| `text.accent` | `#9B5CFF` | Purple text on **canvas/surface only** |
| `text.accentOnRaised` | `#B88AFF` | Purple text on **raised cards** |
| `text.gold` | `#F0CA68` | Brand gold text |
| `accent.fill` | `#7136C9` | Primary button bg |
| `accent.fillPressed` | `#5B2AA5` | Primary press state |
| `accent.glow` | `rgba(155,92,255,0.45)` | Glow shadow color |
| `gold.fill` | `#D9A928` | Gold button / banner / crest |
| `gold.glow` | `rgba(240,202,104,0.45)` | Gold glow color |
| `state.success` | `#3FCF8E` | |
| `state.danger` | `#FF5C7A` | |
| `state.info` | `#5CA8FF` | |

**Documented exceptions (do NOT use):**
- `text.inverse` on `accent.fill` → ~3.1:1 (fails AA). Use `text.primary` on purple.
- `text.tertiary` on `bg.canvas` → ~3.6:1 (large text only). Never for body.

### 1.2 Typography

- **Display font:** Cairo (600, 700) — for `display`, `h1`, `h2`, `h3`.
- **Body font:** IBM Plex Sans Arabic (400, 500, 600, 700) — for `body`, `caption`.
- **Letter-spacing:** `0` for all.
- **Loading:** `useFonts` in `app/_layout.tsx` before render.

| Variant | Size / Line height | Weight |
|---------|--------------------|--------|
| `display` | 34 / 44 | 700 |
| `h1` | 28 / 38 | 700 |
| `h2` | 22 / 32 | 700 |
| `h3` | 18 / 28 | 600 |
| `body` | 16 / 27 | 400 |
| `bodyStrong` | 16 / 27 | 600 |
| `caption` | 13 / 21 | 400 |
| `captionStrong` | 13 / 21 | 600 |

### 1.3 Spacing

4pt scale: `0, 4, 8, 12, 16, 20, 24, 28, 32, 40, 48, 64, 80`. **Minimum touch target: 44dp** (`MIN_TOUCH_TARGET`).

### 1.4 Radius

`xs: 4`, `sm: 8`, `md: 12`, `lg: 16`, `xl: 24`, `full: 9999`.

### 1.5 Shadows / Glows

- **Shadows** (`sm`, `md`, `lg`): plain black shadows for depth. Used by Card, Button, Dialog.
- **Glows** (`purple`, `gold`): colored shadow. **Disabled on Tier low** (ADR-0003). **Max 1 glow per screen** (2 only for ceremonial hero).

### 1.6 Motion

| Token | ms |
|-------|-----|
| `instant` | 90 |
| `fast` | 160 |
| `base` | 240 |
| `slow` | 360 |
| `extraSlow` | 560 |

Easings: `standard` (`[0.2,0,0,1]`), `decelerate`, `accelerate`. Springs: `gentle` (damping 20), `bouncy` (damping 12). **All durations pass through `useMotion().duration(ms)` which returns 0 under Reduce Motion.**

### 1.7 ThemeProvider & Hooks

```tsx
import { useTheme } from '@/theme';
import { useDeviceTier, useMotion, useHaptics, useDirection } from '@/hooks';
```

- `useTheme()` → tokens (colors, typography, spacing, radius, shadows, glows, durations).
- `useDeviceTier()` → `{ tier: 'high' | 'mid' | 'low', isHigh, isMid, isLow }`.
- `useMotion()` → `{ reduceMotion, enabled, duration(ms) }` — respects OS Reduce Motion.
- `useHaptics()` → `{ enabled, setEnabled, light, medium, success, error }`.
- `useDirection()` → `{ isRTL, direction }`.

---

## 2) Component Catalog

### 2.1 Primitives
- **`<Icon>`** — 39 lucide icons, RTL-aware (`MIRRORED_IN_RTL` set for direction icons).
- **`<Text>`** — typography-aware, `color` token or raw, `align` logical, `i18nKey` support.
- **`<Screen>`** — SafeArea container with logical padding; `scroll` prop.
- **`<Button>`** — 6 variants (primary, secondary, ghost, gold, danger, icon) × 3 sizes × 6 states.

### 2.2 Forms
- **`<Field>`** — label / required / help / error wrapper.
- **`<TextInput>`** — 3 sizes, left/right icons, focus border, error border, LTR for numeric.
- **`<Textarea>`** — multiline with min height.
- **`<Search>`** — search icon + clear button.
- **`<Switch>`** — custom, RTL-aware, honors reduceMotion.
- **`<Checkbox>`** — checked / indeterminate / disabled.
- **`<RadioGroup>`** — generic, disabled options.
- **`<Chip>`** — static or interactive; default, accent, gold.
- **`<PhoneInput>`** — YEM context (+967 prefix), digits only, max 9.
- **`<Select>`** — Modal-based picker, RTL-aware, disabled options.
- **`<OTPInput>`** — hidden-input pattern, paste, iOS/Android autofill.
- **`<DatePicker>`** — custom calendar modal, RTL-aware, min/max dates.

### 2.3 Feedback
- **`<ToastProvider>` + `useToast()`** — global toast, 4 variants, auto-dismiss, single at a time.
- **`<Banner>`** — inline block, 4 variants (info, demo, warning, error).
- **`<Badge>`** — 9 variants (neutral, accent, success, warning, danger, info + verified, pending, demo presets with icons).

### 2.4 Display
- **`<Card>`** — flat / crest (gold top accent) / pressable / stat.
- **`<ListItem>`** — default or card; interactive or static; destructive; leading/trailing.
- **`<SectionHeader>`** — title + subtitle + action chevron (mirrored in RTL).
- **`<Divider>`** — horizontal / vertical, hidden from a11y.
- **`<Avatar>`** — initials-based, 5 sizes, optional gold ring. **No image support until P06.**
- **`<ProgressBar>`** — linear, determinate / indeterminate, 3 sizes, 4 colors, a11y value.
- **`<RingProgress>`** — circular determinate, a11y value, center label. **No animation until P05+.**
- **`<Skeleton>`** — text / circle / rect; shimmer respects reduceMotion; hidden from a11y.

### 2.5 Overlays
- **`<Dialog>`** — modal centered surface + backdrop. `accessibilityViewIsModal`. **Do not stack Dialog + BottomSheet** (iOS Modal fragility).
- **`<BottomSheet>`** — modal bottom sheet, single snap (default 85%), drag-down-to-dismiss. **Do not stack with Dialog.**

### 2.6 Navigation
- **`<Tabs>`** — header only (default / pills), badges, disabled, a11y role `tablist` + `tab`. **Equal-width; non-scrollable until P07+ if needed.**
- **`<SegmentedControl>`** — Material-style, animated indicator, RTL-aware.
- **`<Stepper>`** — horizontal multi-step (completed / current / pending), a11y `progressbar`.

### 2.7 Brand
- **`<ArchHero>`** — Islamic/Yemeni arch frame (mihrab silhouette).
- **`<QamariyaPattern>`** — repeated motif SVG; `pointerEvents="none"`; hidden IDs per instance.
- **`<GlowView>`** — soft glow wrapper; **disabled on Tier low**.
- **`<GlassView>`** — `expo-blur` surface; **Dock + Sheet only**; falls back to solid on low tier.
- **`<DoubleRingLoader>`** — rotating interlocking rings; respects reduceMotion.
- **`<DoubleRingSuccess>`** — one-shot success animation; respects reduceMotion.
- **`<Hero3D>`** — three-layer parallax (Background / Midground / Foreground); caller drives `progress: SharedValue<number>`; disabled on Tier low + reduceMotion.

### 2.8 States
- **`<EmptyState>`** — neutral tone; default title `common.states.empty`.
- **`<ErrorState>`** — danger tone; default title `errors.unknown`; optional `onRetry` + `retrying`.
- **`<NotConnectedState>`** — accent tone; default title `errors.notConnected`; optional `onRetry` + secondary.
- All three built on the internal `<StateView>` base (not exported).

**Note:** `NotConnectedState` (Part 6b) is the composable version for placing **inside** a card or section. The full-screen `NotConnectedScreen` from P03 remains available for full-screen use.

---

## 3) Rules

### 3.1 Global Do/Don't

**Do:**
- Use semantic tokens from `useTheme()` — never hex literals in components.
- Pass i18n keys through `i18nKey` prop on `<Text>`, or pre-translate with `t()` before passing `label`/`title`/`message`.
- Use logical properties (`paddingStart/End`, `marginStart/End`, `start`/`end`) — never `left`/`right`.
- Test on Tier low: no glows, no heavy motion, no blur.
- Ensure every interactive element has `accessibilityRole` + accessible label.
- Ensure every interactive target is ≥44dp (`MIN_TOUCH_TARGET`).

**Don't:**
- Hardcode Arabic (or any) UI strings in components — put them in `src/locales/*.json`.
- Stack `<Dialog>` and `<BottomSheet>` simultaneously.
- Use `<GlowView>` for decorative purposes — only for hero emphasis.
- Use `<GlassView>` outside Dock and Sheet contexts.
- Use `text.accent` on `bg.raised` — use `text.accentOnRaised` instead.
- Rely on color alone to convey state (always pair with icon or text).
- Use `prettier` skip comments to avoid reformatting — run `format` instead.

### 3.2 Glow

**Maximum 1 glow per screen. 2 only for ceremonial hero (e.g., onboarding completion).**
- Button `primary` / `gold` variants apply glow automatically on Tier high/mid — do not double-wrap in `<GlowView>`.
- Use `<GlowView>` only when the button's own glow is insufficient (e.g., wrapping an illustration or card).
- On Tier low, glows are disabled. **Never** compensate with stronger shadows — the intent is a lighter surface for slow devices.

### 3.3 Glass

**Only for Dock + Sheet.**
- `<GlassView>` uses `expo-blur` on Tier high/mid, and a solid `rgba(30,24,50,0.92)` fallback on Tier low.
- Do not use `<GlassView>` for lists, forms, or cards — they should be on `bg.surface` or `bg.raised` for readability.
- On Web, uses `backdrop-filter` — verify visibility on older browsers before shipping.

### 3.4 Motion

- **Every animation duration must pass through `useMotion().duration(ms)`.** This ensures Reduce Motion is respected.
- Do not introduce an animation that changes the layout of `Pressable` targets (breaks focus).
- Skeleton / ProgressBar indeterminate pulses are default-on; skip on Tier low via `useDeviceTier`.
- Reanimated worklets compile via `babel-preset-expo` (SDK 58) — no config needed. Test in Jest uses a static mock (ADR-0011).

### 3.5 RTL Checklist

Every component must satisfy all of these before merge:
- [ ] `flexDirection: isRTL ? 'row-reverse' : 'row'` on horizontal layouts.
- [ ] `paddingStart`/`paddingEnd` — never `paddingLeft`/`paddingRight`.
- [ ] `marginStart`/`marginEnd` — never `marginLeft`/`marginRight`.
- [ ] Directional icons (`chevronLeft`, `chevronRight`, `arrowLeft`, `arrowRight`) pass through `<Icon>`'s auto-mirror.
- [ ] `textAlign: 'auto'` for start-aligned text.
- [ ] Numeric inputs (`keyboardType: 'numeric'|'phone-pad'|'email-address'`) force `textAlign: 'left'` + `writingDirection: 'ltr'`.
- [ ] Tab / Segment indicator uses `start: 0` + translated `translateX` (flipped for RTL).
- [ ] Any `Absolute` positioning uses `start`/`end` (not `left`/`right`).

### 3.6 Accessibility Checklist

Every component must satisfy all of these before merge:
- [ ] `accessibilityRole` set on interactive elements (`button`, `link`, `checkbox`, `switch`, `radio`, `tab`, `progressbar`, `alert`, `image`, `header`).
- [ ] `accessibilityLabel` set on icon-only buttons and complex images.
- [ ] `accessibilityState` reflects real state (`{ checked, disabled, selected, busy, expanded }`).
- [ ] `accessibilityValue` for progress elements (`{ min, max, now }`).
- [ ] `accessibilityViewIsModal` on Dialog and BottomSheet.
- [ ] Decorative elements (Divider, Skeleton) are hidden via `accessibilityElementsHidden` + `importantForAccessibility="no-hide-descendants"`.
- [ ] Every interactive target ≥44dp (`hitSlop` when needed).
- [ ] Focus states visible on Web (`Button`, `TextInput`, Tabs).
- [ ] No text conveyed only via color (pair with icon or label).
- [ ] Contrast: all text passes WCAG AA (4.5:1 for body, 3:1 for large ≥18pt).

### 3.7 Tier Matrix

| Component | High | Mid | Low |
|-----------|------|-----|-----|
| Button (primary/gold) glow | ✅ | ✅ | ❌ |
| GlowView | ✅ | ✅ | ❌ (flat) |
| GlassView | ✅ blur | ✅ blur | ✅ solid fallback |
| Hero3D parallax | ✅ | ✅ | ❌ (flat layers) |
| Skeleton shimmer | ✅ | ✅ | ❌ (static 0.5) |
| ProgressBar indeterminate pulse | ✅ | ✅ | ❌ (static 0.7) |
| DoubleRingLoader / Success | ✅ | ✅ | ✅ (respects reduceMotion, not tier) |
| QamariyaPattern opacity | ✅ | ✅ | ✅ (SVG, low cost) |

### 3.8 Performance Notes

- **SVG-heavy components** (`QamariyaPattern`, `ArchHero`, `RingProgress`, `DoubleRing*`) render cheaply on all tiers.
- **Blur** (`GlassView`) is the most expensive surface — restricted to Dock + Sheet, disabled on Tier low.
- **Reanimated worklets** used in `DoubleRing*`, `Hero3D`, `Skeleton`, `ProgressBar` — small, focused, driven by SharedValues. No layout animations.
- **Gallery** lives at `/gallery` — excluded from production bundle? **No.** Deferred to P22 (development-only gating).
- **Bundle size**: `lucide-react-native` is tree-shaken by Metro; only 39 icons imported. `react-native-svg` is shared by all SVG components.

---

## 4) Testing

### 4.1 What's covered by Jest
- All 42 components render without crashing.
- Press handlers, state transitions, disabled states.
- RTL behavior (flexDirection assertions where observable).
- Accessibility attributes (roles, states, labels, values).
- Form validation paths (Zod errors surface via props).
- Color contrast pairs (`__tests__/contrast.test.ts`).
- Seed integrity (dataOrigin='demo', no PII).

### 4.2 What's NOT covered by Jest (deferred)
- **Animation playback** — Reanimated is mocked (ADR-0011). Real motion is verified on devices + E2E (P21).
- **Gesture interactions** — `PanResponder` in BottomSheet is not directly tested. Verified on devices.
- **Blur rendering** — `expo-blur` mocked. Web/Mobile blur verified visually.
- **SVG rendering correctness** — `react-native-svg` renders in Jest, but visual layout is checked manually via Gallery.
- **Font loading** — Real font files not loaded in Jest; layout of Arabic glyphs verified visually.

**Total test count at P04 close: 565 tests, 71 suites.**

---

## 5) Summary

**Components shipped in P04:** 42
- 4 primitives
- 12 forms
- 3 feedback
- 8 display
- 2 overlays
- 3 navigation
- 7 brand
- 3 states

**Hooks:** 4 (`useDeviceTier`, `useMotion`, `useHaptics`, `useDirection`)

**Tokens:** colors (semantic + palette), typography (8 variants × 2 families), spacing (13), radius (6), shadows (4), glows (3), motion (durations, easings, springs).

**Coverage:**
- 565 Jest tests, 71 suites.
- 17 WCAG AA pairs verified.
- 42 components exercised for render + a11y.
- Full RTL support via logical properties + auto-mirrored icons.

**Known deferred items** (tracked in `PROJECT_CONTEXT §8`):
- RingProgress animation → P05+
- BottomSheet multi-snap → P20 if needed
- Tabs scrollable → P07+ if needed
- Avatar image → P06
- Gallery gating for production → P22
