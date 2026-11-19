import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Badge, Icon, ListItem } from '@/components/ui';
import { ROUTES, href } from '@/constants/routes';
import { useAuth } from '@/features/auth';
import { useProviderContainer } from '@/providers';
import type { Volunteer } from '@/repositories/contracts/volunteer';
import type { Result } from '@/core/result';
import { SectionShell } from '../../components/SectionShell';
import { useHomeSection } from '../../hooks/use-home-section';

export function VolunteerSection() {
  const { t } = useTranslation();
  const router = useRouter();
  const container = useProviderContainer();
  const auth = useAuth();
  const userId = auth.user?.id ?? null;

  const section = useHomeSection<Volunteer>({
    id: 'volunteer-tasks',
    enabled: userId !== null,
    fetch: async (): Promise<Result<readonly Volunteer[]>> => {
      if (!userId) return { ok: true, value: [] };
      const listed = await container.repositories.volunteers.list({ limit: 100 });
      if (!listed.ok) return listed;
      return { ok: true, value: listed.value.items.filter((row) => row.userId === userId) };
    },
  });

  return (
    <SectionShell
      id="volunteer"
      title={t('home:roles.volunteer.title')}
      status={section.status}
      emptyIcon="userCheck"
      emptyTitle={t('home:roles.volunteer.empty')}
      emptyDescription={t('home:roles.volunteer.emptyDescription')}
      actionLabel={t('home:roles.volunteer.action')}
      onAction={() => router.navigate(href(ROUTES.features.volunteers))}
      onRetry={section.refetch}
    >
      {section.data.map((row) => (
        <ListItem
          key={row.id}
          variant="card"
          title={t(row.skillKey)}
          subtitle={t(
            row.status === 'active'
              ? 'home:roles.volunteer.active'
              : 'home:roles.volunteer.inactive',
          )}
          leading={<Icon name="userCheck" size={20} />}
          trailing={
            row.dataOrigin === 'demo' ? (
              <Badge variant="demo" size="sm" label={t('common:demo.badge')} />
            ) : undefined
          }
          onPress={() => router.navigate(href(ROUTES.features.volunteers))}
          testID={`volunteer-row-${row.id}`}
        />
      ))}
    </SectionShell>
  );
}
