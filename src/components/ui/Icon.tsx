import { View, type StyleProp, type ViewStyle } from 'react-native';

import { useDirection } from '@/hooks';
import { useTheme } from '@/theme';

import { ICONS, MIRRORED_IN_RTL, type IconName } from './icons';

export interface IconProps {
  readonly name: IconName;
  /** Defaults to 20. */
  readonly size?: number;
  /** Defaults to theme.colors.text.secondary. */
  readonly color?: string;
  /** Defaults to 2 (lucide default). */
  readonly strokeWidth?: number;
  /**
   * When undefined, mirrors automatically if the icon is in MIRRORED_IN_RTL
   * and the current direction is RTL.
   */
  readonly mirrorInRTL?: boolean;
  readonly style?: StyleProp<ViewStyle>;
  /** When provided, exposes the icon to screen readers. */
  readonly accessibilityLabel?: string;
}

export function Icon({
  name,
  size = 20,
  color,
  strokeWidth = 2,
  mirrorInRTL,
  style,
  accessibilityLabel,
}: IconProps) {
  const theme = useTheme();
  const { isRTL } = useDirection();
  const Component = ICONS[name];
  const resolvedColor = color ?? theme.colors.text.secondary;
  const shouldMirror = mirrorInRTL ?? MIRRORED_IN_RTL.has(name);
  const transform = isRTL && shouldMirror ? [{ scaleX: -1 }] : undefined;

  return (
    <View
      style={style}
      accessible={!!accessibilityLabel}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={accessibilityLabel ? 'image' : undefined}
      importantForAccessibility={accessibilityLabel ? 'yes' : 'no-hide-descendants'}
    >
      <Component
        size={size}
        color={resolvedColor}
        strokeWidth={strokeWidth}
        style={transform ? { transform } : undefined}
      />
    </View>
  );
}

export type { IconName };
