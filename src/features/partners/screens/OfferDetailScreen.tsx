import { useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Platform, StyleSheet, View } from 'react-native';
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
import { authErrorKey } from '@/features/auth/errors';
import { useShellStore } from '@/stores';
import { useTheme } from '@/theme';
import { DiscountValue } from '../components/DiscountValue';
import { PartnerScaffold } from '../components/PartnerScaffold';
import { ReportOfferForm } from '../components/ReportOfferForm';
import { ValidityCountdown } from '../components/ValidityCountdown';
import { VerifiedCrown } from '../components/VerifiedCrown';
import { useOfferActions } from '../hooks/use-offer-actions';
import { useOfferDetail } from '../hooks/use-offer-detail';
import {
  buildMapsUrl,
  buildTelUrl,
  buildWhatsAppUrl,
  type MapsPlatform,
} from '../lib/external-links';
import { openExternalUrl, shareText } from '../services/external-actions';

function mapsPlatform(): MapsPlatform {
  if (Platform.OS === 'android') return 'android';
  if (Platform.OS === 'ios') return 'ios';
  return 'web';
}

export function OfferDetailScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ offerId?: string }>();
  const offerId = params.offerId ?? '';
  const detail = useOfferDetail(offerId);
  const actions = useOfferActions(offerId);
  const openDialog = useShellStore((s) => s.openDialog);
  const [reporting, setReporting] = useState(false);
  const [reported, setReported] = useState(false);
  const [externalError, setExternalError] = useState<string | null>(null);

  const data = detail.data;
  const partner = data?.partner ?? null;
  const phone = partner?.contactPhone ?? null;
  const whatsapp = partner?.whatsapp ?? phone;

  const telUrl = phone ? buildTelUrl(phone) : null;
  const waUrl = whatsapp ? buildWhatsAppUrl(whatsapp) : null;
  const mapsUrl = partner
    ? buildMapsUrl(
        {
          latitude: partner.latitude ?? null,
          longitude: partner.longitude ?? null,
          query: partner.city ?? partner.displayName,
        },
        mapsPlatform(),
      )
    : null;

  const openWithConfirm = (url: string, titleKey: string, descriptionKey: string): void => {
    openDialog({
      title: t(titleKey),
      description: t(descriptionKey),
      confirmLabel: t('marketplace:external.confirm'),
      cancelLabel: t('common:buttons.cancel'),
      onConfirm: () => {
        void openExternalUrl(url).then((result) => {
          setExternalError(result.ok ? null : 'marketplace:external.failed');
        });
      },
    });
  };

  const call = (): void => {
    if (!telUrl || !telUrl.ok) return;
    void openExternalUrl(telUrl.value).then((result) => {
      setExternalError(result.ok ? null : 'marketplace:external.failed');
    });
  };

  const share = (): void => {
    if (!data) return;
    const title = data.offer.title ?? t(data.offer.titleKey);
    const message = `${title}\n${partner?.displayName ?? ''}\nazib://partners/offers/${data.offer.id}`;
    void shareText(message).then((result) => {
      setExternalError(result.ok ? null : 'marketplace:external.failed');
    });
  };

  const submitReport = (reasonKey: string, text: string): void => {
    void actions.report(reasonKey, text).then((result) => {
      if (result.ok) {
        setReporting(false);
        setReported(true);
      }
    });
  };

  return (
    <PartnerScaffold
      testID="offer-detail-screen"
      title={t('marketplace:detail.title')}
      notConnectedRetry={detail.refetch}
    >
      {detail.isLoading ? <Skeleton variant="rect" height={160} /> : null}
      {detail.error ? (
        <ErrorState
          title={t('marketplace:browser.errorTitle')}
          description={t('marketplace:browser.errorDescription')}
          onRetry={detail.refetch}
          testID="offer-detail-error"
        />
      ) : null}
      {!detail.isLoading && !detail.error && !data ? (
        <EmptyState
          icon="info"
          title={t('marketplace:detail.notFound')}
          description={t('marketplace:detail.notFoundDescription')}
          testID="offer-detail-missing"
        />
      ) : null}

      {data ? (
        <>
          <Card variant="crest" style={{ gap: theme.spacing[3] }} testID="offer-summary">
            <Text variant="h2">{data.offer.title ?? t(data.offer.titleKey)}</Text>
            <DiscountValue offer={data.offer} testID="offer-detail-discount" />
            <ValidityCountdown
              visibility={data.visibility}
              daysLeft={data.daysLeft}
              testID="offer-detail-validity"
            />
            <VerifiedCrown verified={data.verified} testID="offer-detail-crown" />
            <Badge
              variant="neutral"
              size="sm"
              label={t(`marketplace:audience.${data.offer.audience ?? 'beneficiaries'}`)}
            />
            {data.offer.dataOrigin === 'demo' ? (
              <Badge variant="demo" size="sm" label={t('marketplace:demo.partnerBadge')} />
            ) : null}
          </Card>

          <Banner
            variant="warning"
            message={t('marketplace:detail.audienceNote')}
            testID="offer-audience-note"
          />

          {data.offer.products && data.offer.products.length > 0 ? (
            <Card style={{ gap: theme.spacing[2] }} testID="offer-products">
              <Text variant="h3">{t('marketplace:detail.products')}</Text>
              {data.offer.products.map((product) => (
                <Text key={product} variant="body" color="secondary">
                  {product}
                </Text>
              ))}
            </Card>
          ) : null}

          {data.offer.terms ? (
            <Card style={{ gap: theme.spacing[2] }} testID="offer-terms">
              <Text variant="h3">{t('marketplace:detail.terms')}</Text>
              <Text variant="body" color="secondary">
                {data.offer.terms}
              </Text>
            </Card>
          ) : null}

          <Card style={{ gap: theme.spacing[2] }} testID="offer-how">
            <Text variant="h3">{t('marketplace:detail.how')}</Text>
            <Text variant="body" color="secondary">
              {t('marketplace:detail.howNote')}
            </Text>
            <Text variant="caption" color="secondary">
              {data.views.kind === 'value'
                ? t('marketplace:detail.views', { count: data.views.value })
                : t('marketplace:detail.viewsSuppressed')}
            </Text>
          </Card>

          {externalError ? (
            <Banner variant="error" message={t(externalError)} testID="offer-external-error" />
          ) : null}
          {actions.error ? (
            <Banner
              variant="error"
              message={t(authErrorKey(actions.error))}
              testID="offer-action-error"
            />
          ) : null}

          <View style={{ gap: theme.spacing[2] }}>
            <Button
              fullWidth
              leftIcon="phone"
              disabled={!telUrl || !telUrl.ok}
              label={
                telUrl && telUrl.ok
                  ? t('marketplace:actions.call')
                  : t('marketplace:actions.noPhone')
              }
              onPress={call}
              testID="offer-call"
            />
            <Button
              fullWidth
              variant="secondary"
              leftIcon="message"
              disabled={!waUrl || !waUrl.ok}
              label={
                waUrl && waUrl.ok
                  ? t('marketplace:actions.whatsapp')
                  : t('marketplace:actions.noPhone')
              }
              onPress={() => {
                if (waUrl && waUrl.ok) {
                  openWithConfirm(
                    waUrl.value,
                    'marketplace:external.whatsappTitle',
                    'marketplace:external.whatsappDescription',
                  );
                }
              }}
              testID="offer-whatsapp"
            />
            <Button
              fullWidth
              variant="secondary"
              leftIcon="mapPin"
              disabled={!mapsUrl || !mapsUrl.ok}
              label={t('marketplace:actions.maps')}
              onPress={() => {
                if (mapsUrl && mapsUrl.ok) {
                  openWithConfirm(
                    mapsUrl.value,
                    'marketplace:external.mapsTitle',
                    'marketplace:external.mapsDescription',
                  );
                }
              }}
              testID="offer-maps"
            />
            <Button
              fullWidth
              variant="ghost"
              leftIcon="sparkles"
              label={t('marketplace:actions.share')}
              onPress={share}
              testID="offer-share"
            />
            <Button
              fullWidth
              variant={data.saved ? 'secondary' : 'ghost'}
              leftIcon="heart"
              loading={actions.busy}
              label={
                data.saved ? t('marketplace:actions.unsave') : t('marketplace:actions.save')
              }
              onPress={() => {
                void (data.saved ? actions.unsave() : actions.save());
              }}
              testID="offer-save"
            />
            <Button
              fullWidth
              variant="ghost"
              leftIcon="alertTriangle"
              label={t('marketplace:actions.report')}
              onPress={() => setReporting(true)}
              testID="offer-report"
            />
          </View>

          {reported ? (
            <Banner
              variant="info"
              message={t('marketplace:report.received')}
              testID="offer-report-received"
            />
          ) : null}

          {reporting ? (
            <ReportOfferForm
              busy={actions.busy}
              onSubmit={submitReport}
              onCancel={() => setReporting(false)}
            />
          ) : null}
        </>
      ) : null}
    </PartnerScaffold>
  );
}

const styles = StyleSheet.create({
  spacer: { height: 8 },
});

void styles;
