import { useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import {
  Badge,
  Banner,
  Button,
  Card,
  EmptyState,
  ErrorState,
  SegmentedControl,
  Skeleton,
  Text,
  TextInput,
  Textarea,
} from '@/components/ui';
import { DoubleRingSuccess } from '@/components/brand';
import { ROUTES } from '@/constants/routes';
import { useTheme } from '@/theme';
import { HandoverCodeCard } from '../components/HandoverCodeCard';
import { SoukScaffold } from '../components/SoukScaffold';
import { useSoukHandover } from '../hooks/use-souk-handover';
import { soukErrorKey } from '../state/error-keys';
import { RATING_MAX, RATING_MIN } from '../state/handover';

const SCORES = ['1', '2', '3', '4', '5'] as const;
type ScoreChoice = (typeof SCORES)[number];

export function SoukHandoverScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ requestId?: string }>();
  const requestId = params.requestId ?? '';
  const handover = useSoukHandover(requestId);
  const [code, setCode] = useState('');
  const [score, setScore] = useState<ScoreChoice>('5');
  const [note, setNote] = useState('');
  const [rated, setRated] = useState(false);

  const data = handover.data;

  return (
    <SoukScaffold
      testID="souk-handover-screen"
      title={t('marketplace:souk.handover.title')}
      subtitle={t('marketplace:souk.handover.subtitle')}
      backTo={ROUTES.souk.coordination(requestId)}
      notConnectedRetry={handover.refetch}
    >
      {handover.isLoading ? <Skeleton variant="rect" height={140} /> : null}
      {handover.error ? (
        <ErrorState
          title={t('marketplace:souk.browser.errorTitle')}
          description={t('marketplace:souk.browser.errorDescription')}
          onRetry={handover.refetch}
          testID="souk-handover-error"
        />
      ) : null}
      {!handover.isLoading && !handover.error && !data ? (
        <EmptyState
          icon="info"
          title={t('marketplace:souk.errors.requestNotFound')}
          description={t('marketplace:souk.requests.emptyDescription')}
          testID="souk-handover-missing"
        />
      ) : null}
      {handover.actionError ? (
        <Banner
          variant="error"
          message={t(soukErrorKey(handover.actionError))}
          testID="souk-handover-action-error"
        />
      ) : null}

      {data ? (
        <>
          <HandoverCodeCard testID="souk-handover-summary" request={data.request} />

          {!data.completed ? (
            <Card style={{ gap: theme.spacing[3] }} testID="souk-handover-form">
              <TextInput
                testID="souk-handover-code"
                label={t('marketplace:souk.handover.codeLabel')}
                helpText={t('marketplace:souk.handover.codeHelp')}
                autoCapitalize="characters"
                value={code}
                onChangeText={setCode}
              />
              <Button
                fullWidth
                loading={handover.busy}
                label={t('marketplace:souk.handover.confirm')}
                onPress={() => {
                  void handover.confirm(code);
                }}
                testID="souk-handover-confirm"
              />
            </Card>
          ) : (
            <Card style={{ gap: theme.spacing[3] }} testID="souk-handover-done">
              <DoubleRingSuccess size={64} testID="souk-handover-success" />
              <Text variant="h3">{t('marketplace:souk.handover.completed')}</Text>
              <Badge variant="verified" label={t('marketplace:souk.itemStatus.handed_over')} />
            </Card>
          )}

          {data.completed && !rated ? (
            <Card style={{ gap: theme.spacing[3] }} testID="souk-rating-form">
              <Text variant="h3">{t('marketplace:souk.handover.rateTitle')}</Text>
              <Text variant="caption" color="secondary">
                {t('marketplace:souk.handover.rateHelp')}
              </Text>
              <SegmentedControl<ScoreChoice>
                segments={SCORES.map((value) => ({ value, label: value }))}
                value={score}
                onChange={setScore}
                size="sm"
                testID="souk-rating-score"
              />
              <Textarea
                testID="souk-rating-note"
                label={t('marketplace:souk.handover.rateNote')}
                value={note}
                onChangeText={setNote}
                minHeight={80}
              />
              <Text variant="caption" color="secondary">
                {t('marketplace:souk.handover.privateNote')}
              </Text>
              <Button
                fullWidth
                variant="secondary"
                loading={handover.busy}
                label={t('marketplace:souk.handover.rateSubmit')}
                onPress={() => {
                  const parsed = Number.parseInt(score, 10);
                  if (parsed < RATING_MIN || parsed > RATING_MAX) return;
                  void handover
                    .rate(parsed, note.trim().length > 0 ? note.trim() : null)
                    .then((result) => {
                      if (result.ok) setRated(true);
                    });
                }}
                testID="souk-rating-submit"
              />
            </Card>
          ) : null}

          {rated ? (
            <Banner
              variant="info"
              message={t('marketplace:souk.handover.rated')}
              testID="souk-rating-received"
            />
          ) : null}

          <View style={{ height: theme.spacing[4] }} />
        </>
      ) : null}
    </SoukScaffold>
  );
}
