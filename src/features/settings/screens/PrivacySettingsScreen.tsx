import { useTranslation } from 'react-i18next';
import { Banner, Card, ListItem, SegmentedControl, Switch, Text } from '@/components/ui';
import { useAuth } from '@/features/auth';
import { useSettingsStore, type ProfileVisibility } from '@/stores';
import { useTheme } from '@/theme';
import { SettingsScaffold } from '../components/SettingsScaffold';

export function PrivacySettingsScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const auth = useAuth();
  const visibility = useSettingsStore((s) => s.visibility);
  const setVisibility = useSettingsStore((s) => s.setVisibility);
  const storiesConsent = useSettingsStore((s) => s.storiesConsent);
  const setStoriesConsent = useSettingsStore((s) => s.setStoriesConsent);
  const consents = auth.user?.consents ?? [];

  return (
    <SettingsScaffold
      testID="settings-privacy-screen"
      title={t('profile:settings.rows.privacy')}
      guardBackend
    >
      <Card style={{ gap: theme.spacing[3] }}>
        <Text variant="h3">{t('profile:settings.privacy.visibilityTitle')}</Text>
        <SegmentedControl<ProfileVisibility>
          segments={[
            { value: 'private', label: t('profile:settings.privacy.private') },
            { value: 'reviewers', label: t('profile:settings.privacy.reviewers') },
          ]}
          value={visibility}
          onChange={setVisibility}
          testID="privacy-visibility-control"
        />
        <Text variant="caption" color="secondary">
          {t('profile:settings.privacy.visibilityNote')}
        </Text>
      </Card>

      <Card style={{ gap: theme.spacing[3] }}>
        <Text variant="h3">{t('profile:settings.privacy.storiesTitle')}</Text>
        <Switch
          value={storiesConsent}
          onValueChange={setStoriesConsent}
          label={t('profile:settings.privacy.storiesToggle')}
          labelFirst
          testID="privacy-stories"
        />
        <Text variant="caption" color="secondary">
          {t('profile:settings.privacy.storiesNote')}
        </Text>
      </Card>

      <Text variant="h3">{t('profile:settings.privacy.consentsTitle')}</Text>
      {consents.length === 0 ? (
        <Text variant="body" color="secondary" testID="privacy-no-consents">
          {t('profile:settings.privacy.noConsents')}
        </Text>
      ) : (
        consents.map((consent) => (
          <ListItem
            key={`${consent.docId}-${consent.version}`}
            variant="card"
            title={t(`profile:settings.privacy.doc.${consent.docId}`)}
            subtitle={`${consent.version} · ${consent.acceptedAt}`}
            testID={`privacy-consent-${consent.docId}`}
          />
        ))
      )}
      <Banner
        variant="info"
        message={t('profile:settings.privacy.withdrawNote')}
        testID="privacy-withdraw-note"
      />
    </SettingsScaffold>
  );
}
