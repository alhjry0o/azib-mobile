import { useEffect, useState } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  View,
  type LayoutChangeEvent,
} from 'react-native';

import { useDirection, useHaptics, useMotion } from '@/hooks';
import { useTheme } from '@/theme';

import { Icon, type IconName } from './Icon';
import { Text } from './Text';

export interface SegmentOption<V extends string> {
  readonly value: V;
  readonly label: string;
  readonly icon?: IconName;
  readonly disabled?: boolean;
}

export type SegmentedSize = 'sm' | 'md';

const SIZES: Record<SegmentedSize, { height: number; font: 'caption' | 'bodyStrong' }> = {
  sm: { height: 36, font: 'caption' },
  md: { height: 44, font: 'bodyStrong' },
};

export interface SegmentedControlProps<V extends string> {
  readonly segments: readonly SegmentOption<V>[];
  readonly value: V;
  readonly onChange: (value: V) => void;
  readonly size?: SegmentedSize;
  readonly testID?: string;
}

/**
 * Material-style segmented control with animated indicator.
 * Equal-width segments. RTL-aware via `start: 0` + translateX flip.
 */
export function SegmentedControl<V extends string>({
  segments,
  value,
  onChange,
  size = 'md',
  testID,
}: SegmentedControlProps<V>) {
  const theme = useTheme();
  const { isRTL } = useDirection();
  const motion = useMotion();
  const haptics = useHaptics();
  const spec = SIZES[size];

  const [containerWidth, setContainerWidth] = useState(0);
  const segmentWidth = segments.length > 0 ? containerWidth / segments.length : 0;
  const selectedIndex = Math.max(
    0,
    segments.findIndex((s) => s.value === value),
  );

  const [translateX] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (segmentWidth === 0) return;
    const target = selectedIndex * segmentWidth * (isRTL ? -1 : 1);
    const dur = motion.duration(220);
    if (dur === 0) {
      translateX.setValue(target);
    } else {
      Animated.timing(translateX, {
        toValue: target,
        duration: dur,
        useNativeDriver: true,
      }).start();
    }
  }, [selectedIndex, segmentWidth, isRTL, motion, translateX]);

  const onLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w !== containerWidth) setContainerWidth(w);
  };

  return (
    <View
      onLayout={onLayout}
      accessibilityRole="tablist"
      style={[
        styles.container,
        {
          height: spec.height,
          backgroundColor: theme.colors.bg.surface,
          borderRadius: theme.radius.full,
          borderWidth: 1,
          borderColor: theme.colors.border.subtle,
          flexDirection: isRTL ? 'row-reverse' : 'row',
          padding: 3,
        },
      ]}
      testID={testID}
    >
      {containerWidth > 0 && segmentWidth > 0 ? (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.indicator,
            {
              width: segmentWidth,
              height: spec.height - 6,
              borderRadius: theme.radius.full,
              backgroundColor: theme.colors.accent.fill,
              start: 3,
              transform: [{ translateX }],
            },
          ]}
        />
      ) : null}

      {segments.map((seg) => {
        const selected = seg.value === value;
        const isDisabled = !!seg.disabled;
        const textColor = selected ? 'primary' : isDisabled ? 'tertiary' : 'secondary';
        return (
          <Pressable
            key={seg.value}
            accessibilityRole="tab"
            accessibilityState={{ selected, disabled: isDisabled }}
            accessibilityLabel={seg.label}
            disabled={isDisabled}
            onPress={() => {
              if (isDisabled) return;
              haptics.light();
              onChange(seg.value);
            }}
            style={styles.segment}
          >
            <View
              style={[
                styles.segmentContent,
                { flexDirection: isRTL ? 'row-reverse' : 'row', gap: 6 },
              ]}
            >
              {seg.icon ? (
                <Icon name={seg.icon} size={14} color={theme.colors.text[textColor]} />
              ) : null}
              <Text variant={spec.font} color={textColor} numberOfLines={1}>
                {seg.label}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
  },
  indicator: {
    position: 'absolute',
    top: 3,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 32,
  },
  segmentContent: { alignItems: 'center' },
});
