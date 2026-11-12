import type { ReactNode } from 'react';
import {
  ScrollView,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/theme';

export interface ScreenProps {
  readonly children: ReactNode;
  /** Apply horizontal padding via logical properties. Default true. */
  readonly paddingX?: boolean;
  /** Apply safe-area top inset. Default true. */
  readonly safeTop?: boolean;
  /** Apply safe-area bottom inset. Default true. */
  readonly safeBottom?: boolean;
  /** Wrap content in ScrollView. Default false. */
  readonly scroll?: boolean;
  /** Custom background (defaults to theme bg.canvas). */
  readonly background?: string;
  readonly style?: StyleProp<ViewStyle>;
  /** Content container style (only used when scroll=true). */
  readonly contentStyle?: StyleProp<ViewStyle>;
  readonly testID?: string;
}

export function Screen({
  children,
  paddingX = true,
  safeTop = true,
  safeBottom = true,
  scroll = false,
  background,
  style,
  contentStyle,
  testID,
}: ScreenProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const bg = background ?? theme.colors.bg.canvas;

  const containerStyle: ViewStyle = {
    flex: 1,
    backgroundColor: bg,
    paddingTop: safeTop ? insets.top : 0,
    paddingBottom: safeBottom ? insets.bottom : 0,
    paddingStart: paddingX ? theme.spacing[4] : 0,
    paddingEnd: paddingX ? theme.spacing[4] : 0,
  };

  if (scroll) {
    return (
      <ScrollView
        testID={testID}
        style={[containerStyle, style]}
        contentContainerStyle={contentStyle}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
    );
  }

  return (
    <View testID={testID} style={[containerStyle, style]}>
      {children}
    </View>
  );
}
