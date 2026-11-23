import type { GroupRole } from '@/repositories/contracts/wedding-group';
import { can } from '../state/roles';

export interface SendEligibilityInput {
  readonly role: GroupRole | null;
  readonly isActiveMember: boolean;
  readonly mutedUntil?: string | null;
  readonly now: Date;
}

export interface SendEligibility {
  readonly allowed: boolean;
  readonly reasonKey: string | null;
}

export function canSendMessage(input: SendEligibilityInput): SendEligibility {
  if (!input.isActiveMember || input.role === null) {
    return { allowed: false, reasonKey: 'weddings:chat.blocked.notMember' };
  }
  const mutedUntil = input.mutedUntil ?? null;
  if (mutedUntil === null) {
    // A null expiry means an open-ended mute.
    return { allowed: false, reasonKey: 'weddings:chat.blocked.muted' };
  }
  const stamp = Date.parse(mutedUntil);
  if (!Number.isNaN(stamp) && stamp > input.now.getTime()) {
    return { allowed: false, reasonKey: 'weddings:chat.blocked.muted' };
  }
  if (!can(input.role, 'send_message')) {
    return { allowed: false, reasonKey: 'weddings:chat.blocked.notMember' };
  }
  return { allowed: true, reasonKey: null };
}

/** Muting and removing messages are organizer-only (HRD P10 §4). */
export function canModerate(role: GroupRole | null): boolean {
  return role === 'organizer';
}

export function canReport(role: GroupRole | null, isActiveMember: boolean): boolean {
  return isActiveMember && role !== null;
}
