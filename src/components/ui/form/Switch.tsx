import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';

import { useDirection, useHaptics, useMotion } from '@/hooks';
import { useTheme } from '@/theme';

import { Text } from '../Text';

export type SwitchSize = 'sm' | 'md';

const SIZES: Record<SwitchSize, { trackW: number; trackH: number; thumb: number; inset: number }> = {
  sm: { trackW: 44, trackH: 24, thumb: 18, inset: 3 },
  md: { trackW: 52, trackH: 30, thumb: 24, inset: 3 },
};

export interface SwitchProps {
  readonly value: boolean;
  readonly onValueChange: (value: boolean) => void;
  readonly disabled?: boolean;
  readonly size?: SwitchSize;
  readonly label?: string;
  /** Place the label before the switch (start side). Default false (after). */
  readonly labelFirst?: boolean;
  readonly testID?: string;
}

export function Switch({
  value,
  onValueChange,
  disabled = false,
  size = 'md',
  label,
  labelFirst = false,
  testID,
}: SwitchProps) {
  const theme = useTheme();
  const { isRTL } = useDirection();
  const motion = useMotion();
  const haptics = useHaptics();
  const spec = SIZES[size];

  const travel = spec.trackW - spec.thumb - spec.inset * 2;
  const anim = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    const toValue = value ? 1 : 0;
    const duration = motion.duration(180);
    if (duration === 0) {
      anim.setValue(toValue);
    } else {
      Animated.timing(anim, {
        toValue,
        duration,
        useNativeDriver: true,
      }).start();
    }
  }, [value, anim, motion]);

  const translateX = anim.interpolate({
    inputRange: [0, 1],
    outputRange: isRTL
      ? [spec.inset + travel, spec.inset]
      : [spec.inset, spec.inset + travel],
  });

  const trackBg = value ? theme.colors.accent.fill : theme.colors.bg.raised;
  const trackBorder = value ? theme.colors.accent.fill : theme.colors.border.subtle;

  const onPress = () => {
    if (disabled) return;
    haptics.light();
    onValueChange(!value);
  };

  const control = (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
      accessibilityLabel={label}
      onPress={onPress}
      disabled={disabled}
      testID={testID}
      hitSlop={6}
      style={{ opacity: disabled ? 0.45 : 1 }}
    >
      <View
        style={[
          styles.track,
          {
            width: spec.trackW,
            height: spec.trackH,
            borderRadius: spec.trackH / 2,
            backgroundColor: trackBg,
            borderColor: trackBorder,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.thumb,
            {
              width: spec.thumb,
              height: spec.thumb,
              borderRadius: spec.thumb / 2,
              backgroundColor: theme.colors.text.primary,
              transform: [{ translateX }],
            },
          ]}
        />
      </View>
    </Pressable>
  );

  if (!label) return control;

  return (
    <View style={styles.row}>
      {labelFirst ? (
        <>
          <Pressable onPress={onPress} disabled={disabled} accessibilityElementsHidden>
            <Text variant="body" color={disabled ? 'tertiary' : 'primary'}>
              {label}
            </Text>
          </Pressable>
          {control}
        </>
      ) : (
        <>
          {control}
          <Pressable onPress={onPress} disabled={disabled} accessibilityElementsHidden>
            <Text variant="body" color={disabled ? 'tertiary' : 'primary'}>
              {label}
            </Text>
          </Pressable>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    borderWidth: 1,
    justifyContent: 'center',
  },
  thumb: {
    position: 'absolute',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
});
