// Shared informational row for onboarding steps (icon + title + description).
// Static by design: no press handlers, no dead buttons.
import { StyleSheet, View } from 'react-native';
import { Icon, Text, type IconName } from '@/components/ui';
import { useDirection } from '@/hooks';
import { useTheme } from '@/theme';

export interface InfoRowProps {
  readonly icon: IconName;
  readonly tint: string;
  readonly title: string;
  readonly description: string;
}

export function InfoRow({ icon, tint, title, description }: InfoRowProps) {
  const theme = useTheme();
  const { isRTL } = useDirection();

  return (
    <View
      style={[
        styles.row,
        { flexDirection: isRTL ? 'row-reverse' : 'row', gap: theme.spacing[3] },
      ]}
    >
      <View
        style={[
          styles.iconWrap,
          { borderColor: tint, backgroundColor: theme.colors.bg.surface },
        ]}
      >
        <Icon name={icon} size={20} color={tint} />
      </View>
      <View style={styles.textBlock}>
        <Text variant="bodyStrong">{title}</Text>
        <Text variant="caption" color="secondary">
          {description}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { alignItems: 'center', width: '100%' },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textBlock: { flex: 1, gap: 2 },
});
