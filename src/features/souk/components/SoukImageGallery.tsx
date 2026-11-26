// Demo storage returns memory:// ids, not renderable URLs. We show honest
// labelled placeholders instead of broken images. Real URLs arrive in P18.
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { Badge, Icon, Text } from '@/components/ui';
import { useTheme } from '@/theme';

export interface SoukImageGalleryProps {
  readonly fileIds: readonly string[];
  readonly testID?: string;
}

export function SoukImageGallery({ fileIds, testID }: SoukImageGalleryProps) {
  const theme = useTheme();
  const { t } = useTranslation();

  if (fileIds.length === 0) {
    return (
      <Text variant="caption" color="secondary" testID={testID ? `${testID}-empty` : undefined}>
        {t('marketplace:souk.images.none')}
      </Text>
    );
  }

  return (
    <View style={{ gap: theme.spacing[2] }} testID={testID}>
      <View style={[styles.row, { gap: theme.spacing[2] }]}>
        {fileIds.map((fileId, index) => (
          <View
            key={fileId}
            testID={`${testID ?? 'souk-image'}-${index}`}
            style={[
              styles.tile,
              {
                backgroundColor: theme.colors.bg.raised,
                borderColor: theme.colors.border.subtle,
                borderRadius: theme.radius.md,
              },
            ]}
          >
            <Icon name="shoppingBag" size={22} color={theme.colors.text.secondary} />
          </View>
        ))}
      </View>
      <Badge variant="demo" size="sm" label={t('marketplace:souk.images.demoNote')} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap' },
  tile: {
    width: 72,
    height: 72,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
