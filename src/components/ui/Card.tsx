import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useHaptics } from '@/hooks';
import { useTheme } from '@/theme';

import { Icon, type IconName } from './Icon';
import { Text } from './Text';

export type CardVariant = 'crest' | 'flat' | 'pressable' | 'stat';

interface BaseProps {
  readonly testID?: string;
  readonly style?: StyleProp<ViewStyle>;
}

export interface ContentCardProps extends BaseProps {
  readonly variant?: 'crest' | 'flat';
  readonly children: ReactNode;
}

export interface PressableCardProps extends BaseProps {
  readonly variant: 'pressable';
  readonly children: ReactNode;
  readonly onPress: () => void;
  readonly accessibilityLabel?: string;
}

export interface StatCardProps extends BaseProps {
  readonly variant: 'stat';
  readonly title: string;
  readonly value: string | number;
  readonly leftIcon?: IconName;
  readonly caption?: string;
}

export type CardProps = ContentCardProps | PressableCardProps | StatCardProps;

export function Card(props: CardProps) {
  const theme = useTheme();
  const haptics = useHaptics();

  const baseStyle: ViewStyle = {
    backgroundColor: theme.colors.bg.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing[4],
  };

  if (props.variant === 'stat') {
    return (
      <View
        style={[
          baseStyle,
          {
            borderWidth: 1,
            borderColor: theme.colors.border.subtle,
            gap: theme.spacing[2],
          },
          props.style,
        ]}
        testID={props.testID}
      >
        <View style={styles.statHeader}>
          {props.leftIcon ? (
            <Icon name={props.leftIcon} size={18} color={theme.colors.text.accent} />
          ) : null}
          <Text variant="caption" color="secondary">
            {props.title}
          </Text>
        </View>
        <Text variant="h1" color="primary">
          {String(props.value)}
        </Text>
        {props.caption ? (
          <Text variant="caption" color="tertiary">
            {props.caption}
          </Text>
        ) : null}
      </View>
    );
  }

  if (props.variant === 'pressable') {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={props.accessibilityLabel}
        onPress={() => {
          haptics.light();
          props.onPress();
        }}
        testID={props.testID}
        style={({ pressed }) => [
          baseStyle,
          {
            borderWidth: 1,
            borderColor: theme.colors.border.subtle,
            opacity: pressed ? 0.85 : 1,
          },
          props.style,
        ]}
      >
        {props.children}
      </Pressable>
    );
  }

  if (props.variant === 'crest') {
    return (
      <View
        style={[
          baseStyle,
          {
            borderWidth: 1,
            borderColor: theme.colors.border.subtle,
            borderTopColor: theme.colors.gold.fill,
            borderTopWidth: 2,
            overflow: 'hidden',
          },
          props.style,
        ]}
        testID={props.testID}
      >
        {props.children}
      </View>
    );
  }

  // 'flat' (default)
  return (
    <View
      style={[
        baseStyle,
        {
          borderWidth: 1,
          borderColor: theme.colors.border.subtle,
        },
        props.style,
      ]}
      testID={props.testID}
    >
      {props.children}
    </View>
  );
}

const styles = StyleSheet.create({
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
});
