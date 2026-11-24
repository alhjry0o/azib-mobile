import { useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import {
  Badge,
  Banner,
  Button,
  Card,
  EmptyState,
  ErrorState,
  Skeleton,
  Text,
  TextInput,
} from '@/components/ui';
import { authErrorKey } from '@/features/auth/errors';
import { useHomeFormatters } from '@/features/home/hooks/use-home-formatters';
import { useTheme } from '@/theme';
import { WeddingScaffold } from '../components/WeddingScaffold';
import { useWeddingGroup } from '../hooks/use-wedding-group';
import { useWeddingServices } from '../hooks/use-wedding-services';
import { can } from '../state/roles';

export function GroupServicesScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ id?: string }>();
  const groupId = params.id ?? '';
  const group = useWeddingGroup(groupId);
  const services = useWeddingServices(groupId);
  const format = useHomeFormatters();
  const [message, setMessage] = useState('');

  const role = group.data?.myRole ?? null;
  const canRequest = role !== null && can(role, 'request_service');

  return (
    <WeddingScaffold
      testID="group-services-screen"
      title={t('weddings:services.title')}
      subtitle={t('weddings:services.subtitle')}
    >
      <Banner variant="info" message={t('weddings:services.noPayment')} testID="services-no-payment" />
      {services.actionError ? (
        <Banner
          variant="error"
          message={t(authErrorKey(services.actionError))}
          testID="services-action-error"
        />
      ) : null}
      {services.isLoading ? <Skeleton variant="rect" height={110} /> : null}
      {services.error ? (
        <ErrorState
          title={t('weddings:discovery.errorTitle')}
          description={t('weddings:discovery.errorDescription')}
          testID="services-error"
        />
      ) : null}

      <Text variant="h3">{t('weddings:services.offersTitle')}</Text>
      {services.offers.length === 0 ? (
        <EmptyState
          icon="gift"
          title={t('weddings:services.offersEmpty')}
          description={t('weddings:services.offersEmptyDescription')}
          testID="services-offers-empty"
        />
      ) : null}
      {services.offers.map((offer) => (
        <Card key={offer.id} style={{ gap: theme.spacing[2] }} testID={`service-offer-${offer.id}`}>
          <Text variant="bodyStrong">{t(offer.titleKey)}</Text>
          <Badge
            variant="success"
            size="sm"
            label={format.percent(offer.discountPercent / 100)}
          />
          {canRequest ? (
            <Button
              variant="secondary"
              size="sm"
              loading={services.busy}
              label={t('weddings:services.request')}
              onPress={() => {
                void services.request(
                  offer.partnerId,
                  offer.titleKey,
                  message.trim().length > 0 ? message.trim() : t('weddings:services.defaultMessage'),
                );
              }}
              testID={`service-request-${offer.id}`}
            />
          ) : null}
        </Card>
      ))}

      {canRequest ? (
        <TextInput
          testID="services-message"
          label={t('weddings:services.message')}
          value={message}
          onChangeText={setMessage}
        />
      ) : null}

      <Text variant="h3">{t('weddings:services.requestsTitle')}</Text>
      {services.requests.length === 0 ? (
        <Text variant="body" color="secondary" testID="services-requests-empty">
          {t('weddings:services.requestsEmpty')}
        </Text>
      ) : null}
      {services.requests.map((request) => (
        <Card key={request.id} style={{ gap: theme.spacing[2] }} testID={`service-request-row-${request.id}`}>
          <Text variant="body">{request.message}</Text>
          <Badge
            variant={request.status === 'accepted' ? 'success' : 'pending'}
            size="sm"
            label={t(`weddings:services.status.${request.status}`)}
          />
          {request.reply ? (
            <Text variant="caption" color="secondary">
              {request.reply}
            </Text>
          ) : null}
          {canRequest && request.status === 'sent' ? (
            <Button
              variant="ghost"
              size="sm"
              label={t('weddings:services.markAccepted')}
              onPress={() => {
                void services.respond(request.id, 'accepted', t('weddings:services.acceptedReply'));
              }}
              testID={`service-accept-${request.id}`}
            />
          ) : null}
        </Card>
      ))}
    </WeddingScaffold>
  );
}
