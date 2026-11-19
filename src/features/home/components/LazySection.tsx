// Defers mounting (and therefore the section query) until the section is
// viewable. HomeScreen provides a fallback flag for environments where
// viewability never reports (Jest / some web layouts).
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { Skeleton } from '@/components/ui';
import { useTheme } from '@/theme';

export interface LazySectionProps {
  readonly active: boolean;
  readonly children: ReactNode;
  readonly testID?: string;
}

export function LazySection({ active, children, testID }: LazySectionProps) {
  const theme = useTheme();

  if (!active) {
    return (
      <View
        style={[styles.placeholder, { paddingHorizontal: theme.spacing[4], gap: theme.spacing[2] }]}
        testID={testID ? `${testID}-placeholder` : undefined}
      >
        <Skeleton variant="text" width="45%" />
        <Skeleton variant="rect" height={120} />
      </View>
    );
  }

  return <View testID={testID}>{children}</View>;
}

const styles = StyleSheet.create({
  placeholder: { paddingVertical: 16 },
});
