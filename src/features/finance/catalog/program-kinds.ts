// Program taxonomy (D-2). Qard Hasan is information + licensed referral ONLY:
// no lending inside the app. In-kind links to Souk Khair, not to money intents.
import type { ProgramKind } from '@/repositories/contracts/program';

export const PROGRAM_KINDS: readonly ProgramKind[] = [
  'grant',
  'partial',
  'qard_hasan',
  'in_kind',
  'donor_contribution',
];

export interface ProgramKindInfo {
  readonly kind: ProgramKind;
  readonly labelKey: string;
  readonly descriptionKey: string;
  /** Money donation intents are allowed for this kind. */
  readonly donatable: boolean;
  /** Information + referral to a licensed entity, no in-app financial action. */
  readonly referralOnly: boolean;
  /** Fulfilled through Souk Khair (in-kind), not through money. */
  readonly inKind: boolean;
}

export const PROGRAM_KIND_CATALOG: readonly ProgramKindInfo[] = [
  Object.freeze({
    kind: 'grant',
    labelKey: 'assistance:finance.kinds.grant.label',
    descriptionKey: 'assistance:finance.kinds.grant.description',
    donatable: true,
    referralOnly: false,
    inKind: false,
  }),
  Object.freeze({
    kind: 'partial',
    labelKey: 'assistance:finance.kinds.partial.label',
    descriptionKey: 'assistance:finance.kinds.partial.description',
    donatable: true,
    referralOnly: false,
    inKind: false,
  }),
  Object.freeze({
    kind: 'qard_hasan',
    labelKey: 'assistance:finance.kinds.qardHasan.label',
    descriptionKey: 'assistance:finance.kinds.qardHasan.description',
    donatable: false,
    referralOnly: true,
    inKind: false,
  }),
  Object.freeze({
    kind: 'in_kind',
    labelKey: 'assistance:finance.kinds.inKind.label',
    descriptionKey: 'assistance:finance.kinds.inKind.description',
    donatable: false,
    referralOnly: false,
    inKind: true,
  }),
  Object.freeze({
    kind: 'donor_contribution',
    labelKey: 'assistance:finance.kinds.donorContribution.label',
    descriptionKey: 'assistance:finance.kinds.donorContribution.description',
    donatable: true,
    referralOnly: false,
    inKind: false,
  }),
];

const DEFAULT_KIND: ProgramKind = 'grant';

export function programKindOf(program: { readonly kind?: ProgramKind }): ProgramKind {
  return program.kind ?? DEFAULT_KIND;
}

export function kindInfo(kind: ProgramKind): ProgramKindInfo {
  const found = PROGRAM_KIND_CATALOG.find((entry) => entry.kind === kind);
  return found ?? PROGRAM_KIND_CATALOG[0]!;
}
