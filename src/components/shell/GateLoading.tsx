import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';
import { DoubleRingLoader } from '@/components/brand';
import { Screen, Text } from '@/components/ui';

export function GateLoading() {
  const { t } = useTranslation();
  return (
    <Screen testID="gate-loading" style={styles.center}>
      <DoubleRingLoader size={72} />
      <Text variant="body" color="secondary">
        {t('common:states.loading')}
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center', gap: 16 },
});
