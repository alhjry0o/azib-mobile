// The salary is ALWAYS labelled "declared by the publisher, unverified".
// There is no payment, no tracking and no commission (ADR-0005).
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { Badge, Text } from '@/components/ui';
import { useHomeFormatters } from '@/features/home/hooks/use-home-formatters';
import { useTheme } from '@/theme';

export interface SalaryNoteProps {
  readonly salaryMin: number | null;
  readonly salaryMax: number | null;
  readonly testID?: string;
}

export function SalaryNote({ salaryMin, salaryMax, testID }: SalaryNoteProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const format = useHomeFormatters();

  const declared = salaryMin !== null || salaryMax !== null;
  const range =
    salaryMin !== null && salaryMax !== null
      ? `${format.number(salaryMin)} — ${format.number(salaryMax)}`
      : salaryMin !== null
        ? format.number(salaryMin)
        : salaryMax !== null
          ? format.number(salaryMax)
          : null;

  return (
    <View style={{ gap: theme.spacing[1] }} testID={testID}>
      <Text variant="captionStrong" color="secondary">
        {declared
          ? t('jobs:salary.declared', { range: range ?? '' })
          : t('jobs:salary.notDeclared')}
      </Text>
      <Badge
        variant="pending"
        size="sm"
        label={t('jobs:salary.unverified')}
        testID={testID ? `${testID}-unverified` : undefined}
      />
      <Text variant="caption" color="tertiary" style={styles.note}>
        {t('jobs:salary.note')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  note: { flexShrink: 1 },
});
