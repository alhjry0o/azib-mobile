// D-3: ContentRecord has no publication consent, so no story is shown.
// The account-level optional consent is surfaced honestly when present.
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { Badge, Card, Text } from '@/components/ui';
import { ROUTES, href } from '@/constants/routes';
import { useProviderContainer } from '@/providers';
import type { Result } from '@/core/result';
import { useSettingsStore } from '@/stores';
import { useTheme } from '@/theme';
import { SectionShell } from '../components/SectionShell';
import { useHomeSection } from '../hooks/use-home-section';
import type { PublicationConsent } from '../consent-gate';
import { selectPublicStories, type PublicStory } from '../success-stories';

const MAX_ITEMS = 3;

/** No per-story consent source exists in the P03 contracts (D-3). */
const STORY_CONSENTS: readonly PublicationConsent[] = [];

export function SuccessStoriesSection() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const container = useProviderContainer();
  const storiesConsent = useSettingsStore((s) => s.storiesConsent);

  const section = useHomeSection<PublicStory>({
    id: 'success-stories',
    fetch: async (): Promise<Result<readonly PublicStory[]>> => {
      const listed = await container.repositories.content.list({ limit: 50 });
      if (!listed.ok) return listed;
      return {
        ok: true,
        value: selectPublicStories(listed.value.items, STORY_CONSENTS).slice(0, MAX_ITEMS),
      };
    },
  });

  return (
    <View style={{ gap: theme.spacing[2] }}>
      <SectionShell
        id="success-stories"
        title={t('home:sections.success-stories.title')}
        subtitle={t('home:sections.success-stories.subtitle')}
        status={section.status}
        emptyIcon="heart"
        emptyTitle={t('home:sections.success-stories.empty')}
        emptyDescription={t('home:sections.success-stories.emptyDescription')}
        emptyAction={{
          label: t('home:sections.success-stories.action'),
          onPress: () => router.navigate(href(ROUTES.features.learn)),
        }}
        onRetry={section.refetch}
      >
        {section.data.map((story) => (
          <Card key={story.id} testID={`story-${story.id}`} style={{ gap: theme.spacing[2] }}>
            <Text variant="h3">{t(story.titleKey)}</Text>
            <Text variant="body" color="secondary">
              {t(story.bodyKey)}
            </Text>
            {story.dataOrigin === 'demo' ? (
              <Badge variant="demo" size="sm" label={t('common:demo.badge')} />
            ) : null}
          </Card>
        ))}
      </SectionShell>
      {storiesConsent ? (
        <Text
          variant="caption"
          color="secondary"
          style={[styles.note, { paddingHorizontal: theme.spacing[4] }]}
          testID="stories-consent-note"
        >
          {t('home:sections.success-stories.consentRecorded')}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  note: { paddingBottom: 4 },
});
