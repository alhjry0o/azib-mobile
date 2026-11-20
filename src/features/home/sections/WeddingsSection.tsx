// Publication consent now exists on the Application contract (P08.1), but no
// approved case carries it yet in demo. The gate stays fail-closed (ADR-0024).
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Badge, Card, Text } from '@/components/ui';
import { ROUTES, href } from '@/constants/routes';
import { useProviderContainer } from '@/providers';
import type { Result } from '@/core/result';
import { useTheme } from '@/theme';
import { selectPublicSupportCases, type PublicSupportCase } from '../anonymize';
import type { PublicationConsent } from '../consent-gate';
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
      return {
        ok: true,
        value: selectPublicSupportCases(listed.value.items, consents).slice(0, MAX_ITEMS),
      };
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
            <Text variant="caption" color="secondary">
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
