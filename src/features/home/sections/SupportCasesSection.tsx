// Publication consent lives on the Application contract (P08.1) and is
// captured at submit time (P08.2). The gate stays fail-closed (ADR-0024):
// no active consent ⇒ no card. Governorate comes from the applicant payload;
// a need category is not collected yet, so the generic label stays honest.
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Badge, Card, Text } from '@/components/ui';
import { ROUTES, href } from '@/constants/routes';
import { useProviderContainer } from '@/providers';
import type { Result } from '@/core/result';
import { useTheme } from '@/theme';
import { toPublicSupportCase, type PublicSupportCase } from '../anonymize';
import { indexConsents, type PublicationConsent } from '../consent-gate';
import { SectionShell } from '../components/SectionShell';
import { useHomeSection } from '../hooks/use-home-section';

const MAX_ITEMS = 4;

export function SupportCasesSection() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const container = useProviderContainer();

  const section = useHomeSection<PublicSupportCase>({
    id: 'support-cases',
    fetch: async (): Promise<Result<readonly PublicSupportCase[]>> => {
      const listed = await container.repositories.applications.list({
        limit: 50,
        status: 'approved',
      });
      if (!listed.ok) return listed;

      const consents: PublicationConsent[] = [];
      for (const application of listed.value.items) {
        const record = application.publicationConsent;
        if (!record) continue;
        consents.push({
          subjectId: application.id,
          grantedAt: record.grantedAt,
          revokedAt: record.revokedAt,
        });
      }
      const index = indexConsents(consents);

      const published: PublicSupportCase[] = [];
      for (const application of listed.value.items) {
        const governorateId = application.payload?.applicant.governorateId ?? null;
        const projection = toPublicSupportCase(application, index.get(application.id), {
          governorateKey: governorateId ? `profile:locations.${governorateId}` : null,
        });
        if (projection) published.push(projection);
      }
      return { ok: true, value: published.slice(0, MAX_ITEMS) };
    },
  });

  return (
    <SectionShell
      id="support-cases"
      title={t('home:sections.support-cases.title')}
      subtitle={t('home:sections.support-cases.subtitle')}
      status={section.status}
      emptyIcon="shield"
      emptyTitle={t('home:sections.support-cases.empty')}
      emptyDescription={t('home:sections.support-cases.emptyDescription')}
      emptyAction={{
        label: t('home:sections.support-cases.action'),
        onPress: () => router.navigate(href(ROUTES.assistance.root)),
      }}
      onRetry={section.refetch}
    >
      {section.data.map((item) => (
        <Card key={item.id} testID={`support-case-${item.id}`} style={{ gap: theme.spacing[2] }}>
          <Text variant="bodyStrong">{t(item.categoryKey)}</Text>
          {item.governorateKey ? (
            <Text variant="caption" color="secondary" testID={`support-case-gov-${item.id}`}>
              {t(item.governorateKey)}
            </Text>
          ) : null}
          {item.dataOrigin === 'demo' ? (
            <Badge variant="demo" size="sm" label={t('common:demo.badge')} />
          ) : null}
        </Card>
      ))}
    </SectionShell>
  );
}
