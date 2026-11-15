import { StyleSheet, View } from 'react-native';
import { DemoBanner } from './DemoBanner';
import { OfflineBanner } from './OfflineBanner';

export function ShellBanners() {
  return (
    <View style={styles.container} pointerEvents="box-none">
      <OfflineBanner />
      <DemoBanner />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 2 },
});
