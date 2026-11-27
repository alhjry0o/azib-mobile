import { useTranslation } from 'react-i18next';
import { Badge, Card, Text } from '@/components/ui';
import { useTheme } from '@/theme';
import type { PartyRequestView } from '../state/public-view';

export interface HandoverCodeCardProps {
  readonly request: PartyRequestView;
  readonly testID?: string;
}

export function HandoverCodeCard({ request, testID }: HandoverCodeCardProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const both = Boolean(request.donorConfirmedAt) && Boolean(request.recipientConfirmedAt);

  return (
    <Card style={{ gap: theme.spacing[2] }} testID={testID}>
      <Text variant="h3">{t('marketplace:souk.coordination.handoverTitle')}</Text>
      {request.handoverCode ? (
        <Text variant="h2" color="gold" testID={testID ? `${testID}-code` : undefined}>
          {request.handoverCode}
        </Text>
      ) : null}
      <Badge variant="demo" size="sm" label={t('marketplace:souk.handover.demoNote')} />
      <Badge
        variant={request.donorConfirmedAt ? 'success' : 'pending'}
        size="sm"
        label={t('marketplace:souk.handover.donorState')}
        testID={testID ? `${testID}-donor` : undefined}
      />
      <Badge
        variant={request.recipientConfirmedAt ? 'success' : 'pending'}
        size="sm"
        label={t('marketplace:souk.handover.recipientState')}
        testID={testID ? `${testID}-recipient` : undefined}
      />
      <Text variant="caption" color="secondary">
        {both
          ? t('marketplace:souk.handover.bothConfirmed')
          : t('marketplace:souk.handover.waiting')}
      </Text>
    </Card>
  );
}
