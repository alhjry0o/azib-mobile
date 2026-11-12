import { useMemo, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Text as RNText,
  type TextProps as RNTextProps,
  type StyleProp,
  type TextStyle,
} from 'react-native';

import { useDirection } from '@/hooks';
import { useTheme } from '@/theme';
import type { Theme } from '@/theme';

export type TextColorKey = keyof Theme['colors']['text'];
export type TextVariant = keyof Theme['typography'];
export type TextAlign = 'start' | 'center' | 'end';

export interface TextProps extends Omit<RNTextProps, 'style' | 'children'> {
  readonly variant?: TextVariant;
  /** Semantic token key (e.g. 'primary', 'accent') OR a raw color string. */
  readonly color?: TextColorKey | string;
  readonly align?: TextAlign;
  /** i18n key. When provided, `children` is ignored. */
  readonly i18nKey?: string;
  /** i18n namespace (optional; falls back to i18next default). */
  readonly ns?: string;
  /** Parameters for i18next interpolation (e.g. { count: 3 }). */
  readonly i18nParams?: Record<string, unknown>;
  readonly style?: StyleProp<TextStyle>;
  readonly children?: ReactNode;
}

export function Text({
  variant = 'body',
  color = 'primary',
  align = 'start',
  i18nKey,
  ns,
  i18nParams,
  style,
  children,
  ...rest
}: TextProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const { isRTL } = useDirection();

  const resolvedColor = useMemo<string>(() => {
    const tokens = theme.colors.text as Record<string, string>;
    if (color in tokens) return tokens[color];
    return color;
  }, [color, theme]);

  // 'auto' respects writing direction (start). 'end' needs explicit L/R swap.
  const resolvedAlign: TextStyle['textAlign'] = useMemo(() => {
    if (align === 'start') return 'auto';
    if (align === 'center') return 'center';
    return isRTL ? 'left' : 'right';
  }, [align, isRTL]);

  const content = i18nKey ? t(i18nKey, { ns, ...i18nParams }) : children;

  return (
    <RNText
      {...rest}
      style={[theme.typography[variant], { color: resolvedColor, textAlign: resolvedAlign }, style]}
    >
      {content}
    </RNText>
  );
}
