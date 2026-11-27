import type { AppError } from '@/core/errors';
import { authErrorKey } from '@/features/auth/errors';

const CODE_KEYS: Readonly<Record<string, string>> = {
  JOB_NOT_FOUND: 'jobs:errors.jobNotFound',
  NOT_JOB_PUBLISHER: 'jobs:errors.notJobPublisher',
  JOB_NOT_OPEN: 'jobs:errors.jobNotOpen',
  JOB_RATE_LIMITED: 'jobs:errors.jobRateLimited',
  JOB_CONTACT_IN_TEXT: 'jobs:errors.contactInText',
  PUBLISHER_TERMS_REQUIRED: 'jobs:errors.publisherTermsRequired',
  INVALID_JOB: 'jobs:errors.invalidJob',
  APPLICATION_NOT_FOUND: 'jobs:errors.applicationNotFound',
  ACTIVE_APPLICATION_LIMIT: 'jobs:errors.activeApplicationLimit',
  DUPLICATE_APPLICATION: 'jobs:errors.duplicateApplication',
  APPLY_RATE_LIMITED: 'jobs:errors.applyRateLimited',
  OWN_JOB: 'jobs:errors.ownJob',
  INVALID_APPLICATION: 'jobs:errors.invalidApplication',
  NOT_APPLICATION_OWNER: 'jobs:errors.notApplicationOwner',
  CV_NOT_FOUND: 'jobs:errors.cvNotFound',
  INVALID_SAVE: 'jobs:errors.invalidSave',
  INVALID_REPORT: 'jobs:errors.invalidReport',
  REPORT_NOT_FOUND: 'jobs:errors.reportNotFound',
  INVALID_TRANSITION: 'jobs:errors.invalidTransition',
  REASON_REQUIRED: 'jobs:errors.reasonRequired',
  NO_PERMISSION: 'jobs:errors.noPermission',
  NO_SESSION: 'jobs:errors.noSession',
};

export function jobErrorKey(error: AppError): string {
  const code = error.meta.code;
  if (code && CODE_KEYS[code]) return CODE_KEYS[code];
  return authErrorKey(error);
}
