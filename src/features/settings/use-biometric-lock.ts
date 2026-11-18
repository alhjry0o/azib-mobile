import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSettingsStore } from '@/stores';
import { authenticateBiometric, readBiometricCapability } from './biometric';

export interface BiometricLockApi {
  readonly supported: boolean;
  readonly enrolled: boolean;
  readonly ready: boolean;
  readonly enabled: boolean;
  readonly busy: boolean;
  setEnabled(value: boolean): void;
  unlock(): Promise<boolean>;
}

export function useBiometricLock(): BiometricLockApi {
  const { t } = useTranslation();
  const enabled = useSettingsStore((s) => s.biometricLock);
  const setEnabled = useSettingsStore((s) => s.setBiometricLock);
  const [supported, setSupported] = useState(false);
  const [enrolled, setEnrolled] = useState(false);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let mounted = true;
    void readBiometricCapability().then((capability) => {
      if (!mounted) return;
      setSupported(capability.supported);
      setEnrolled(capability.enrolled);
      setReady(true);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const unlock = useCallback(async (): Promise<boolean> => {
    setBusy(true);
    const result = await authenticateBiometric(t('auth:security.biometricPrompt'));
    setBusy(false);
    return result.ok;
  }, [t]);

  return { supported, enrolled, ready, enabled, busy, setEnabled, unlock };
}
