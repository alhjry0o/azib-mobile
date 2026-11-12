# DESIGN SYSTEM — عازب | AZIB

> **Stub.** This file is being filled across Parts 1–7 of Phase P04.
> Full content (usage rules, do/don't, tier matrix) is finalized in Part 7.

## Status by Part

| Part | Content | Status |
|------|---------|--------|
| 1 | Tokens (colors, typography, spacing, radius, shadows, motion), ThemeProvider, hooks, contrast utility | Drafted |
| 2 | Icon wrapper, Typography, Screen, Button | Pending |
| 3 | Form components | Pending |
| 4 | Feedback & Overlay components | Pending |
| 5 | Brand + 3D (ArchHero, QamariyaPattern, DoubleRing, GlowView, GlassView, Hero3D) | Pending |
| 6 | Utility components (Avatar, Progress, Skeleton, EmptyState, …) | Pending |
| 7 | Full usage rules, tier matrix, do/don't, closing | Pending |

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
