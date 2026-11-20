import { useTranslation } from 'react-i18next';
import { Select } from '@/components/ui';
import { useAssistanceDraftStore } from '@/stores';
import type { EmploymentStatus, IncomeSource } from '@/repositories/contracts/application';
import type { FieldErrors } from '../../schemas/wizard';
import { NumericField } from '../../components/NumericField';
import { WizardStepShell } from '../../components/WizardStepShell';
import { sectionValues, type NumericStepConfig } from '../step-config';

const EMPLOYMENT: readonly EmploymentStatus[] = ['employed', 'self_employed', 'irregular', 'unemployed'];
const SOURCES: readonly IncomeSource[] = ['salary', 'business', 'daily_wage', 'none'];

export interface NumericStepProps {
  readonly config: NumericStepConfig;
  readonly errors: FieldErrors;
}

export function NumericStep({ config, errors }: NumericStepProps) {
  const { t } = useTranslation();
  const draft = useAssistanceDraftStore();
  const values = sectionValues(draft, config.section);

  const patch = (key: string, value: number | null): void => {
    if (config.section === 'income') draft.patchIncome({ [key]: value });
    else if (config.section === 'assets') draft.patchAssets({ [key]: value });
    else draft.patchObligations({ [key]: value });
  };

  return (
    <WizardStepShell
      testID={`step-${config.section}`}
      title={t(config.titleKey)}
      whyKey={config.whyKey}
    >
      {config.section === 'income' ? (
        <>
          <Select<EmploymentStatus>
            testID="income-employment"
            label={t('assistance:wizard.fields.employment')}
            value={draft.income.employmentStatus}
            options={EMPLOYMENT.map((v) => ({ value: v, label: t(`assistance:wizard.employment.${v}`) }))}
            onChange={(value) => draft.patchIncome({ employmentStatus: value })}
          />
          <Select<IncomeSource>
            testID="income-source"
            label={t('assistance:wizard.fields.incomeSource')}
            value={draft.income.incomeSource}
            options={SOURCES.map((v) => ({ value: v, label: t(`assistance:wizard.incomeSource.${v}`) }))}
            onChange={(value) => draft.patchIncome({ incomeSource: value })}
          />
        </>
      ) : null}
      {config.fields.map((field) => (
        <NumericField
          key={field.key}
          testID={`field-${config.section}-${field.key}`}
          label={t(field.labelKey)}
          required
          helpText={field.helpKey ? t(field.helpKey) : undefined}
          value={values[field.key] ?? null}
          onChange={(value) => patch(field.key, value)}
          errorText={errors[field.key] ? t(errors[field.key] ?? '') : undefined}
        />
      ))}
    </WizardStepShell>
  );
}
