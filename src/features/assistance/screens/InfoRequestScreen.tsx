import { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import {
  Banner,
  Button,
  Card,
  EmptyState,
  Screen,
  Text,
  Textarea,
} from '@/components/ui';
import { ROUTES, href } from '@/constants/routes';
import type { ApplicationDocument } from '@/repositories/contracts/application';
import { authErrorKey } from '@/features/auth/errors';
import { useTheme } from '@/theme';
import { NumericField } from '../components/NumericField';
import { DocumentUploader } from '../components/DocumentUploader';
import { useApplicationDetail } from '../hooks/use-assistance-applications';
import { useAssistanceActions } from '../hooks/use-assistance-actions';

export function InfoRequestScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ id?: string }>();
  const id = params.id ?? '';
  const detail = useApplicationDetail(id);
  const actions = useAssistanceActions(id);

  const application = detail.application;
  const payload = application?.payload ?? null;

  const [income, setIncome] = useState<number | null>(payload?.income.monthlyIncome ?? null);
  const [assets, setAssets] = useState<number | null>(payload?.assets.availableAssets ?? null);
  const [rent, setRent] = useState<number | null>(payload?.obligations.monthlyRent ?? null);
  const [dependents, setDependents] = useState<number | null>(
    payload?.obligations.dependentsCount ?? null,
  );
  const [documents, setDocuments] = useState<readonly ApplicationDocument[]>(
    payload?.documents ?? [],
  );
  const [notes, setNotes] = useState(application?.notes ?? '');

  if (!application || !payload) {
    return (
      <Screen testID="info-request-screen" style={styles.center}>
        <EmptyState
          icon="info"
          title={t('assistance:detail.notFound')}
          description={t('assistance:detail.notFoundDescription')}
          action={{
            label: t('assistance:mine.title'),
            onPress: () => router.replace(href(ROUTES.assistance.mine)),
          }}
          testID="info-request-missing"
        />
      </Screen>
    );
  }

  const submit = async (): Promise<void> => {
    const result = await actions.resubmit({
      payload: {
        ...payload,
        income: { ...payload.income, monthlyIncome: income ?? payload.income.monthlyIncome },
        assets: {
          ...payload.assets,
          availableAssets: assets ?? payload.assets.availableAssets,
        },
        obligations: {
          ...payload.obligations,
          monthlyRent: rent ?? payload.obligations.monthlyRent,
          dependentsCount: dependents ?? payload.obligations.dependentsCount,
        },
        documents,
      },
      notes: notes.trim().length > 0 ? notes.trim() : null,
    });
    if (result.ok) router.replace(href(ROUTES.assistance.detail(id)));
  };

  return (
    <Screen
      scroll
      testID="info-request-screen"
      contentStyle={{ gap: theme.spacing[4], paddingBottom: theme.spacing[10] }}
    >
      <Button
        variant="ghost"
        size="sm"
        leftIcon="arrowLeft"
        label={t('common:buttons.back')}
        onPress={() => router.replace(href(ROUTES.assistance.detail(id)))}
        testID="info-request-back"
        style={styles.back}
      />
      <Text variant="h1">{t('assistance:infoRequest.title')}</Text>
      <Banner variant="info" message={t('assistance:infoRequest.intro')} testID="info-request-intro" />

      <Card style={{ gap: theme.spacing[2] }} testID="info-request-items">
        {(application.infoRequest?.items ?? []).map((item) => (
          <View key={item.fieldKey} style={{ gap: 2 }}>
            <Text variant="bodyStrong">{t(item.fieldKey)}</Text>
            <Text variant="caption" color="secondary">
              {t(item.reasonKey)}
            </Text>
          </View>
        ))}
      </Card>

      <Text variant="h3">{t('assistance:infoRequest.editTitle')}</Text>
      <NumericField
        testID="info-income"
        label={t('assistance:wizard.fields.monthlyIncome')}
        value={income}
        onChange={setIncome}
      />
      <NumericField
        testID="info-assets"
        label={t('assistance:wizard.fields.availableAssets')}
        value={assets}
        onChange={setAssets}
      />
      <NumericField
        testID="info-rent"
        label={t('assistance:wizard.fields.monthlyRent')}
        value={rent}
        onChange={setRent}
      />
      <NumericField
        testID="info-dependents"
        label={t('assistance:wizard.fields.dependents')}
        value={dependents}
        onChange={setDependents}
      />

      <DocumentUploader
        documents={documents}
        onAdd={(document) => setDocuments((prev) => [...prev, document])}
        onRemove={(documentId) =>
          setDocuments((prev) => prev.filter((d) => d.id !== documentId))
        }
      />

      <Textarea
        testID="info-notes"
        label={t('assistance:infoRequest.noteLabel')}
        value={notes}
        onChangeText={setNotes}
        minHeight={90}
      />

      {actions.error ? (
        <Banner
          variant="error"
          message={t(authErrorKey(actions.error))}
          testID="info-request-error"
        />
      ) : null}

      <Button
        fullWidth
        loading={actions.busy}
        label={t('assistance:infoRequest.resubmit')}
        onPress={() => {
          void submit();
        }}
        testID="info-request-submit"
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { justifyContent: 'center' },
  back: { alignSelf: 'flex-start', marginTop: 8 },
});
