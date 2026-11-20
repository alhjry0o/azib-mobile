// Declarative descriptors for the three numeric steps (DRY, AGENT_RULES §1 #7).
import type { AssistanceDraftState } from '@/stores';

export type NumericSection = 'income' | 'assets' | 'obligations';

export interface NumericFieldConfig {
  readonly key: string;
  readonly labelKey: string;
  readonly helpKey?: string;
}

export interface NumericStepConfig {
  readonly section: NumericSection;
  readonly titleKey: string;
  readonly whyKey: string;
  readonly fields: readonly NumericFieldConfig[];
}

export const NUMERIC_STEPS: readonly NumericStepConfig[] = [
  {
    section: 'income',
    titleKey: 'assistance:wizard.steps.income',
    whyKey: 'assistance:wizard.why.income',
    fields: [
      { key: 'monthlyIncome', labelKey: 'assistance:wizard.fields.monthlyIncome' },
      { key: 'stabilityMonths', labelKey: 'assistance:wizard.fields.stabilityMonths' },
    ],
  },
  {
    section: 'assets',
    titleKey: 'assistance:wizard.steps.assets',
    whyKey: 'assistance:wizard.why.assets',
    fields: [
      {
        key: 'availableAssets',
        labelKey: 'assistance:wizard.fields.availableAssets',
        helpKey: 'assistance:wizard.fields.availableAssetsHelp',
      },
      {
        key: 'restrictedAssets',
        labelKey: 'assistance:wizard.fields.restrictedAssets',
        helpKey: 'assistance:wizard.fields.excludedHelp',
      },
      {
        key: 'unreceivedInheritance',
        labelKey: 'assistance:wizard.fields.unreceivedInheritance',
        helpKey: 'assistance:wizard.fields.excludedHelp',
      },
      { key: 'savings', labelKey: 'assistance:wizard.fields.savings' },
    ],
  },
  {
    section: 'obligations',
    titleKey: 'assistance:wizard.steps.obligations',
    whyKey: 'assistance:wizard.why.obligations',
    fields: [
      { key: 'monthlyRent', labelKey: 'assistance:wizard.fields.monthlyRent' },
      { key: 'monthlyDebtPayments', labelKey: 'assistance:wizard.fields.monthlyDebt' },
      { key: 'monthlyEssentials', labelKey: 'assistance:wizard.fields.monthlyEssentials' },
      { key: 'dependentsCount', labelKey: 'assistance:wizard.fields.dependents' },
    ],
  },
];

export function sectionValues(
  draft: AssistanceDraftState,
  section: NumericSection,
): Readonly<Record<string, number | null>> {
  if (section === 'income') {
    return {
      monthlyIncome: draft.income.monthlyIncome,
      stabilityMonths: draft.income.stabilityMonths,
    };
  }
  if (section === 'assets') {
    return {
      availableAssets: draft.assets.availableAssets,
      restrictedAssets: draft.assets.restrictedAssets,
      unreceivedInheritance: draft.assets.unreceivedInheritance,
      savings: draft.assets.savings,
    };
  }
  return {
    monthlyRent: draft.obligations.monthlyRent,
    monthlyDebtPayments: draft.obligations.monthlyDebtPayments,
    monthlyEssentials: draft.obligations.monthlyEssentials,
    dependentsCount: draft.obligations.dependentsCount,
  };
}
