import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/theme';

export interface DividerProps {
  readonly orientation?: 'horizontal' | 'vertical';
  readonly thickness?: number;
  readonly color?: string;
  /** Space around the divider. Default theme.spacing[3]. */
  readonly spacing?: number;
  /** Inset the ends with logical margin. Default false. */
  readonly inset?: boolean;
  readonly style?: StyleProp<ViewStyle>;
  readonly testID?: string;
}

export function Divider({
  orientation = 'horizontal',
  thickness = 1,
  color,
  spacing,
  inset = false,
  style,
  testID,
}: DividerProps) {
  const theme = useTheme();
  const tint = color ?? theme.colors.border.subtle;
  const gap = spacing ?? theme.spacing[3];
  const insetStyle: ViewStyle | undefined = inset
    ? { marginStart: theme.spacing[4], marginEnd: theme.spacing[4] }
    : undefined;

  const baseStyle: ViewStyle =
    orientation === 'horizontal'
      ? { height: thickness, alignSelf: 'stretch', backgroundColor: tint }
      : { width: thickness, alignSelf: 'stretch', backgroundColor: tint };

  const spacerStyle: ViewStyle =
    orientation === 'horizontal' ? { marginVertical: gap } : { marginHorizontal: gap };

  return (
    <View
      style={[spacerStyle, insetStyle, style]}
      testID={testID}
      accessibilityRole="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <View style={baseStyle} />
    </View>
  );
}

const _styles = StyleSheet.create({});
