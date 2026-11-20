// D-3: the Application contract carries no publication consent, so NO case is
// published. The query and the anonymizing projection are real and ready for
// P08/P18; until then the section is honestly empty with the reason shown.
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

/** No publication-consent source exists in the P03 contracts (D-3). */
const PUBLICATION_CONSENTS: readonly PublicationConsent[] = [];

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
      return {
        ok: true,
        value: selectPublicSupportCases(listed.value.items, PUBLICATION_CONSENTS).slice(
          0,
          MAX_ITEMS,
        ),
      };
    },
  });

  return (
    <SectionShell
      id="support-cases"
      title={t('home:sections.supportCases.title')}
      subtitle={t('home:sections.supportCases.subtitle')}
      status={section.status}
      emptyIcon="shield"
      emptyTitle={t('home:sections.supportCases.empty')}
      emptyDescription={t('home:sections.supportCases.emptyDescription')}
      emptyAction={{
        label: t('home:sections.supportCases.action'),
        onPress: () => router.navigate(href(ROUTES.features.assistance)),
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
