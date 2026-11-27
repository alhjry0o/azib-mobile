// Maps Souk domain error codes to i18n keys. Falls back to the shared auth map.
import type { AppError } from '@/core/errors';
import { authErrorKey } from '@/features/auth/errors';

const CODE_KEYS: Readonly<Record<string, string>> = {
  ITEM_NOT_FOUND: 'marketplace:souk.errors.itemNotFound',
  NOT_ITEM_DONOR: 'marketplace:souk.errors.notItemDonor',
  ITEM_NOT_AVAILABLE: 'marketplace:souk.errors.itemNotAvailable',
  ITEM_RATE_LIMITED: 'marketplace:souk.errors.itemRateLimited',
  ITEM_CONTACT_IN_DESCRIPTION: 'marketplace:souk.errors.contactInDescription',
  NO_RESALE_CONSENT_REQUIRED: 'marketplace:souk.errors.noResaleConsent',
  TOO_MANY_IMAGES: 'marketplace:souk.errors.tooManyImages',
  INVALID_ITEM: 'marketplace:souk.errors.invalidItem',
  OWN_ITEM: 'marketplace:souk.errors.ownItem',
  ACTIVE_REQUEST_LIMIT: 'marketplace:souk.errors.activeRequestLimit',
  DUPLICATE_REQUEST: 'marketplace:souk.errors.duplicateRequest',
  REQUEST_RATE_LIMITED: 'marketplace:souk.errors.requestRateLimited',
  REQUEST_NOT_FOUND: 'marketplace:souk.errors.requestNotFound',
  REQUEST_NOT_ACCEPTED: 'marketplace:souk.errors.requestNotAccepted',
  INVALID_REQUEST: 'marketplace:souk.errors.invalidRequest',
  NOT_A_PARTY: 'marketplace:souk.errors.notAParty',
  HANDOVER_NOT_READY: 'marketplace:souk.errors.handoverNotReady',
  HANDOVER_CODE_MISMATCH: 'marketplace:souk.errors.handoverCodeMismatch',
  HANDOVER_NOT_COMPLETED: 'marketplace:souk.errors.handoverNotCompleted',
  INVALID_RATING: 'marketplace:souk.errors.invalidRating',
  RATING_NOTE_TOO_LONG: 'marketplace:souk.errors.ratingNoteTooLong',
  CHAT_CONTENT_BLOCKED: 'marketplace:souk.errors.chatContentBlocked',
  CHAT_RATE_LIMITED: 'marketplace:souk.errors.chatRateLimited',
  INVALID_MESSAGE: 'marketplace:souk.errors.invalidMessage',
  MESSAGE_NOT_FOUND: 'marketplace:souk.errors.messageNotFound',
  REPORT_NOT_FOUND: 'marketplace:souk.errors.reportNotFound',
  INVALID_REPORT: 'marketplace:souk.errors.invalidReport',
  INVALID_TRANSITION: 'marketplace:souk.errors.invalidTransition',
  REASON_REQUIRED: 'marketplace:souk.errors.reasonRequired',
  NO_PERMISSION: 'marketplace:souk.errors.noPermission',
  NO_SESSION: 'marketplace:souk.errors.noSession',
};

export function soukErrorKey(error: AppError): string {
  const code = error.meta.code;
  if (code && CODE_KEYS[code]) return CODE_KEYS[code];
  return authErrorKey(error);
}
