import { AppError } from '@/core/errors';
import type { Result } from '@/core/result';
import type { SoukRequestStatus } from '@/repositories/contracts/souk-request';

export const REQUEST_STATUSES = [
  'pending',
  'accepted',
  'rejected',
  'cancelled',
  'handed_over',
] as const;
export type RequestWorkflowStatus = (typeof REQUEST_STATUSES)[number];

export type RequestActor = 'requester' | 'donor' | 'moderator' | 'system';

export interface RequestTransition {
  readonly from: RequestWorkflowStatus;
  readonly to: RequestWorkflowStatus;
  readonly actor: RequestActor;
}

export const REQUEST_TRANSITIONS: readonly RequestTransition[] = Object.freeze([
  Object.freeze({ from: 'pending', to: 'accepted', actor: 'donor' }),
  Object.freeze({ from: 'pending', to: 'accepted', actor: 'moderator' }),
  Object.freeze({ from: 'pending', to: 'rejected', actor: 'donor' }),
  Object.freeze({ from: 'pending', to: 'rejected', actor: 'moderator' }),
  Object.freeze({ from: 'pending', to: 'cancelled', actor: 'requester' }),
  Object.freeze({ from: 'accepted', to: 'handed_over', actor: 'system' }),
  Object.freeze({ from: 'accepted', to: 'cancelled', actor: 'donor' }),
  Object.freeze({ from: 'accepted', to: 'cancelled', actor: 'requester' }),
  Object.freeze({ from: 'accepted', to: 'cancelled', actor: 'moderator' }),
] as const);

const TERMINAL: readonly RequestWorkflowStatus[] = ['rejected', 'cancelled', 'handed_over'];

export function isRequestWorkflowStatus(value: string): value is RequestWorkflowStatus {
  return (REQUEST_STATUSES as readonly string[]).includes(value);
}

export function toRequestWorkflowStatus(status: SoukRequestStatus): RequestWorkflowStatus {
  return isRequestWorkflowStatus(status) ? status : 'pending';
}

export function isRequestTerminal(status: RequestWorkflowStatus): boolean {
  return TERMINAL.includes(status);
}

export function isActiveRequestStatus(status: RequestWorkflowStatus): boolean {
  return status === 'pending' || status === 'accepted';
}

export function canRequestTransition(
  from: RequestWorkflowStatus,
  to: RequestWorkflowStatus,
  actor?: RequestActor,
): boolean {
  return REQUEST_TRANSITIONS.some(
    (t) => t.from === from && t.to === to && (actor === undefined || t.actor === actor),
  );
}

export function nextRequestStatuses(
  from: RequestWorkflowStatus,
  actor?: RequestActor,
): readonly RequestWorkflowStatus[] {
  const out: RequestWorkflowStatus[] = [];
  for (const t of REQUEST_TRANSITIONS) {
    if (t.from !== from) continue;
    if (actor !== undefined && t.actor !== actor) continue;
    if (!out.includes(t.to)) out.push(t.to);
  }
  return out;
}

export function assertRequestTransition(
  from: RequestWorkflowStatus,
  to: RequestWorkflowStatus,
  actor?: RequestActor,
): Result<RequestWorkflowStatus> {
  if (canRequestTransition(from, to, actor)) return { ok: true, value: to };
  return {
    ok: false,
    error: AppError.conflict({
      code: 'INVALID_TRANSITION',
      context: { from, to, actor: actor ?? 'any' },
    }),
  };
}
