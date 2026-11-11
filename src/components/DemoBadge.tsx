import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

export interface DemoBadgeProps {
  readonly visible?: boolean;
}

/**
 * Small pill that flags demo data to the user.
 * Uses i18n key `demo.badge` (never literal text).
 */
export function DemoBadge({ visible = true }: DemoBadgeProps) {
  const { t } = useTranslation();
  if (!visible) return null;
  return (
    <View style={styles.pill} accessibilityRole="text">
      <Text style={styles.text}>{t('demo.badge')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: '#D9A92822',
    borderWidth: 1,
    borderColor: '#D9A928',
  },
  text: {
    color: '#F0CA68',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
