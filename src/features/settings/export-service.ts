// Pure export document assembly. No IO, no native modules — unit-testable.
// Never includes tokens or passwords.
import type { AccountExport } from '@/providers';
import type { Profile } from '@/repositories/contracts/profile';
import type { NotificationPrefs, NumberSystem, ProfileVisibility } from '@/stores';

export interface ExportPreferences {
  readonly numberSystem: NumberSystem;
  readonly appearance: string;
  readonly visibility: ProfileVisibility;
  readonly storiesConsent: boolean;
  readonly notifications: NotificationPrefs;
  readonly biometricLock: boolean;
}

export interface ExportDocument {
  readonly schemaVersion: 1;
  readonly generatedAt: string;
  readonly app: { readonly name: 'AZIB'; readonly phase: 'P06' };
  readonly account: AccountExport | null;
  readonly profile: Profile | null;
  readonly preferences: ExportPreferences;
  /** i18n keys describing what this export does not contain. */
  readonly notices: readonly string[];
}

export interface BuildExportInput {
  readonly account: AccountExport | null;
  readonly profile: Profile | null;
  readonly preferences: ExportPreferences;
  readonly now?: Date;
}

export const EXPORT_NOTICES: readonly string[] = [
  'auth:export.noticeNoTokens',
  'auth:export.noticeNoOtherUsers',
  'auth:export.noticeDemo',
] as const;

export function buildExportDocument(input: BuildExportInput): ExportDocument {
  const now = input.now ?? new Date();
  return {
    schemaVersion: 1,
    generatedAt: now.toISOString(),
    app: { name: 'AZIB', phase: 'P06' },
    account: input.account,
    profile: input.profile,
    preferences: input.preferences,
    notices: EXPORT_NOTICES,
  };
}

export function serializeExport(document: ExportDocument): string {
  return JSON.stringify(document, null, 2);
}

export function exportFileName(generatedAt: string): string {
  const stamp = generatedAt.slice(0, 10).replace(/-/g, '');
  return `azib-export-${stamp}.json`;
}
