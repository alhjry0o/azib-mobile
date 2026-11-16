import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { ProgressBar, Text } from '@/components/ui';
import { scorePassword } from '@/schemas/auth';

export interface PasswordStrengthMeterProps {
  readonly value: string;
  readonly testID?: string;
}

const LABEL_KEYS = [
  'auth:strength.weak',
  'auth:strength.weak',
  'auth:strength.fair',
  'auth:strength.good',
  'auth:strength.strong',
] as const;

const COLORS = ['danger', 'danger', 'gold', 'accent', 'success'] as const;

export function PasswordStrengthMeter({ value, testID }: PasswordStrengthMeterProps) {
  const { t } = useTranslation();
  const score = scorePassword(value);

  return (
    <View style={styles.container} testID={testID}>
      <ProgressBar value={score / 4} color={COLORS[score]} size="sm" />
      <Text variant="caption" color="secondary">
        {`${t('auth:strength.label')}: ${t(LABEL_KEYS[score])}`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 4, width: '100%' },
});
