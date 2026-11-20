import { useTranslation } from 'react-i18next';
import { Banner, Button, Text } from '@/components/ui';
import type { Application } from '@/repositories/contracts/application';
import { authErrorKey } from '@/features/auth/errors';
import { useSubmitApplication } from '../../hooks/use-submit-application';
import { WizardStepShell } from '../../components/WizardStepShell';

export interface SubmitStepProps {
  readonly onSubmitted: (application: Application) => void;
}

export function SubmitStep({ onSubmitted }: SubmitStepProps) {
  const { t } = useTranslation();
  const submitter = useSubmitApplication();

  const run = async (): Promise<void> => {
    const result = await submitter.submit();
    if (result.ok) onSubmitted(result.value);
  };

  return (
    <WizardStepShell
      testID="step-submit"
      title={t('assistance:wizard.steps.submit')}
      whyKey="assistance:wizard.why.submit"
    >
      <Text variant="body" color="secondary">
        {t('assistance:wizard.submit.intro')}
      </Text>
      {submitter.error ? (
        <Banner
          variant="error"
          message={t(authErrorKey(submitter.error))}
          testID="submit-error"
        />
      ) : null}
      <Button
        fullWidth
        loading={submitter.busy}
        label={t('assistance:wizard.submit.action')}
        onPress={() => {
          void run();
        }}
        testID="submit-action"
      />
    </WizardStepShell>
  );
}
