import { AppError } from '@/core/errors';
import type { Result } from '@/core/result';
import type { WeddingStatus } from '@/repositories/contracts/wedding';

export const GROUP_STATUSES = [
  'draft',
  'open',
  'planning',
  'agreed',
  'completed',
  'cancelled',
] as const;
export type GroupStatus = (typeof GROUP_STATUSES)[number];

export type GroupActor = 'organizer' | 'co_organizer' | 'system';

export interface GroupTransition {
  readonly from: GroupStatus;
  readonly to: GroupStatus;
  readonly actor: GroupActor;
}

export const GROUP_TRANSITIONS: readonly GroupTransition[] = Object.freeze([
  Object.freeze({ from: 'draft', to: 'open', actor: 'organizer' }),
  Object.freeze({ from: 'draft', to: 'cancelled', actor: 'organizer' }),
  Object.freeze({ from: 'open', to: 'planning', actor: 'organizer' }),
  Object.freeze({ from: 'open', to: 'cancelled', actor: 'organizer' }),
  Object.freeze({ from: 'planning', to: 'agreed', actor: 'organizer' }),
  Object.freeze({ from: 'planning', to: 'open', actor: 'organizer' }),
  Object.freeze({ from: 'planning', to: 'cancelled', actor: 'organizer' }),
  Object.freeze({ from: 'agreed', to: 'completed', actor: 'organizer' }),
  Object.freeze({ from: 'agreed', to: 'cancelled', actor: 'organizer' }),
] as const);

const TERMINAL: readonly GroupStatus[] = ['completed', 'cancelled'];

export function isGroupStatus(value: string): value is GroupStatus {
  return (GROUP_STATUSES as readonly string[]).includes(value);
}

/** Legacy 'closed' is a read-only alias of 'planning'. */
export function toGroupStatus(status: WeddingStatus): GroupStatus {
  if (status === 'closed') return 'planning';
  return isGroupStatus(status) ? status : 'draft';
}

export function isGroupTerminal(status: GroupStatus): boolean {
  return TERMINAL.includes(status);
}

export function canGroupTransition(
  from: GroupStatus,
  to: GroupStatus,
  actor?: GroupActor,
): boolean {
  return GROUP_TRANSITIONS.some(
    (t) => t.from === from && t.to === to && (actor === undefined || t.actor === actor),
  );
}

export function nextGroupStatuses(
  from: GroupStatus,
  actor?: GroupActor,
): readonly GroupStatus[] {
  return GROUP_TRANSITIONS.filter(
    (t) => t.from === from && (actor === undefined || t.actor === actor),
  ).map((t) => t.to);
}

export function assertGroupTransition(
  from: GroupStatus,
  to: GroupStatus,
  actor?: GroupActor,
): Result<GroupStatus> {
  if (canGroupTransition(from, to, actor)) return { ok: true, value: to };
  return {
    ok: false,
    error: AppError.conflict({
      code: 'INVALID_TRANSITION',
      context: { from, to, actor: actor ?? 'any' },
    }),
  };
}
