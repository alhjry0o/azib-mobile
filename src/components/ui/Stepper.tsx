import { Fragment } from 'react';
import { StyleSheet, View } from 'react-native';

import { useDirection } from '@/hooks';
import { useTheme } from '@/theme';

import { Icon } from './Icon';
import { Text } from './Text';

export interface StepperProps {
  readonly steps: readonly string[];
  /** Zero-based index of the current step. */
  readonly currentStep: number;
  readonly testID?: string;
}

/**
 * Horizontal multi-step progress indicator.
 * States per step:
 *   - index < currentStep → completed (accent fill + check icon)
 *   - index === currentStep → current (accent border + number)
 *   - index > currentStep → pending (subtle border + number)
 */
export function Stepper({ steps, currentStep, testID }: StepperProps) {
  const theme = useTheme();
  const { isRTL } = useDirection();

  return (
    <View
      accessible={true}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: steps.length, now: currentStep + 1 }}
      accessibilityLabel={`${currentStep + 1} / ${steps.length}`}
      style={[styles.row, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}
      testID={testID}
    >
      {steps.map((label, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;

        const circleBg = isCompleted ? theme.colors.accent.fill : 'transparent';
        const circleBorder = isCompleted || isCurrent
          ? theme.colors.accent.fill
          : theme.colors.border.strong;
        const circleText = isCompleted || isCurrent ? 'primary' : 'secondary';

        const nextCompleted = index + 1 < currentStep;
        const lineColor =
          isCompleted && (nextCompleted || index + 1 === currentStep)
            ? theme.colors.accent.fill
            : theme.colors.border.subtle;

        return (
          <Fragment key={`${label}-${index}`}>
            <View style={styles.stepColumn}>
              <View
                style={[
                  styles.circle,
                  {
                    backgroundColor: circleBg,
                    borderColor: circleBorder,
                  },
                ]}
              >
                {isCompleted ? (
                  <Icon name="check" size={14} color={theme.colors.text.primary} strokeWidth={3} />
                ) : (
                  <Text variant="captionStrong" color={circleText}>
                    {String(index + 1)}
                  </Text>
                )}
              </View>
              <Text
                variant="caption"
                color={isCurrent ? 'primary' : 'secondary'}
                align="center"
                numberOfLines={2}
                style={styles.label}
              >
                {label}
              </Text>
            </View>
            {index < steps.length - 1 ? (
              <View style={[styles.line, { backgroundColor: lineColor }]} />
            ) : null}
          </Fragment>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { alignItems: 'flex-start' },
  stepColumn: { alignItems: 'center', width: 80 },
  circle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { marginTop: 6, fontSize: 11, lineHeight: 15 },
  line: {
    flex: 1,
    height: 2,
    marginTop: 15,
    alignSelf: 'flex-start',
  },
});
