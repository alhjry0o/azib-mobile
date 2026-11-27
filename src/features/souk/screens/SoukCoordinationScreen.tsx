import { useState } from 'react';
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
  TextInput,
} from '@/components/ui';
import { ROUTES, href } from '@/constants/routes';
import { useTheme } from '@/theme';
import { ContactDisclosureCard } from '../components/ContactDisclosureCard';
import { HandoverCodeCard } from '../components/HandoverCodeCard';
import { SafeMeetingNote } from '../components/SafeMeetingNote';
import { SoukScaffold } from '../components/SoukScaffold';
import { useSoukCoordination } from '../hooks/use-souk-coordination';
import { soukErrorKey } from '../state/error-keys';

export function SoukCoordinationScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ requestId?: string }>();
  const requestId = params.requestId ?? '';
  const coordination = useSoukCoordination(requestId);
  const [draft, setDraft] = useState('');

  const data = coordination.data;
  const myConsent = data
    ? data.isDonor
      ? data.request.donorContactConsent
      : data.request.recipientContactConsent
    : false;

  const send = async (): Promise<void> => {
    const result = await coordination.send(draft);
    if (result.ok) setDraft('');
  };

  return (
    <SoukScaffold
      testID="souk-coordination-screen"
      title={t('marketplace:souk.coordination.title')}
      subtitle={t('marketplace:souk.coordination.subtitle')}
      backTo={ROUTES.souk.requests}
      notConnectedRetry={coordination.refetch}
    >
      {coordination.isLoading ? <Skeleton variant="rect" height={140} /> : null}
      {coordination.error ? (
        <ErrorState
          title={t('marketplace:souk.browser.errorTitle')}
          description={t('marketplace:souk.browser.errorDescription')}
          onRetry={coordination.refetch}
          testID="souk-coordination-error"
        />
      ) : null}
      {!coordination.isLoading && !coordination.error && !data ? (
        <EmptyState
          icon="info"
          title={t('marketplace:souk.errors.requestNotFound')}
          description={t('marketplace:souk.requests.emptyDescription')}
          testID="souk-coordination-missing"
        />
      ) : null}
      {coordination.actionError ? (
        <Banner
          variant="error"
          message={t(soukErrorKey(coordination.actionError))}
          testID="souk-coordination-action-error"
        />
      ) : null}

      {data ? (
        <>
          <SafeMeetingNote testID="souk-safe-meeting" />

          {!data.accepted ? (
            <Banner
              variant="warning"
              message={t('marketplace:souk.coordination.notAccepted')}
              testID="souk-coordination-not-accepted"
            />
          ) : null}

          <ContactDisclosureCard
            testID="souk-disclosure"
            disclosure={coordination.disclosure}
            myConsent={myConsent}
            busy={coordination.busy}
            onConsentChange={(value) => {
              void coordination.setConsent(value);
            }}
          />

          <HandoverCodeCard
            testID="souk-handover-card"
            request={data.request}
          />
          <Button
            fullWidth
            variant="secondary"
            label={t('marketplace:souk.coordination.openHandover')}
            onPress={() => router.push(href(ROUTES.souk.handover(requestId)))}
            testID="souk-open-handover"
          />

          <Text variant="h3">{t('marketplace:souk.coordination.chatTitle')}</Text>
          {coordination.messages.length === 0 ? (
            <Text variant="body" color="secondary" testID="souk-chat-empty">
              {t('marketplace:souk.coordination.chatEmpty')}
            </Text>
          ) : null}
          <View style={{ gap: theme.spacing[2] }}>
            {coordination.messages.map((message) => (
              <Card
                key={message.id}
                style={{ gap: theme.spacing[2] }}
                testID={`souk-message-${message.id}`}
              >
                <Text variant="body">
                  {message.status === 'removed'
                    ? t('marketplace:souk.coordination.removed')
                    : message.text}
                </Text>
                {message.status === 'reported' ? (
                  <Badge
                    variant="warning"
                    size="sm"
                    label={t('marketplace:souk.coordination.reported')}
                  />
                ) : null}
                <Button
                  variant="ghost"
                  size="sm"
                  label={t('marketplace:souk.coordination.reportMessage')}
                  onPress={() => {
                    void coordination.report(message.id);
                  }}
                  testID={`souk-message-report-${message.id}`}
                />
              </Card>
            ))}
          </View>

          {data.accepted ? (
            <View style={{ gap: theme.spacing[2] }}>
              <TextInput
                testID="souk-chat-input"
                label={t('marketplace:souk.coordination.compose')}
                value={draft}
                onChangeText={setDraft}
              />
              <Button
                fullWidth
                loading={coordination.busy}
                label={t('marketplace:souk.coordination.send')}
                onPress={() => {
                  void send();
                }}
                testID="souk-chat-send"
              />
            </View>
          ) : null}
        </>
      ) : null}
    </SoukScaffold>
  );
}
