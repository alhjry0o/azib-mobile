// Current initiatives = open programs (D-4). Program amounts are NOT shown:
// eligibility thresholds are an unapproved human decision (PRODUCT_POLICIES #1).
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Badge, Card, Text } from '@/components/ui';
import { ROUTES, href } from '@/constants/routes';
import { useProviderContainer } from '@/providers';
import type { Program } from '@/repositories/contracts/program';
import type { Result } from '@/core/result';
import { useTheme } from '@/theme';
import { SectionShell } from '../components/SectionShell';
import { useHomeSection } from '../hooks/use-home-section';

const MAX_ITEMS = 4;

export function InitiativesSection() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const container = useProviderContainer();

  const section = useHomeSection<Program>({
    id: 'initiatives',
    fetch: async (): Promise<Result<readonly Program[]>> => {
      const listed = await container.repositories.programs.list({ limit: 50 });
      if (!listed.ok) return listed;
      return {
        ok: true,
        value: listed.value.items
          .filter((program) => program.status === 'open')
          .slice(0, MAX_ITEMS),
      };
    },
  });

  return (
    <SectionShell
      id="initiatives"
      title={t('home:sections.initiatives.title')}
      subtitle={t('home:sections.initiatives.subtitle')}
      status={section.status}
      emptyIcon="sparkles"
      emptyTitle={t('home:sections.initiatives.empty')}
      emptyDescription={t('home:sections.initiatives.emptyDescription')}
      actionLabel={t('home:sections.initiatives.viewAll')}
      onAction={() => router.navigate(href(ROUTES.features.assistance))}
      onRetry={section.refetch}
    >
      {section.data.map((program) => (
        <Card
          key={program.id}
          variant="crest"
          style={{ gap: theme.spacing[2] }}
          testID={`initiative-${program.id}`}
        >
          <Text variant="h3">{t(program.nameKey)}</Text>
          <Text variant="body" color="secondary">
            {t(program.descriptionKey)}
          </Text>
          <Badge variant="success" size="sm" label={t('home:sections.initiatives.open')} />
          {program.dataOrigin === 'demo' ? (
            <Badge variant="demo" size="sm" label={t('common:demo.badge')} />
          ) : null}
        </Card>
      ))}
    </SectionShell>
  );
}
