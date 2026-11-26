import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import {
  Badge,
  Banner,
  Button,
  Card,
  EmptyState,
  ErrorState,
  Skeleton,
  Text,
} from '@/components/ui';
import { ROUTES, href } from '@/constants/routes';
import { useTheme } from '@/theme';
import { ConditionBadge, DeliveryBadge, SoukItemStatusBadge, SoukRequestStatusBadge } from '../components/SoukBadges';
import { SoukImageGallery } from '../components/SoukImageGallery';
import { SoukScaffold } from '../components/SoukScaffold';
import { useSoukItem } from '../hooks/use-souk-item';
import { categoryLabelKey } from '../state/filters';

export function SoukItemDetailScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ id?: string }>();
  const itemId = params.id ?? '';
  const detail = useSoukItem(itemId);
  const data = detail.data;

  return (
    <SoukScaffold
      testID="souk-detail-screen"
      title={t('marketplace:souk.detail.title')}
      notConnectedRetry={detail.refetch}
    >
      {detail.isLoading ? <Skeleton variant="rect" height={160} /> : null}
      {detail.error ? (
        <ErrorState
          title={t('marketplace:souk.browser.errorTitle')}
          description={t('marketplace:souk.browser.errorDescription')}
          onRetry={detail.refetch}
          testID="souk-detail-error"
        />
      ) : null}
      {!detail.isLoading && !detail.error && !data ? (
        <EmptyState
          icon="info"
          title={t('marketplace:souk.detail.notFound')}
          description={t('marketplace:souk.detail.notFoundDescription')}
          testID="souk-detail-missing"
        />
      ) : null}

      {data ? (
        <>
          <Card variant="crest" style={{ gap: theme.spacing[3] }} testID="souk-detail-card">
            <Text variant="h2">{data.item.title ?? t(data.item.titleKey)}</Text>
            <View style={{ gap: theme.spacing[2] }}>
              <ConditionBadge condition={data.item.condition} testID="souk-detail-condition" />
              <DeliveryBadge method={data.item.deliveryMethod} />
              <SoukItemStatusBadge status={data.item.status} testID="souk-detail-status" />
            </View>
            <Text variant="caption" color="secondary">
              {t(categoryLabelKey(data.item.category))}
            </Text>
            {data.item.governorateId ? (
              <Text variant="caption" color="secondary" testID="souk-detail-area">
                {t(`profile:locations.${data.item.governorateId}`)}
              </Text>
            ) : null}
            <SoukImageGallery fileIds={data.item.imageFileIds} testID="souk-detail-images" />
            {data.item.description ? (
              <Text variant="body" color="secondary" testID="souk-detail-description">
                {data.item.description}
              </Text>
            ) : null}
            {data.item.dataOrigin === 'demo' ? (
              <Badge variant="demo" size="sm" label={t('marketplace:souk.demo.badge')} />
            ) : null}
          </Card>

          <Banner
            variant="info"
            message={t('marketplace:souk.detail.privacyNote')}
            testID="souk-detail-privacy"
          />
          <Banner
            variant="warning"
            message={t('marketplace:souk.detail.noResaleNote')}
            testID="souk-detail-no-resale"
          />

          {data.isOwner ? (
            <Button
              fullWidth
              variant="secondary"
              label={t('marketplace:souk.mine.title')}
              onPress={() => router.replace(href(ROUTES.souk.mine))}
              testID="souk-detail-own"
            />
          ) : null}

          {data.myRequest ? (
            <Card style={{ gap: theme.spacing[2] }} testID="souk-detail-my-request">
              <Text variant="bodyStrong">{t('marketplace:souk.requests.title')}</Text>
              <SoukRequestStatusBadge
                status={data.myRequest.status}
                testID="souk-detail-my-request-status"
              />
              <Button
                variant="ghost"
                size="sm"
                label={t('marketplace:souk.requests.title')}
                onPress={() => router.push(href(ROUTES.souk.requests))}
                testID="souk-detail-open-requests"
              />
            </Card>
          ) : null}

          {data.canRequest && !data.myRequest ? (
            <Button
              fullWidth
              leftIcon="heart"
              label={t('marketplace:souk.request.title')}
              onPress={() => router.push(href(ROUTES.souk.request(itemId)))}
              testID="souk-detail-request"
            />
          ) : null}

          {!data.canRequest && !data.isOwner && !data.myRequest ? (
            <Text variant="body" color="secondary" testID="souk-detail-unavailable">
              {t('marketplace:souk.detail.unavailable')}
            </Text>
          ) : null}
        </>
      ) : null}
    </SoukScaffold>
  );
}
