// D-2 + D-6: small numbers (and their totals) are suppressed, the threshold is
// labeled as awaiting approval, and ONLY the demo bucket is ever rendered.
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { Badge, Card, Icon, Text, type IconName } from '@/components/ui';
import { formatCurrency, getLanguage } from '@/i18n';
import { useProviderContainer } from '@/providers';
import type { Result } from '@/core/result';
import { useSettingsStore } from '@/stores';
import { useTheme } from '@/theme';
import { SectionShell } from '../components/SectionShell';
import { useHomeFormatters } from '../hooks/use-home-formatters';
import { useHomeSection } from '../hooks/use-home-section';
import {
  SMALL_NUMBER_THRESHOLD,
  computeCommunityStats,
  totalRecordCount,
  type CommunityStats,
  type StatValue,
} from '../stats-privacy';

interface StatRow {
  readonly key: string;
  readonly icon: IconName;
  readonly count: StatValue;
  readonly total: StatValue | null;
}

export function CommunityStatsSection() {
  const theme = useTheme();
  const { t } = useTranslation();
  const container = useProviderContainer();
  const format = useHomeFormatters();
  const numerals = useSettingsStore((s) => s.numberSystem);
  const language = getLanguage();

  const section = useHomeSection<CommunityStats>({
    id: 'community-stats',
    fetch: async (): Promise<Result<readonly CommunityStats[]>> => {
      const donations = await container.repositories.donations.list({ limit: 100 });
      if (!donations.ok) return donations;
      const disbursements = await container.repositories.disbursements.list({ limit: 100 });
      if (!disbursements.ok) return disbursements;
      const profiles = await container.repositories.profiles.list({ limit: 100 });
      if (!profiles.ok) return profiles;

      const input = {
        donations: donations.value.items,
        disbursements: disbursements.value.items,
        beneficiaries: profiles.value.items,
      };
      if (totalRecordCount(input) === 0) return { ok: true, value: [] };
      return { ok: true, value: [computeCommunityStats(input)] };
    },
  });

  const stats = section.data[0] ?? null;

  const rows: readonly StatRow[] = stats
    ? [
        {
          key: 'donations',
          icon: 'wallet',
          count: stats.demo.donations.count,
          total: stats.demo.donations.total,
        },
        {
          key: 'disbursements',
          icon: 'creditCard',
          count: stats.demo.disbursements.count,
          total: stats.demo.disbursements.total,
        },
        {
          key: 'beneficiaries',
          icon: 'users',
          count: stats.demo.beneficiaries,
          total: null,
        },
      ]
    : [];

  const renderValue = (value: StatValue): string =>
    value.kind === 'value'
      ? format.number(value.value)
      : t('home:sections.communityStats.suppressed');

  return (
    <SectionShell
      id="community-stats"
      title={t('home:sections.communityStats.title')}
      subtitle={t('home:sections.communityStats.subtitle')}
      status={section.status}
      emptyIcon="info"
      emptyTitle={t('home:sections.communityStats.empty')}
      emptyDescription={t('home:sections.communityStats.emptyDescription')}
      onRetry={section.refetch}
    >
      <View style={{ gap: theme.spacing[2] }} testID="stats-demo-bucket">
        <Badge
          variant="demo"
          size="sm"
          label={t('home:sections.communityStats.demoOnly')}
          testID="stats-demo-badge"
        />
        {rows.map((row) => (
          <Card
            key={row.key}
            variant="stat"
            title={t(`home:sections.communityStats.${row.key}`)}
            value={renderValue(row.count)}
            leftIcon={row.icon}
            caption={
              row.total
                ? row.total.kind === 'value'
                  ? formatCurrency(row.total.value, { language, numerals })
                  : t('home:sections.communityStats.suppressed')
                : undefined
            }
            testID={`stats-${row.key}`}
          />
        ))}
        <View
          style={[
            styles.note,
            { gap: theme.spacing[2], flexDirection: 'row', alignItems: 'flex-start' },
          ]}
        >
          <Icon name="shield" size={16} color={theme.colors.text.secondary} />
          <Text variant="caption" color="secondary" style={styles.noteText} testID="stats-threshold-note">
            {t('home:sections.communityStats.thresholdNote', {
              threshold: format.number(SMALL_NUMBER_THRESHOLD),
            })}
          </Text>
        </View>
        <Text variant="caption" color="secondary">
          {t('home:sections.communityStats.realHidden')}
        </Text>
      </View>
    </SectionShell>
  );
}

const styles = StyleSheet.create({
  note: { paddingTop: 4 },
  noteText: { flex: 1 },
});
