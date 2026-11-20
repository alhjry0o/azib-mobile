import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { DoubleRingLoader } from '@/components/brand';
import { ProgressBar, Text } from '@/components/ui';
import { useDirection } from '@/hooks';
import { useTheme } from '@/theme';

export interface WizardProgressProps {
  readonly step: number;
  readonly total: number;
  readonly label: string;
}

export function WizardProgress({ step, total, label }: WizardProgressProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const { isRTL } = useDirection();

  return (
    <View style={[styles.container, { gap: theme.spacing[2] }]} testID="wizard-progress">
      <View
        style={[
          styles.row,
          { flexDirection: isRTL ? 'row-reverse' : 'row', gap: theme.spacing[3] },
        ]}
      >
        <DoubleRingLoader size={32} testID="wizard-rings" />
        <View style={styles.text}>
          <Text variant="bodyStrong" numberOfLines={1}>
            {label}
          </Text>
          <Text variant="caption" color="secondary" testID="wizard-step-count">
            {t('assistance:wizard.stepOf', { current: step + 1, total })}
          </Text>
        </View>
      </View>
      <ProgressBar value={(step + 1) / total} testID="wizard-progress-bar" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%' },
  row: { alignItems: 'center' },
  text: { flex: 1, gap: 2 },
});
