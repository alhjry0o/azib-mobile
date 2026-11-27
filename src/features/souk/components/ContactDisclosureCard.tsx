import { useTranslation } from 'react-i18next';
import { Badge, Banner, Card, Switch, Text } from '@/components/ui';
import { useTheme } from '@/theme';
import type { DisclosureView } from '../services/coordination-service';

export interface ContactDisclosureCardProps {
  readonly disclosure: DisclosureView | null;
  readonly myConsent: boolean;
  readonly busy: boolean;
  readonly onConsentChange: (value: boolean) => void;
  readonly testID?: string;
}

/** Progressive disclosure: the number appears only when the service says so. */
export function ContactDisclosureCard({
  disclosure,
  myConsent,
  busy,
  onConsentChange,
  testID,
}: ContactDisclosureCardProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const state = disclosure?.state ?? 'not_accepted';
  const phone = disclosure?.phone ?? null;

  return (
    <Card style={{ gap: theme.spacing[3] }} testID={testID}>
      <Text variant="h3">{t('marketplace:souk.coordination.consentTitle')}</Text>
      <Switch
        value={myConsent}
        onValueChange={onConsentChange}
        disabled={busy || state === 'not_accepted' || state === 'not_a_party'}
        label={t('marketplace:souk.coordination.consentMine')}
        labelFirst
        testID={testID ? `${testID}-switch` : undefined}
      />
      <Text variant="caption" color="secondary">
        {t('marketplace:souk.coordination.consentNote')}
      </Text>
      {phone ? (
        <>
          <Text variant="h3" color="gold" testID={testID ? `${testID}-phone` : undefined}>
            {phone}
          </Text>
          <Badge variant="verified" size="sm" label={t('marketplace:souk.coordination.revealed')} />
          <Text variant="caption" color="secondary">
            {t('marketplace:souk.coordination.callNote')}
          </Text>
        </>
      ) : (
        <Banner
          variant="info"
          message={t(disclosure?.reasonKey ?? 'marketplace:souk.disclosure.not_accepted')}
          testID={testID ? `${testID}-reason` : undefined}
        />
      )}
    </Card>
  );
}
