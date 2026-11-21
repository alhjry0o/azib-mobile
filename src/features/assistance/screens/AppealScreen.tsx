import { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';
import { Banner, Button, EmptyState, Screen, Text, Textarea } from '@/components/ui';
import { ROUTES, href } from '@/constants/routes';
import type { ApplicationDocument } from '@/repositories/contracts/application';
import { authErrorKey } from '@/features/auth/errors';
import { useTheme } from '@/theme';
import { AppealFormSchema } from '../schemas/appeal';
import { DocumentUploader } from '../components/DocumentUploader';
import { useApplicationDetail } from '../hooks/use-assistance-applications';
import { useAssistanceActions } from '../hooks/use-assistance-actions';
import { useEligibilityRules } from '../hooks/use-assistance-query';

export function AppealScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ id?: string }>();
  const id = params.id ?? '';
  const detail = useApplicationDetail(id);
  const actions = useAssistanceActions(id);
  const rules = useEligibilityRules();

  const [statement, setStatement] = useState('');
  const [documents, setDocuments] = useState<readonly ApplicationDocument[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);

  const application = detail.application;
  const appeal = application?.appeal ?? null;
  const decision = application?.decision ?? null;
  const decidedAt = decision?.decidedAt ? Date.parse(decision.decidedAt) : Number.NaN;
  // eslint-disable-next-line react-hooks/purity
  const withinWindow =
    !Number.isNaN(decidedAt) &&
    Date.now() - decidedAt <= rules.data.appealWindowDays * 24 * 60 * 60 * 1000;

  if (!application || appeal !== null || !withinWindow || decision?.outcome !== 'rejected') {
    const messageKey =
      appeal !== null ? 'assistance:appeal.used' : 'assistance:appeal.closed';
    return (
      <Screen testID="appeal-screen" style={styles.center}>
        <EmptyState
          icon="info"
          title={t('assistance:appeal.title')}
          description={t(messageKey)}
          action={{
            label: t('assistance:detail.title'),
            onPress: () => router.replace(href(ROUTES.assistance.detail(id))),
          }}
          testID="appeal-unavailable"
        />
      </Screen>
    );
  }

  const submit = async (): Promise<void> => {
    const parsed = AppealFormSchema.safeParse({ statement });
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      setValidationError(first ? first.message : 'assistance:appeal.validation.statementMin');
      return;
    }
    setValidationError(null);
    const result = await actions.appeal(
      parsed.data.statement,
      documents.map((d) => d.id),
    );
    if (result.ok) router.replace(href(ROUTES.assistance.detail(id)));
  };

  return (
    <Screen
      scroll
      testID="appeal-screen"
      contentStyle={{ gap: theme.spacing[4], paddingBottom: theme.spacing[10] }}
    >
      <Button
        variant="ghost"
        size="sm"
        leftIcon="arrowLeft"
        label={t('common:buttons.back')}
        onPress={() => router.replace(href(ROUTES.assistance.detail(id)))}
        testID="appeal-back"
        style={styles.back}
      />
      <Text variant="h1">{t('assistance:appeal.title')}</Text>
      <Banner
        variant="info"
        message={t('assistance:appeal.window', { days: rules.data.appealWindowDays })}
        testID="appeal-window"
      />
      <Textarea
        testID="appeal-statement"
        label={t('assistance:appeal.statement')}
        required
        value={statement}
        onChangeText={setStatement}
        minHeight={120}
        errorText={validationError ? t(validationError) : undefined}
      />
      <Text variant="h3">{t('assistance:appeal.documents')}</Text>
      <DocumentUploader
        documents={documents}
        onAdd={(document) => setDocuments((prev) => [...prev, document])}
        onRemove={(documentId) =>
          setDocuments((prev) => prev.filter((d) => d.id !== documentId))
        }
      />
      {actions.error ? (
        <Banner
          variant="error"
          message={t(authErrorKey(actions.error))}
          testID="appeal-error"
        />
      ) : null}
      <Button
        fullWidth
        loading={actions.busy}
        label={t('assistance:appeal.submit')}
        onPress={() => {
          void submit();
        }}
        testID="appeal-submit"
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { justifyContent: 'center' },
  back: { alignSelf: 'flex-start', marginTop: 8 },
});
