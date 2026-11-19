import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Badge, Icon, ListItem } from '@/components/ui';
import { ROUTES, href } from '@/constants/routes';
import { useProviderContainer } from '@/providers';
import type { SoukItem } from '@/repositories/contracts/souk';
import type { Result } from '@/core/result';
import { SectionShell } from '../components/SectionShell';
import { useHomeSection } from '../hooks/use-home-section';

const MAX_ITEMS = 5;
const KNOWN_CATEGORIES = ['furniture', 'kitchenware', 'textiles'] as const;

function categoryKey(category: string): string {
  return (KNOWN_CATEGORIES as readonly string[]).includes(category)
    ? `home:categories.${category}`
    : 'home:categories.other';
}

export function SoukSection() {
  const { t } = useTranslation();
  const router = useRouter();
  const container = useProviderContainer();

  const section = useHomeSection<SoukItem>({
    id: 'souk',
    fetch: async (): Promise<Result<readonly SoukItem[]>> => {
      const listed = await container.repositories.souk.list({ limit: 50 });
      if (!listed.ok) return listed;
      return {
        ok: true,
        value: listed.value.items
          .filter((item) => item.status === 'available')
          .slice(0, MAX_ITEMS),
      };
    },
  });

  return (
    <SectionShell
      id="souk"
      title={t('home:sections.souk.title')}
      subtitle={t('home:sections.souk.subtitle')}
      status={section.status}
      emptyIcon="shoppingBag"
      emptyTitle={t('home:sections.souk.empty')}
      emptyDescription={t('home:sections.souk.emptyDescription')}
      actionLabel={t('home:sections.souk.viewAll')}
      onAction={() => router.navigate(href(ROUTES.features.souk))}
      onRetry={section.refetch}
    >
      {section.data.map((item) => (
        <ListItem
          key={item.id}
          variant="card"
          title={t(item.titleKey)}
          subtitle={t(categoryKey(item.category))}
          leading={<Icon name="shoppingBag" size={20} />}
          trailing={
            item.dataOrigin === 'demo' ? (
              <Badge variant="demo" size="sm" label={t('common:demo.badge')} />
            ) : undefined
          }
          onPress={() => router.navigate(href(ROUTES.features.souk))}
          testID={`souk-item-${item.id}`}
        />
      ))}
    </SectionShell>
  );
}
