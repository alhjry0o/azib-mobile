// Demo-only marketplace simulator. Runs the SAME services the staff console
// will use in P17, with an explicit admin actor. Never in the user path.
import { useCallback, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';
import {
  Badge,
  Banner,
  Button,
  Card,
  ListItem,
  NotConnectedState,
  Screen,
  Text,
} from '@/components/ui';
import { ROUTES, href } from '@/constants/routes';
import { useProviderContainer } from '@/providers';
import type { Offer } from '@/repositories/contracts/offer';
import type { Partner } from '@/repositories/contracts/partner';
import type { Result } from '@/core/result';
import { authErrorKey } from '@/features/auth/errors';
import { useTheme } from '@/theme';
import { OfferStatusBadge } from '../partners/components/OfferStatusBadge';
import { VerificationStatusBadge } from '../partners/components/VerificationStatusBadge';
import {
  createAmbassadorTask,
  decideAmbassadorApplication,
} from '../partners/services/ambassador-service';
import {
  expireOffer,
  publishOffer,
  reviewOffer,
} from '../partners/services/offer-lifecycle-service';
import {
  decideVerification,
  expirePartner,
  reinstatePartner,
  suspendPartner,
} from '../partners/services/verification-service';

export function DevPartnersScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const container = useProviderContainer();
  const client = useQueryClient();
  const [partnerId, setPartnerId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [failure, setFailure] = useState<string | null>(null);

  const verificationDeps = useMemo(
    () => ({
      partners: container.repositories.partners,
      verifications: container.repositories.partnerVerifications,
      audit: container.repositories.audit,
    }),
    [container],
  );
  const offerDeps = useMemo(
    () => ({
      offers: container.repositories.offers,
      partners: container.repositories.partners,
      verifications: container.repositories.partnerVerifications,
      audit: container.repositories.audit,
    }),
    [container],
  );
  const ambassadorDeps = useMemo(
    () => ({
      ambassadors: container.repositories.ambassadors,
      audit: container.repositories.audit,
    }),
    [container],
  );

  const partnersQuery = useQuery({
    queryKey: ['dev', 'partners', container.mode],
    enabled: container.mode === 'demo',
    staleTime: 3_000,
    queryFn: async (): Promise<Result<readonly Partner[]>> => {
      const listed = await container.repositories.partners.list({ limit: 50 });
      if (!listed.ok) return listed;
      return { ok: true, value: listed.value.items };
    },
  });

  const offersQuery = useQuery({
    queryKey: ['dev', 'partner-offers', container.mode, partnerId],
    enabled: container.mode === 'demo' && partnerId !== null,
    staleTime: 3_000,
    queryFn: async (): Promise<Result<readonly Offer[]>> => {
      const listed = await container.repositories.offers.list({ limit: 200 });
      if (!listed.ok) return listed;
      return { ok: true, value: listed.value.items.filter((o) => o.partnerId === partnerId) };
    },
  });

  const applicationsQuery = useQuery({
    queryKey: ['dev', 'ambassador-applications', container.mode],
    enabled: container.mode === 'demo',
    staleTime: 3_000,
    queryFn: () => container.repositories.ambassadors.listApplications({ limit: 20 }),
  });

  const refresh = useCallback(async (): Promise<void> => {
    await client.invalidateQueries({ queryKey: ['dev'] });
    await client.invalidateQueries({ queryKey: ['partners'] });
  }, [client]);

  const settle = useCallback(
    async (run: () => Promise<Result<unknown>>): Promise<void> => {
      setBusy(true);
      setMessage(null);
      setFailure(null);
      const result = await run();
      if (result.ok) setMessage(t('marketplace:dev.applied'));
      else setFailure(t(authErrorKey(result.error)));
      await refresh();
      setBusy(false);
    },
    [refresh, t],
  );

  if (container.mode !== 'demo') {
    return (
      <Screen testID="dev-partners-screen" style={styles.center}>
        <NotConnectedState
          title={t('marketplace:dev.notDemo')}
          description={t('marketplace:browser.notConnectedDescription')}
        />
      </Screen>
    );
  }

  const partners = partnersQuery.data?.ok ? partnersQuery.data.value : [];
  const offers = offersQuery.data?.ok ? offersQuery.data.value : [];
  const applications = applicationsQuery.data?.ok ? applicationsQuery.data.value.items : [];
  const selected = partners.find((p) => p.id === partnerId) ?? null;

  return (
    <Screen
      scroll
      testID="dev-partners-screen"
      contentStyle={{ gap: theme.spacing[4], paddingBottom: theme.spacing[10] }}
    >
      <Button
        variant="ghost"
        size="sm"
        leftIcon="arrowLeft"
        label={t('common:buttons.back')}
        onPress={() => router.replace(href(ROUTES.dev))}
        testID="dev-partners-back"
        style={styles.back}
      />
      <Text variant="h1">{t('marketplace:dev.title')}</Text>
      <Badge variant="demo" label={t('marketplace:demo.partnerBadge')} />
      <Text variant="body" color="secondary">
        {t('marketplace:dev.subtitle')}
      </Text>

      {message ? <Banner variant="info" message={message} testID="dev-partners-message" /> : null}
      {failure ? <Banner variant="error" message={failure} testID="dev-partners-error" /> : null}

      <Text variant="h3">{t('marketplace:dev.partnersTitle')}</Text>
      {partners.length === 0 ? (
        <Text variant="body" color="secondary" testID="dev-partners-empty">
          {t('marketplace:dev.partnersEmpty')}
        </Text>
      ) : (
        partners.map((partner) => (
          <ListItem
            key={partner.id}
            variant="card"
            title={partner.displayName}
            subtitle={t(`marketplace:partnerStatus.${partner.status}`)}
            onPress={() => setPartnerId(partner.id)}
            testID={`dev-partner-${partner.id}`}
          />
        ))
      )}

      {selected ? (
        <Card style={{ gap: theme.spacing[2] }} testID="dev-partner-actions">
          <Text variant="h3">{selected.displayName}</Text>
          <VerificationStatusBadge status={selected.status} testID="dev-partner-status" />
          <Button
            size="sm"
            loading={busy}
            label={t('marketplace:dev.verify')}
            onPress={() => {
              void settle(async () => {
                const latest = await container.repositories.partnerVerifications.getLatest(
                  selected.id,
                );
                if (!latest.ok) return latest;
                if (!latest.value) {
                  return {
                    ok: false,
                    error: { kind: 'NotFound' } as never,
                  };
                }
                return decideVerification(
                  verificationDeps,
                  selected.id,
                  latest.value.id,
                  'admin',
                  'dev-verifier',
                  'verified',
                );
              });
            }}
            testID="dev-verify"
          />
          <Button
            size="sm"
            variant="secondary"
            loading={busy}
            label={t('marketplace:dev.reject')}
            onPress={() => {
              void settle(async () => {
                const latest = await container.repositories.partnerVerifications.getLatest(
                  selected.id,
                );
                if (!latest.ok) return latest;
                if (!latest.value) return latest;
                return decideVerification(
                  verificationDeps,
                  selected.id,
                  latest.value.id,
                  'admin',
                  'dev-verifier',
                  'rejected',
                  'marketplace:dev.rejectReason',
                );
              });
            }}
            testID="dev-reject-partner"
          />
          <Button
            size="sm"
            variant="ghost"
            loading={busy}
            label={t('marketplace:dev.expirePartner')}
            onPress={() => {
              void settle(() => expirePartner(verificationDeps, selected.id, 'dev-system'));
            }}
            testID="dev-expire-partner"
          />
          <Button
            size="sm"
            variant="ghost"
            loading={busy}
            label={t('marketplace:dev.suspend')}
            onPress={() => {
              void settle(() =>
                suspendPartner(
                  verificationDeps,
                  selected.id,
                  'admin',
                  'dev-moderator',
                  'marketplace:dev.suspendReason',
                ),
              );
            }}
            testID="dev-suspend"
          />
          <Button
            size="sm"
            variant="ghost"
            loading={busy}
            label={t('marketplace:dev.reinstate')}
            onPress={() => {
              void settle(() =>
                reinstatePartner(verificationDeps, selected.id, 'admin', 'dev-admin'),
              );
            }}
            testID="dev-reinstate"
          />
        </Card>
      ) : null}

      {selected ? (
        <>
          <Text variant="h3">{t('marketplace:dev.offersTitle')}</Text>
          {offers.length === 0 ? (
            <Text variant="body" color="secondary" testID="dev-offers-empty">
              {t('marketplace:dev.offersEmpty')}
            </Text>
          ) : (
            offers.map((offer) => (
              <Card key={offer.id} style={{ gap: theme.spacing[2] }} testID={`dev-offer-${offer.id}`}>
                <Text variant="bodyStrong">{offer.title ?? t(offer.titleKey)}</Text>
                <OfferStatusBadge status={offer.status} testID={`dev-offer-status-${offer.id}`} />
                <Button
                  size="sm"
                  loading={busy}
                  label={t('marketplace:dev.approveOffer')}
                  onPress={() => {
                    void settle(() =>
                      reviewOffer(offerDeps, offer.id, 'admin', 'dev-reviewer', 'approved'),
                    );
                  }}
                  testID={`dev-approve-offer-${offer.id}`}
                />
                <Button
                  size="sm"
                  variant="secondary"
                  loading={busy}
                  label={t('marketplace:dev.publishOffer')}
                  onPress={() => {
                    void settle(() => publishOffer(offerDeps, offer.id, 'admin', 'dev-reviewer'));
                  }}
                  testID={`dev-publish-offer-${offer.id}`}
                />
                <Button
                  size="sm"
                  variant="ghost"
                  loading={busy}
                  label={t('marketplace:dev.expireOffer')}
                  onPress={() => {
                    void settle(() => expireOffer(offerDeps, offer.id, 'dev-system'));
                  }}
                  testID={`dev-expire-offer-${offer.id}`}
                />
              </Card>
            ))
          )}
        </>
      ) : null}

      <Text variant="h3">{t('marketplace:dev.ambassadorsTitle')}</Text>
      {applications.length === 0 ? (
        <Text variant="body" color="secondary" testID="dev-ambassadors-empty">
          {t('marketplace:dev.ambassadorsEmpty')}
        </Text>
      ) : (
        applications.map((application) => (
          <Card
            key={application.id}
            style={{ gap: theme.spacing[2] }}
            testID={`dev-ambassador-${application.id}`}
          >
            <Text variant="bodyStrong">
              {t(`marketplace:ambassador.status.${application.status}`)}
            </Text>
            <Button
              size="sm"
              loading={busy}
              label={t('marketplace:dev.approveAmbassador')}
              onPress={() => {
                void settle(() =>
                  decideAmbassadorApplication(
                    ambassadorDeps,
                    application.id,
                    'admin',
                    'dev-admin',
                    'approved',
                  ),
                );
              }}
              testID={`dev-approve-ambassador-${application.id}`}
            />
            <Button
              size="sm"
              variant="secondary"
              loading={busy}
              label={t('marketplace:dev.createTask')}
              onPress={() => {
                void settle(() =>
                  createAmbassadorTask(
                    ambassadorDeps,
                    'admin',
                    'dev-admin',
                    application.userId,
                    'nominate_partner',
                    application.governorateIds[0] ?? 'sanaa',
                    'marketplace:ambassador.taskNominate',
                  ),
                );
              }}
              testID={`dev-create-task-${application.id}`}
            />
          </Card>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { justifyContent: 'center' },
  back: { alignSelf: 'flex-start', marginTop: 8 },
});
