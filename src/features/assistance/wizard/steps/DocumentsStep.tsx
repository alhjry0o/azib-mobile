import { useTranslation } from 'react-i18next';
import { Banner } from '@/components/ui';
import { useAssistanceDraftStore } from '@/stores';
import type { FieldErrors } from '../../schemas/wizard';
import { DocumentUploader } from '../../components/DocumentUploader';
import { WizardStepShell } from '../../components/WizardStepShell';

export interface DocumentsStepProps {
  readonly errors: FieldErrors;
}

export function DocumentsStep({ errors }: DocumentsStepProps) {
  const { t } = useTranslation();
  const draft = useAssistanceDraftStore();

  return (
    <WizardStepShell
      testID="step-documents"
      title={t('assistance:wizard.steps.documents')}
      whyKey="assistance:wizard.why.documents"
    >
      {errors.documents ? (
        <Banner variant="error" message={t(errors.documents)} testID="documents-error" />
      ) : null}
      <DocumentUploader
        documents={draft.documents}
        onAdd={draft.addDocument}
        onRemove={draft.removeDocument}
      />
    </WizardStepShell>
  );
}
