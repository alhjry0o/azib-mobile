// Human-review reason catalog (P08.3). Keys stored on the decision are i18n
// keys, so the applicant sees respectful translated wording — never scores.
export interface ReasonOption {
  readonly key: string;
  readonly labelKey: string;
}

export interface InfoRequestFieldOption extends ReasonOption {
  readonly reasonKey: string;
}

export const APPROVAL_REASONS: readonly ReasonOption[] = [
  { key: 'documents_verified', labelKey: 'assistance:reasons.approval.documentsVerified' },
  { key: 'need_confirmed', labelKey: 'assistance:reasons.approval.needConfirmed' },
  { key: 'eligible_after_review', labelKey: 'assistance:reasons.approval.eligibleAfterReview' },
];

export const REJECTION_REASONS: readonly ReasonOption[] = [
  { key: 'documents_incomplete', labelKey: 'assistance:reasons.rejection.documentsIncomplete' },
  { key: 'income_above_threshold', labelKey: 'assistance:reasons.rejection.incomeAboveThreshold' },
  { key: 'prior_assistance', labelKey: 'assistance:reasons.rejection.priorAssistance' },
  { key: 'inconsistent_information', labelKey: 'assistance:reasons.rejection.inconsistentInformation' },
];

export const INFO_REQUEST_FIELDS: readonly InfoRequestFieldOption[] = [
  {
    key: 'identity_document',
    labelKey: 'assistance:infoRequest.fields.identityDocument',
    reasonKey: 'assistance:infoRequest.reasons.identityDocument',
  },
  {
    key: 'income_proof',
    labelKey: 'assistance:infoRequest.fields.incomeProof',
    reasonKey: 'assistance:infoRequest.reasons.incomeProof',
  },
  {
    key: 'engagement_proof',
    labelKey: 'assistance:infoRequest.fields.engagementProof',
    reasonKey: 'assistance:infoRequest.reasons.engagementProof',
  },
  {
    key: 'income_figure',
    labelKey: 'assistance:infoRequest.fields.incomeFigure',
    reasonKey: 'assistance:infoRequest.reasons.incomeFigure',
  },
  {
    key: 'assets_figure',
    labelKey: 'assistance:infoRequest.fields.assetsFigure',
    reasonKey: 'assistance:infoRequest.reasons.assetsFigure',
  },
  {
    key: 'obligations_figure',
    labelKey: 'assistance:infoRequest.fields.obligationsFigure',
    reasonKey: 'assistance:infoRequest.reasons.obligationsFigure',
  },
];

export function reasonsFor(outcome: 'approved' | 'rejected'): readonly ReasonOption[] {
  return outcome === 'approved' ? APPROVAL_REASONS : REJECTION_REASONS;
}

export function isKnownReason(key: string): boolean {
  return [...APPROVAL_REASONS, ...REJECTION_REASONS].some((r) => r.labelKey === key);
}
