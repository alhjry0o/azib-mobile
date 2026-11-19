// Partner owners have no account↔partner link until P11. We never guess or
// show another partner's data: an honest state with a real destination.
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Button, Card, Text } from '@/components/ui';
import { ROUTES, href } from '@/constants/routes';
import { useTheme } from '@/theme';

export function PartnerSummarySection() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <Card
      variant="crest"
      style={{ marginHorizontal: theme.spacing[4], gap: theme.spacing[2] }}
      testID="role-partner"
    >
      <Text variant="h3">{t('home:roles.partner.title')}</Text>
      <Text variant="body" color="secondary">
        {t('home:roles.partner.description')}
      </Text>
      <Button
        variant="secondary"
        size="sm"
        leftIcon="gift"
        label={t('home:roles.partner.action')}
        onPress={() => router.navigate(href(ROUTES.tabs.partners))}
        testID="role-partner-action"
      />
    </Card>
  );
}
