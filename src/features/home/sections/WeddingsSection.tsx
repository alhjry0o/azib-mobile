import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { FlatList, StyleSheet, View, useWindowDimensions } from 'react-native';
import { Badge, Card, Icon, Text } from '@/components/ui';
import { ROUTES, href } from '@/constants/routes';
import { useDirection } from '@/hooks';
import { useProviderContainer } from '@/providers';
import type { Wedding } from '@/repositories/contracts/wedding';
import type { Result } from '@/core/result';
import { useTheme } from '@/theme';
import { SectionShell } from '../components/SectionShell';
import { useHomeFormatters } from '../hooks/use-home-formatters';
import { useHomeSection } from '../hooks/use-home-section';

const MAX_ITEMS = 6;

export function WeddingsSection() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const { isRTL } = useDirection();
  const { width } = useWindowDimensions();
  const container = useProviderContainer();
  const format = useHomeFormatters();

  const section = useHomeSection<Wedding>({
    id: 'weddings',
    fetch: async (): Promise<Result<readonly Wedding[]>> => {
      const listed = await container.repositories.weddings.list({ limit: 50 });
      if (!listed.ok) return listed;
      const open = listed.value.items
        .filter((item) => item.status === 'open')
        .sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate))
        .slice(0, MAX_ITEMS);
      return { ok: true, value: open };
    },
  });

  const cardWidth = Math.max(220, width - theme.spacing[4] * 2 - theme.spacing[6]);

  return (
    <SectionShell
      id="weddings"
      title={t('home:sections.weddings.title')}
      subtitle={t('home:sections.weddings.subtitle')}
      status={section.status}
      emptyIcon="heart"
      emptyTitle={t('home:sections.weddings.empty')}
      emptyDescription={t('home:sections.weddings.emptyDescription')}
      actionLabel={t('home:sections.weddings.viewAll')}
      onAction={() => router.navigate(href(ROUTES.tabs.weddings))}
      onRetry={section.refetch}
    >
      <FlatList
        horizontal
        data={section.data}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        inverted={isRTL}
        contentContainerStyle={{ gap: theme.spacing[3] }}
        testID="weddings-carousel"
        renderItem={({ item }) => (
          <Card
            variant="crest"
            style={{ width: cardWidth, gap: theme.spacing[2] }}
            testID={`weddings-card-${item.id}`}
          >
            <Text variant="h3" numberOfLines={2}>
              {t(item.titleKey)}
            </Text>
            <View
              style={[
                styles.metaRow,
                { flexDirection: isRTL ? 'row-reverse' : 'row', gap: theme.spacing[2] },
              ]}
            >
              <Icon name="calendar" size={16} color={theme.colors.text.secondary} />
              <Text variant="caption" color="secondary">
                {format.date(item.scheduledDate)}
              </Text>
            </View>
            <View
              style={[
                styles.metaRow,
                { flexDirection: isRTL ? 'row-reverse' : 'row', gap: theme.spacing[2] },
              ]}
            >
              <Icon name="users" size={16} color={theme.colors.text.secondary} />
              <Text variant="caption" color="secondary">
                {t('home:sections.weddings.capacity', { count: format.number(item.capacity) })}
              </Text>
            </View>
            {item.dataOrigin === 'demo' ? (
              <Badge variant="demo" size="sm" label={t('common:demo.badge')} />
            ) : null}
          </Card>
        )}
      />
    </SectionShell>
  );
}

const styles = StyleSheet.create({
  metaRow: { alignItems: 'center' },
});
