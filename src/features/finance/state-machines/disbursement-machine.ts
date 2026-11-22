// Pure disbursement lifecycle (P09.1). Maker proposes, a DIFFERENT checker
// approves, finance records proof, the beneficiary confirms or disputes.
import { AppError } from '@/core/errors';
import type { Result } from '@/core/result';
import type {
  DisbursementActor,
  DisbursementStatus,
} from '@/repositories/contracts/disbursement';

export const DISBURSEMENT_STATUSES = [
  'proposed',
  'approved',
  'paid_recorded',
  'confirmed_by_beneficiary',
  'disputed',
  'rejected',
] as const;
export type DisbursementWorkflowStatus = (typeof DISBURSEMENT_STATUSES)[number];

export interface DisbursementTransition {
  readonly from: DisbursementWorkflowStatus;
  readonly to: DisbursementWorkflowStatus;
  readonly actor: DisbursementActor;
}

export const DISBURSEMENT_TRANSITIONS: readonly DisbursementTransition[] = Object.freeze([
  Object.freeze({ from: 'proposed', to: 'approved', actor: 'checker' }),
  Object.freeze({ from: 'proposed', to: 'rejected', actor: 'checker' }),
  Object.freeze({ from: 'approved', to: 'paid_recorded', actor: 'finance_officer' }),
  Object.freeze({ from: 'paid_recorded', to: 'confirmed_by_beneficiary', actor: 'beneficiary' }),
  Object.freeze({ from: 'paid_recorded', to: 'disputed', actor: 'beneficiary' }),
  Object.freeze({ from: 'disputed', to: 'paid_recorded', actor: 'finance_officer' }),
] as const);

const TERMINAL: readonly DisbursementWorkflowStatus[] = [
  'confirmed_by_beneficiary',
  'rejected',
];

export function isDisbursementWorkflowStatus(
  value: string,
): value is DisbursementWorkflowStatus {
  return (DISBURSEMENT_STATUSES as readonly string[]).includes(value);
}

/** Legacy: pending → proposed, confirmed → paid_recorded (NOT beneficiary-confirmed). */
export function toDisbursementWorkflowStatus(
  status: DisbursementStatus,
): DisbursementWorkflowStatus {
  if (status === 'pending') return 'proposed';
  if (status === 'confirmed') return 'paid_recorded';
  return isDisbursementWorkflowStatus(status) ? status : 'proposed';
}

export function isDisbursementTerminal(status: DisbursementWorkflowStatus): boolean {
  return TERMINAL.includes(status);
}

export function canDisbursementTransition(
  from: DisbursementWorkflowStatus,
  to: DisbursementWorkflowStatus,
  actor?: DisbursementActor,
): boolean {
  return DISBURSEMENT_TRANSITIONS.some(
    (t) => t.from === from && t.to === to && (actor === undefined || t.actor === actor),
  );
}

export function nextDisbursementStatuses(
  from: DisbursementWorkflowStatus,
  actor?: DisbursementActor,
): readonly DisbursementWorkflowStatus[] {
  return DISBURSEMENT_TRANSITIONS.filter(
    (t) => t.from === from && (actor === undefined || t.actor === actor),
  ).map((t) => t.to);
}

export function assertDisbursementTransition(
  from: DisbursementWorkflowStatus,
  to: DisbursementWorkflowStatus,
  actor?: DisbursementActor,
): Result<DisbursementWorkflowStatus> {
  if (canDisbursementTransition(from, to, actor)) return { ok: true, value: to };
  return {
    ok: false,
    error: AppError.conflict({
      code: 'INVALID_TRANSITION',
      context: { from, to, actor: actor ?? 'any' },
    }),
  };
}
