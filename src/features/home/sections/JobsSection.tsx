// Open jobs only. No contact details are ever rendered (AGENT_RULES #20).
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Badge, Icon, ListItem } from '@/components/ui';
import { ROUTES, href } from '@/constants/routes';
import { useProviderContainer } from '@/providers';
import type { Job } from '@/repositories/contracts/job';
import type { Result } from '@/core/result';
import { SectionShell } from '../components/SectionShell';
import { useHomeSection } from '../hooks/use-home-section';

const MAX_ITEMS = 5;

export function JobsSection() {
  const { t } = useTranslation();
  const router = useRouter();
  const container = useProviderContainer();

  const section = useHomeSection<Job>({
    id: 'jobs',
    fetch: async (): Promise<Result<readonly Job[]>> => {
      const listed = await container.repositories.jobs.list({ limit: 50 });
      if (!listed.ok) return listed;
      return {
        ok: true,
        value: listed.value.items.filter((item) => item.status === 'open').slice(0, MAX_ITEMS),
      };
    },
  });

  return (
    <SectionShell
      id="jobs"
      title={t('home:sections.jobs.title')}
      subtitle={t('home:sections.jobs.subtitle')}
      status={section.status}
      emptyIcon="users"
      emptyTitle={t('home:sections.jobs.empty')}
      emptyDescription={t('home:sections.jobs.emptyDescription')}
      actionLabel={t('home:sections.jobs.viewAll')}
      onAction={() => router.navigate(href(ROUTES.features.jobs))}
      onRetry={section.refetch}
    >
      {section.data.map((job) => (
        <ListItem
          key={job.id}
          variant="card"
          title={t(job.titleKey)}
          subtitle={t('home:sections.jobs.open')}
          leading={<Icon name="users" size={20} />}
          trailing={
            job.dataOrigin === 'demo' ? (
              <Badge variant="demo" size="sm" label={t('common:demo.badge')} />
            ) : undefined
          }
          onPress={() => router.navigate(href(ROUTES.features.jobs))}
          testID={`jobs-item-${job.id}`}
        />
      ))}
    </SectionShell>
  );
}
