// Optional biometric gate for sensitive screens. When the lock is off the
// children render immediately; when on, a real unlock is required.
import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { Banner, Button, Icon, Screen, Text } from '@/components/ui';
import { useTheme } from '@/theme';
import { useBiometricLock } from '../use-biometric-lock';

export interface BiometricGateProps {
  readonly testID: string;
  readonly children: ReactNode;
}

export function BiometricGate({ testID, children }: BiometricGateProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const lock = useBiometricLock();
  const [unlocked, setUnlocked] = useState(false);
  const [failed, setFailed] = useState(false);

  if (!lock.enabled || unlocked) return <>{children}</>;

  const unlock = async (): Promise<void> => {
    const ok = await lock.unlock();
    setFailed(!ok);
    setUnlocked(ok);
  };

  return (
    <Screen testID={`${testID}-locked`} style={styles.center}>
      <View
        style={[
          styles.iconCircle,
          { borderColor: theme.colors.accent.fill, backgroundColor: theme.colors.bg.surface },
        ]}
      >
        <Icon name="shield" size={28} color={theme.colors.text.accent} />
      </View>
      <Text variant="h3" align="center">
        {t('auth:security.lockedTitle')}
      </Text>
      <Text variant="body" color="secondary" align="center">
        {t('auth:security.lockedDescription')}
      </Text>
      {failed ? (
        <Banner
          variant="error"
          message={t('auth:security.biometricFailed')}
          testID={`${testID}-lock-error`}
        />
      ) : null}
      <Button
        fullWidth
        loading={lock.busy}
        label={t('auth:security.unlock')}
        onPress={() => {
          void unlock();
        }}
        testID={`${testID}-unlock`}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center', gap: 16 },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
