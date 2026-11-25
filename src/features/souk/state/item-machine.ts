// Pure item lifecycle. 8 workflow statuses, 10 declared transitions.
// 'claimed' is a legacy read-only alias of 'handed_over'.
import { AppError } from '@/core/errors';
import type { Result } from '@/core/result';
import type { SoukStatus } from '@/repositories/contracts/souk';

export const ITEM_STATUSES = [
  'draft',
  'pending_review',
  'available',
  'reserved',
  'handed_over',
  'withdrawn',
  'expired',
  'rejected',
] as const;
export type ItemWorkflowStatus = (typeof ITEM_STATUSES)[number];

export type ItemActor = 'donor' | 'moderator' | 'system';

export interface ItemTransition {
  readonly from: ItemWorkflowStatus;
  readonly to: ItemWorkflowStatus;
  readonly actor: ItemActor;
}

export const ITEM_TRANSITIONS: readonly ItemTransition[] = Object.freeze([
  Object.freeze({ from: 'draft', to: 'pending_review', actor: 'donor' }),
  Object.freeze({ from: 'draft', to: 'available', actor: 'donor' }),
  Object.freeze({ from: 'pending_review', to: 'available', actor: 'moderator' }),
  Object.freeze({ from: 'pending_review', to: 'rejected', actor: 'moderator' }),
  Object.freeze({ from: 'available', to: 'reserved', actor: 'system' }),
  Object.freeze({ from: 'available', to: 'withdrawn', actor: 'donor' }),
  Object.freeze({ from: 'available', to: 'expired', actor: 'system' }),
  Object.freeze({ from: 'reserved', to: 'handed_over', actor: 'system' }),
  Object.freeze({ from: 'reserved', to: 'available', actor: 'system' }),
  Object.freeze({ from: 'expired', to: 'draft', actor: 'donor' }),
] as const);

const TERMINAL: readonly ItemWorkflowStatus[] = ['handed_over', 'withdrawn', 'rejected'];

export function isItemWorkflowStatus(value: string): value is ItemWorkflowStatus {
  return (ITEM_STATUSES as readonly string[]).includes(value);
}

export function toItemWorkflowStatus(status: SoukStatus): ItemWorkflowStatus {
  if (status === 'claimed') return 'handed_over';
  return isItemWorkflowStatus(status) ? status : 'draft';
}

export function isItemTerminal(status: ItemWorkflowStatus): boolean {
  return TERMINAL.includes(status);
}

export function canItemTransition(
  from: ItemWorkflowStatus,
  to: ItemWorkflowStatus,
  actor?: ItemActor,
): boolean {
  return ITEM_TRANSITIONS.some(
    (t) => t.from === from && t.to === to && (actor === undefined || t.actor === actor),
  );
}

export function nextItemStatuses(
  from: ItemWorkflowStatus,
  actor?: ItemActor,
): readonly ItemWorkflowStatus[] {
  return ITEM_TRANSITIONS.filter(
    (t) => t.from === from && (actor === undefined || t.actor === actor),
  ).map((t) => t.to);
}

export function assertItemTransition(
  from: ItemWorkflowStatus,
  to: ItemWorkflowStatus,
  actor?: ItemActor,
): Result<ItemWorkflowStatus> {
  if (canItemTransition(from, to, actor)) return { ok: true, value: to };
  return {
    ok: false,
    error: AppError.conflict({
      code: 'INVALID_TRANSITION',
      context: { from, to, actor: actor ?? 'any' },
    }),
  };
}

/** The client never writes these — they are system-derived. */
export function isClientWritableItemStatus(to: ItemWorkflowStatus): boolean {
  return to !== 'reserved' && to !== 'handed_over' && to !== 'expired';
}
