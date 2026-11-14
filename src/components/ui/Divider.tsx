import { View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/theme';

export interface DividerProps {
  readonly orientation?: 'horizontal' | 'vertical';
  readonly thickness?: number;
  readonly color?: string;
  readonly spacing?: number;
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

  const containerStyle: ViewStyle =
    orientation === 'horizontal'
      ? { marginVertical: gap, alignSelf: 'stretch' }
      : { marginHorizontal: gap, alignSelf: 'stretch' };

  const lineStyle: ViewStyle =
    orientation === 'horizontal'
      ? { height: thickness, backgroundColor: tint }
      : { width: thickness, backgroundColor: tint };

  const insetStyle: ViewStyle | undefined = inset
    ? { marginStart: theme.spacing[4], marginEnd: theme.spacing[4] }
    : undefined;

  return (
    <View
      style={[containerStyle, insetStyle, style]}
      testID={testID}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <View style={lineStyle} />
    </View>
  );
}
