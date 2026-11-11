// Color tokens. Raw palette (numbered) + semantic tokens.
// Contrast pairs are validated in __tests__/contrast.test.ts (WCAG AA).
// Small purple text on the canvas/surface uses text.accent (#9B5CFF);
// on raised cards use text.accentOnRaised (#B88AFF).
// Text on accent.fill (purple) MUST be text.primary (white, ~7:1).
// Text on gold.fill (mustard) MUST be text.inverse (dark, ~9:1).

export const palette = {
  black: {
    900: '#09080F', // canvas
    800: '#100D19', // surface
    700: '#1E1832', // raised
    600: '#2A2245', // overlay strong
  },
  purple: {
    700: '#5B2AA5',
    600: '#7136C9',
    500: '#8648E0',
    400: '#9B5CFF',
    300: '#B88AFF',
    200: '#D6BDFF',
  },
  gold: {
    700: '#A67F10',
    600: '#BD8F1A',
    500: '#D9A928',
    400: '#E6BC4A',
    300: '#F0CA68',
    200: '#F7DF9F',
  },
  state: {
    success: '#3FCF8E',
    danger: '#FF5C7A',
    info: '#5CA8FF',
  },
  white: '#FFFFFF',
  neutral: {
    100: '#A7A2B3', // text.secondary
    200: '#6B6776', // text.tertiary (large text only)
  },
} as const;

export const semanticColors = {
  bg: {
    canvas: palette.black[900],
    surface: palette.black[800],
    raised: palette.black[700],
    overlay: 'rgba(9, 8, 15, 0.72)',
  },
  border: {
    subtle: 'rgba(255, 255, 255, 0.08)',
    strong: 'rgba(255, 255, 255, 0.16)',
    accent: palette.purple[600],
  },
  text: {
    primary: palette.white,
    secondary: palette.neutral[100],
    tertiary: palette.neutral[200], // large/decorative only — 3.6:1 on canvas
    inverse: palette.black[900],
    accent: palette.purple[400], // #9B5CFF — use on canvas/surface
    accentOnRaised: palette.purple[300], // #B88AFF — use on raised cards
    gold: palette.gold[300], // #F0CA68
  },
  accent: {
    fill: palette.purple[600],
    fillPressed: palette.purple[700],
    fillHover: palette.purple[500],
    text: palette.purple[400],
    glow: 'rgba(155, 92, 255, 0.45)',
  },
  gold: {
    fill: palette.gold[500],
    fillPressed: palette.gold[600],
    fillHover: palette.gold[400],
    text: palette.gold[300],
    glow: 'rgba(240, 202, 104, 0.45)',
  },
  state: {
    success: palette.state.success,
    danger: palette.state.danger,
    info: palette.state.info,
  },
} as const;

export type Palette = typeof palette;
export type SemanticColors = typeof semanticColors;
