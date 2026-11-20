import { useCallback, useState } from 'react';
import { Redirect, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { Badge, Banner, Button, Card, Screen, Text } from '@/components/ui';
import { ROUTES, href } from '@/constants/routes';
import { useAssistanceDraftStore } from '@/stores';
import type { Application } from '@/repositories/contracts/application';
import { useDirection } from '@/hooks';
import { useTheme } from '@/theme';
import {
  ApplicantStepSchema,
  AssetsStepSchema,
  DocumentsStepSchema,
  EngagementStepSchema,
  IncomeStepSchema,
  ObligationsStepSchema,
  ReviewStepSchema,
  collectFieldErrors,
  type FieldErrors,
} from '../schemas/wizard';
import { WizardProgress } from '../components/WizardProgress';
import { NUMERIC_STEPS } from './step-config';
import { ApplicantStep } from './steps/ApplicantStep';
import { DocumentsStep } from './steps/DocumentsStep';
import { EngagementStep } from './steps/EngagementStep';
import { NumericStep } from './steps/NumericStep';
import { ReviewStep } from './steps/ReviewStep';
import { SubmitStep } from './steps/SubmitStep';

const STEP_KEYS = [
  'applicant',
  'income',
  'assets',
  'obligations',
  'engagement',
  'documents',
  'review',
  'submit',
] as const;

export function AssistanceWizard() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const { isRTL } = useDirection();
  const draft = useAssistanceDraftStore();
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitted, setSubmitted] = useState<Application | null>(null);

  const step = draft.step;
  const stepKey = STEP_KEYS[step] ?? 'applicant';

  const validate = useCallback((): FieldErrors => {
    const parse = (() => {
      switch (step) {
        case 0:
          return ApplicantStepSchema.safeParse(draft.applicant);
        case 1:
          return IncomeStepSchema.safeParse(draft.income);
        case 2:
          return AssetsStepSchema.safeParse(draft.assets);
        case 3:
          return ObligationsStepSchema.safeParse(draft.obligations);
        case 4:
          return EngagementStepSchema.safeParse(draft.engagement);
        case 5:
          return DocumentsStepSchema.safeParse({ documents: draft.documents });
        case 6:
          return ReviewStepSchema.safeParse({
            requestedAmount: draft.requestedAmount ?? 0,
            notes: draft.notes,
            ...draft.declarations,
          });
        default:
          return null;
      }
    })();
    if (!parse || parse.success) return {};
    return collectFieldErrors(parse.error.issues);
  }, [step, draft]);

  const next = (): void => {
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    draft.setStep(step + 1);
  };

  if (!draft.programId && !submitted) {
    return <Redirect href={href(ROUTES.assistance.root)} />;
  }

  if (submitted) {
    return (
      <Screen scroll testID="wizard-result" contentStyle={styles.content}>
        <Text variant="h1">{t('assistance:wizard.result.title')}</Text>
        <Card variant="crest" testID="wizard-reference-card" style={styles.card}>
          <Text variant="caption" color="secondary">
            {t('assistance:reference.label')}
          </Text>
          <Text variant="h2" color="gold" testID="wizard-reference">
            {submitted.referenceNumber ?? ''}
          </Text>
          <Badge variant="pending" label={t(`assistance:workflow.status.${submitted.status}`)} />
          <Badge variant="demo" size="sm" label={t('common:demo.badge')} />
        </Card>
        <Banner variant="info" message={t('assistance:reference.demoNote')} />
        <Text variant="body" color="secondary">
          {t('assistance:wizard.result.note')}
        </Text>
        <Button
          fullWidth
          label={t('assistance:wizard.result.home')}
          onPress={() => router.replace(href(ROUTES.tabs.home))}
          testID="wizard-result-home"
        />
      </Screen>
    );
  }

  const numericConfig = NUMERIC_STEPS.find((c) => {
    if (step === 1) return c.section === 'income';
    if (step === 2) return c.section === 'assets';
    if (step === 3) return c.section === 'obligations';
    return false;
  });

  return (
    <Screen scroll testID="assistance-wizard" contentStyle={styles.content}>
      <WizardProgress
        step={step}
        total={STEP_KEYS.length}
        label={t(`assistance:wizard.steps.${stepKey}`)}
      />
      {Object.keys(errors).length > 0 ? (
        <Banner
          variant="error"
          message={t('assistance:wizard.fixErrors')}
          testID="wizard-errors"
        />
      ) : null}

      {step === 0 ? <ApplicantStep errors={errors} /> : null}
      {numericConfig ? <NumericStep config={numericConfig} errors={errors} /> : null}
      {step === 4 ? <EngagementStep errors={errors} /> : null}
      {step === 5 ? <DocumentsStep errors={errors} /> : null}
      {step === 6 ? <ReviewStep errors={errors} /> : null}
      {step === 7 ? <SubmitStep onSubmitted={setSubmitted} /> : null}

      <View
        style={[
          styles.footer,
          { flexDirection: isRTL ? 'row-reverse' : 'row', gap: theme.spacing[2] },
        ]}
      >
        {step > 0 ? (
          <Button
            style={styles.footerAction}
            variant="ghost"
            label={t('assistance:wizard.back')}
            onPress={() => {
              setErrors({});
              draft.setStep(step - 1);
            }}
            testID="wizard-back"
          />
        ) : null}
        {step < 7 ? (
          <Button
            style={styles.footerAction}
            label={t('assistance:wizard.next')}
            onPress={next}
            testID="wizard-next"
          />
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: 16, paddingVertical: 16, paddingBottom: 64 },
  card: { gap: 8 },
  footer: { alignItems: 'center', marginTop: 8 },
  footerAction: { flex: 1 },
});
