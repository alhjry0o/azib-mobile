// Typography tokens. Font families are loaded in app/_layout.tsx via useFonts.
// Letter-spacing is 0 per brief.

export const fontFamilies = {
  bodyRegular: 'IBMPlexSansArabic_400Regular',
  bodyMedium: 'IBMPlexSansArabic_500Medium',
  bodySemiBold: 'IBMPlexSansArabic_600SemiBold',
  bodyBold: 'IBMPlexSansArabic_700Bold',
  displaySemiBold: 'Cairo_600SemiBold',
  displayBold: 'Cairo_700Bold',
} as const;

export const typography = {
  display: {
    fontFamily: fontFamilies.displayBold,
    fontSize: 34,
    lineHeight: 44,
    fontWeight: '700' as const,
    letterSpacing: 0,
  },
  h1: {
    fontFamily: fontFamilies.displayBold,
    fontSize: 28,
    lineHeight: 38,
    fontWeight: '700' as const,
    letterSpacing: 0,
  },
  h2: {
    fontFamily: fontFamilies.displayBold,
    fontSize: 22,
    lineHeight: 32,
    fontWeight: '700' as const,
    letterSpacing: 0,
  },
  h3: {
    fontFamily: fontFamilies.displaySemiBold,
    fontSize: 18,
    lineHeight: 28,
    fontWeight: '600' as const,
    letterSpacing: 0,
  },
  body: {
    fontFamily: fontFamilies.bodyRegular,
    fontSize: 16,
    lineHeight: 27,
    fontWeight: '400' as const,
    letterSpacing: 0,
  },
  bodyStrong: {
    fontFamily: fontFamilies.bodySemiBold,
    fontSize: 16,
    lineHeight: 27,
    fontWeight: '600' as const,
    letterSpacing: 0,
  },
  caption: {
    fontFamily: fontFamilies.bodyRegular,
    fontSize: 13,
    lineHeight: 21,
    fontWeight: '400' as const,
    letterSpacing: 0,
  },
  captionStrong: {
    fontFamily: fontFamilies.bodySemiBold,
    fontSize: 13,
    lineHeight: 21,
    fontWeight: '600' as const,
    letterSpacing: 0,
  },
} as const;

export type Typography = typeof typography;
export type TypographyVariant = keyof Typography;
