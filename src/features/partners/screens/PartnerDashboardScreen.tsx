import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import {
  Badge,
  Banner,
  Button,
  Card,
  EmptyState,
  ErrorState,
  ListItem,
  Skeleton,
  Text,
} from '@/components/ui';
import { ROUTES, href } from '@/constants/routes';
import { useHomeFormatters } from '@/features/home/hooks/use-home-formatters';
import { useTheme } from '@/theme';
import { OfferStatusBadge } from '../components/OfferStatusBadge';
import { MediaUploadField } from '../components/MediaUploadField';
import { PartnerScaffold } from '../components/PartnerScaffold';
import { ValidityCountdown } from '../components/ValidityCountdown';
import { VerificationStatusBadge } from '../components/VerificationStatusBadge';
import { VerifiedCrown } from '../components/VerifiedCrown';
import { useMyPartner } from '../hooks/use-my-partner';
import { useOfferComposer } from '../hooks/use-offer-composer';
import { usePartnerRegistration } from '../hooks/use-partner-registration';
import { toOfferWorkflowStatus } from '../state/offer-machine';
import { toPartnerWorkflowStatus } from '../state/partner-machine';

export function PartnerDashboardScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const mine = useMyPartner();
  const composer = useOfferComposer();
  const registration = usePartnerRegistration();
  const format = useHomeFormatters();

  const data = mine.data;
  const partner = data?.partner ?? null;
  const status = partner ? toPartnerWorkflowStatus(partner.status) : null;
  const canResubmit = status === 'rejected' || status === 'expired' || status === 'draft';

  return (
    <PartnerScaffold
      testID="partner-dashboard-screen"
      title={t('marketplace:dashboard.title')}
      subtitle={t('marketplace:dashboard.subtitle')}
      notConnectedRetry={mine.refetch}
    >
      {mine.isLoading ? <Skeleton variant="rect" height={140} /> : null}
      {mine.error ? (
        <ErrorState
          title={t('marketplace:browser.errorTitle')}
          description={t('marketplace:browser.errorDescription')}
          onRetry={mine.refetch}
          testID="dashboard-error"
        />
      ) : null}

      {!mine.isLoading && !mine.error && !partner ? (
        <EmptyState
          icon="users"
          title={t('marketplace:dashboard.empty')}
          description={t('marketplace:dashboard.emptyDescription')}
          action={{
            label: t('marketplace:register.title'),
            onPress: () => router.replace(href(ROUTES.partners.register)),
          }}
          testID="dashboard-empty"
        />
      ) : null}

      {partner ? (
        <>
          <Card variant="crest" style={{ gap: theme.spacing[2] }} testID="dashboard-partner">
            <Text variant="h2">{partner.displayName}</Text>
            <VerificationStatusBadge
              status={partner.status}
              testID="dashboard-partner-status"
            />
            <VerifiedCrown verified={data?.verified === true} testID="dashboard-crown" />
            {partner.rejectionReasonKey ? (
              <Text variant="caption" color="secondary">
                {t(partner.rejectionReasonKey)}
              </Text>
            ) : null}
            {data?.verified !== true ? (
              <Banner
                variant="warning"
                message={t('marketplace:dashboard.notVerifiedNote')}
                testID="dashboard-not-verified"
              />
            ) : null}
            {partner.reverifyAfter ? (
              <Text variant="caption" color="secondary">
                {t('marketplace:dashboard.reverifyAfter', {
                  date: format.date(partner.reverifyAfter),
                })}
              </Text>
            ) : null}
          </Card>

          {canResubmit ? (
            <MediaUploadField
              testID="dashboard-documents"
              label={t('marketplace:register.documents')}
              fileIds={registration.form.documentFileIds}
              uploading={registration.uploading}
              allowPdf
              onPick={(source) => { void registration.uploadMedia('document', source); }}
              onRemove={(fileId) => registration.removeMedia('document', fileId)}
            />
          ) : null}
          
          {canResubmit ? (
            <Button
              fullWidth
              variant="secondary"
              loading={registration.busy}
              label={t('marketplace:dashboard.resubmit')}
              onPress={() => {
                void registration.resubmit(partner.id);
              }}
              testID="dashboard-resubmit"
            />
          ) : null}

          <Button
            fullWidth
            leftIcon="plus"
            label={t('marketplace:composer.newOffer')}
            onPress={() => router.push(href(ROUTES.partners.offerNew))}
            testID="dashboard-new-offer"
          />

          <Text variant="h3">{t('marketplace:dashboard.offersTitle')}</Text>
          {(data?.offers.length ?? 0) === 0 ? (
            <EmptyState
              icon="gift"
              title={t('marketplace:dashboard.offersEmpty')}
              description={t('marketplace:dashboard.offersEmptyDescription')}
              testID="dashboard-offers-empty"
            />
          ) : null}

          {data?.offers.map((row) => {
            const workflow = toOfferWorkflowStatus(row.offer.status);
            return (
              <Card
                key={row.offer.id}
                style={{ gap: theme.spacing[2] }}
                testID={`dashboard-offer-${row.offer.id}`}
              >
                <Text variant="bodyStrong">
                  {row.offer.title ?? t(row.offer.titleKey)}
                </Text>
                <View style={[styles.row, { gap: theme.spacing[2] }]}>
                  <OfferStatusBadge
                    status={row.offer.status}
                    testID={`dashboard-offer-status-${row.offer.id}`}
                  />
                  <ValidityCountdown visibility={row.visibility} daysLeft={row.daysLeft} />
                </View>
                <Text variant="caption" color="secondary">
                  {row.stats.views.kind === 'value'
                    ? t('marketplace:detail.views', {
                        count: format.number(row.stats.views.value),
                      })
                    : t('marketplace:detail.viewsSuppressed')}
                </Text>
                {row.offer.rejectionReasonKey ? (
                  <Text variant="caption" color="secondary">
                    {t(row.offer.rejectionReasonKey)}
                  </Text>
                ) : null}
                {workflow === 'draft' || workflow === 'rejected' ? (
                  <Button
                    size="sm"
                    variant="secondary"
                    label={t('marketplace:dashboard.editOffer')}
                    onPress={() => router.push(href(ROUTES.partners.offerEdit(row.offer.id)))}
                    testID={`dashboard-edit-${row.offer.id}`}
                  />
                ) : null}
                {workflow === 'draft' || workflow === 'rejected' ? (
                  <Button
                    size="sm"
                    loading={composer.busy}
                    label={t('marketplace:dashboard.submitOffer')}
                    onPress={() => {
                      void composer.submitForReview(row.offer.id);
                    }}
                    testID={`dashboard-submit-${row.offer.id}`}
                  />
                ) : null}
                {workflow === 'active' ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    loading={composer.busy}
                    label={t('marketplace:dashboard.cancelOffer')}
                    onPress={() => {
                      void composer.cancel(row.offer.id);
                    }}
                    testID={`dashboard-cancel-${row.offer.id}`}
                  />
                ) : null}
                {workflow === 'expired' ? (
                  <Button
                    size="sm"
                    variant="secondary"
                    loading={composer.busy}
                    label={t('marketplace:dashboard.renewOffer')}
                    onPress={() => {
                      const from = new Date().toISOString();
                      const until = new Date(
                        Date.parse(from) + 30 * 24 * 60 * 60 * 1000,
                      ).toISOString();
                      void composer.renew(row.offer.id, from, until);
                    }}
                    testID={`dashboard-renew-${row.offer.id}`}
                  />
                ) : null}
              </Card>
            );
          })}

          <ListItem
            variant="card"
            title={t('marketplace:ambassador.title')}
            onPress={() => router.push(href(ROUTES.partners.ambassador))}
            testID="dashboard-ambassador"
          />
          <Badge variant="demo" size="sm" label={t('marketplace:demo.partnerBadge')} />
        </>
      ) : null}
    </PartnerScaffold>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
});
