// Progressive contact disclosure (HRD P12 §3 / D-5).
// No phone lives on the item or the request. It is read from Profile.phone
// ONLY when the request is accepted AND both parties consented.
import type { SoukRequestStatus } from '@/repositories/contracts/souk-request';

export type DisclosureState = 'not_a_party' | 'not_accepted' | 'awaiting_consents' | 'ready';

export interface DisclosureInput {
  readonly requestStatus: SoukRequestStatus;
  readonly donorContactConsent: boolean;
  readonly recipientContactConsent: boolean;
  readonly viewerId: string;
  readonly donorId: string;
  readonly requesterId: string;
}

export function disclosureState(input: DisclosureInput): DisclosureState {
  const isParty = input.viewerId === input.donorId || input.viewerId === input.requesterId;
  if (!isParty || input.viewerId.length === 0) return 'not_a_party';
  if (input.requestStatus !== 'accepted') return 'not_accepted';
  if (!input.donorContactConsent || !input.recipientContactConsent) return 'awaiting_consents';
  return 'ready';
}

export function canDiscloseContact(input: DisclosureInput): boolean {
  return disclosureState(input) === 'ready';
}

/**
 * Returns the counterparty phone only. Never both, never to a third party.
 * `counterpartyPhone` comes from ProfileRepository.getByUserId at call time.
 */
export function disclosedPhone(
  input: DisclosureInput,
  counterpartyPhone: string | null,
): string | null {
  if (!canDiscloseContact(input)) return null;
  if (input.viewerId === input.donorId && input.viewerId === input.requesterId) return null;
  return counterpartyPhone;
}

export function counterpartyId(input: DisclosureInput): string | null {
  if (input.viewerId === input.donorId) return input.requesterId;
  if (input.viewerId === input.requesterId) return input.donorId;
  return null;
}

export function disclosureReasonKey(state: DisclosureState): string {
  return `marketplace:souk.disclosure.${state}`;
}
