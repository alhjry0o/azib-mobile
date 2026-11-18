import { useCallback, useState } from 'react';
import type { AppError } from '@/core/errors';
import type { Result } from '@/core/result';
import { useProviderContainer } from '@/providers';
import { useProfile } from '@/features/profile';
import { useSettingsStore } from '@/stores';
import { saveAndShareExport, type SavedExport } from './export-file';
import { buildExportDocument, exportFileName, serializeExport } from './export-service';

export interface DataExportApi {
  readonly busy: boolean;
  readonly error: AppError | null;
  readonly saved: SavedExport | null;
  run(): Promise<Result<SavedExport>>;
}

export function useDataExport(): DataExportApi {
  const container = useProviderContainer();
  const profileApi = useProfile();
  const numberSystem = useSettingsStore((s) => s.numberSystem);
  const appearance = useSettingsStore((s) => s.appearance);
  const visibility = useSettingsStore((s) => s.visibility);
  const storiesConsent = useSettingsStore((s) => s.storiesConsent);
  const notifications = useSettingsStore((s) => s.notifications);
  const biometricLock = useSettingsStore((s) => s.biometricLock);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<AppError | null>(null);
  const [saved, setSaved] = useState<SavedExport | null>(null);

  const run = useCallback(async (): Promise<Result<SavedExport>> => {
    setBusy(true);
    setError(null);
    const account = await container.auth.exportAccountData();
    if (!account.ok) {
      setError(account.error);
      setBusy(false);
      return { ok: false, error: account.error };
    }
    const document = buildExportDocument({
      account: account.value,
      profile: profileApi.profile,
      preferences: {
        numberSystem,
        appearance,
        visibility,
        storiesConsent,
        notifications,
        biometricLock,
      },
    });
    const result = await saveAndShareExport(
      exportFileName(document.generatedAt),
      serializeExport(document),
    );
    if (result.ok) setSaved(result.value);
    else setError(result.error);
    setBusy(false);
    return result;
  }, [
    container,
    profileApi.profile,
    numberSystem,
    appearance,
    visibility,
    storiesConsent,
    notifications,
    biometricLock,
  ]);

  return { busy, error, saved, run };
}
