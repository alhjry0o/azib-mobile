// Timeline built ONLY from real stamps (buildTimeline). Never fabricated.
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { Icon, Text } from '@/components/ui';
import { useHomeFormatters } from '@/features/home/hooks/use-home-formatters';
import { useTheme } from '@/theme';
import { buildTimeline } from '../state/application-machine';
import type { ApplicantOwnView } from '../state/public-view';

export interface ApplicationTimelineProps {
  readonly application: ApplicantOwnView;
  readonly testID?: string;
}

export function ApplicationTimeline({ application, testID }: ApplicationTimelineProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const format = useHomeFormatters();
  const steps = buildTimeline({
    submittedAt: application.submittedAt,
    viewedAt: application.viewedAt,
    shortlistedAt: application.shortlistedAt,
    rejectedAt: application.rejectedAt,
    hiredAt: application.hiredAt,
    withdrawnAt: application.withdrawnAt,
  });

  return (
    <View style={{ gap: theme.spacing[2] }} testID={testID}>
      <Text variant="bodyStrong">{t('jobs:applications.timeline')}</Text>
      {steps.map((step) => (
        <View
          key={`${step.status}-${step.at}`}
          style={[styles.row, { gap: theme.spacing[2] }]}
          testID={testID ? `${testID}-${step.status}` : undefined}
        >
          <Icon name="checkCircle" size={14} color={theme.colors.state.success} />
          <Text variant="caption" color="secondary" style={styles.grow}>
            {t(`jobs:applicationStatus.${step.status}`)}
          </Text>
          <Text variant="caption" color="tertiary">
            {format.date(step.at)}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  grow: { flex: 1 },
});
