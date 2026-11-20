import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { Banner, Card, Checkbox, Text, Textarea } from '@/components/ui';
import { useAssistanceDraftStore } from '@/stores';
import { useHomeFormatters } from '@/features/home/hooks/use-home-formatters';
import type { FieldErrors } from '../../schemas/wizard';
import { NumericField } from '../../components/NumericField';
import { WizardStepShell } from '../../components/WizardStepShell';

export interface ReviewStepProps {
  readonly errors: FieldErrors;
}

export function ReviewStep({ errors }: ReviewStepProps) {
  const { t } = useTranslation();
  const draft = useAssistanceDraftStore();
  const format = useHomeFormatters();

  return (
    <WizardStepShell
      testID="step-review"
      title={t('assistance:wizard.steps.review')}
      whyKey="assistance:wizard.why.review"
    >
      <Card testID="review-summary" style={styles.summary}>
        <Text variant="caption" color="secondary">
          {t('assistance:wizard.fields.monthlyIncome')}
        </Text>
        <Text variant="bodyStrong">
          {format.number(draft.income.monthlyIncome ?? 0)}
        </Text>
        <Text variant="caption" color="secondary">
          {t('assistance:wizard.fields.availableAssets')}
        </Text>
        <Text variant="bodyStrong">
          {format.number(draft.assets.availableAssets ?? 0)}
        </Text>
        <Text variant="caption" color="secondary">
          {t('assistance:wizard.review.documentsCount')
            .replace('{{count}}', String(draft.documents.length))}
        </Text>
      </Card>

      <NumericField
        testID="review-amount"
        label={t('assistance:wizard.fields.requestedAmount')}
        required
        value={draft.requestedAmount}
        onChange={draft.setRequestedAmount}
        errorText={errors.requestedAmount ? t(errors.requestedAmount) : undefined}
      />
      <Textarea
        testID="review-notes"
        label={t('assistance:wizard.fields.notes')}
        value={draft.notes}
        onChangeText={draft.setNotes}
        minHeight={80}
      />

      <View style={styles.consents}>
        <Checkbox
          testID="review-truthful"
          checked={draft.declarations.truthful}
          onCheckedChange={(v) => draft.patchDeclarations({ truthful: v })}
          label={t('assistance:wizard.review.truthful')}
          error={!!errors.truthful}
        />
        <Checkbox
          testID="review-verification"
          checked={draft.declarations.verificationConsent}
          onCheckedChange={(v) => draft.patchDeclarations({ verificationConsent: v })}
          label={t('assistance:wizard.review.verification')}
          error={!!errors.verificationConsent}
        />
        <Checkbox
          testID="review-processing"
          checked={draft.declarations.processingConsent}
          onCheckedChange={(v) => draft.patchDeclarations({ processingConsent: v })}
          label={t('assistance:wizard.review.processing')}
          error={!!errors.processingConsent}
        />
        <Checkbox
          testID="review-publication"
          checked={draft.declarations.publicationConsent}
          onCheckedChange={(v) => draft.patchDeclarations({ publicationConsent: v })}
          label={t('assistance:wizard.review.publication')}
        />
      </View>
      <Banner variant="info" message={t('assistance:wizard.review.publicationNote')} />
    </WizardStepShell>
  );
}

const styles = StyleSheet.create({
  summary: { gap: 4 },
  consents: { gap: 8, width: '100%' },
});
