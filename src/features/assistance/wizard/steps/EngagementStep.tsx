import { useTranslation } from 'react-i18next';
import { RadioGroup, Select } from '@/components/ui';
import type {
  EngagementProofType,
  EngagementStatus,
} from '@/repositories/contracts/application';
import { useAssistanceDraftStore } from '@/stores';
import type { FieldErrors } from '../../schemas/wizard';
import { WizardStepShell } from '../../components/WizardStepShell';

const STATUSES: readonly EngagementStatus[] = ['official_engagement', 'serious_family_approval'];
const PROOFS: readonly EngagementProofType[] = [
  'engagement_certificate',
  'family_letter',
  'guardian_statement',
];

export interface EngagementStepProps {
  readonly errors: FieldErrors;
}

export function EngagementStep({ errors }: EngagementStepProps) {
  const { t } = useTranslation();
  const draft = useAssistanceDraftStore();

  return (
    <WizardStepShell
      testID="step-engagement"
      title={t('assistance:wizard.steps.engagement')}
      whyKey="assistance:wizard.why.engagement"
    >
      <RadioGroup<EngagementStatus>
        options={STATUSES.map((v) => ({ value: v, label: t(`assistance:wizard.engagement.${v}`) }))}
        value={draft.engagement.engagementStatus}
        onValueChange={(value) => draft.patchEngagement({ engagementStatus: value })}
      />
      <Select<EngagementProofType>
        testID="engagement-proof"
        label={t('assistance:wizard.fields.proofType')}
        required
        value={draft.engagement.engagementProofType}
        options={PROOFS.map((v) => ({ value: v, label: t(`assistance:wizard.proof.${v}`) }))}
        onChange={(value) => draft.patchEngagement({ engagementProofType: value })}
        errorText={errors.engagementProofType ? t(errors.engagementProofType) : undefined}
      />
    </WizardStepShell>
  );
}
