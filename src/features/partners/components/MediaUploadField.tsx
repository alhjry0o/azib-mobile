import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { Badge, Button, Card, Text } from '@/components/ui';
import { useTheme } from '@/theme';

export interface MediaUploadFieldProps {
  readonly testID: string;
  readonly label: string;
  readonly helpText?: string;
  readonly fileIds: readonly string[];
  readonly uploading: boolean;
  readonly allowPdf?: boolean;
  readonly onPick: (source: 'image' | 'pdf') => void;
  readonly onRemove: (fileId: string) => void;
}

export function MediaUploadField({
  testID,
  label,
  helpText,
  fileIds,
  uploading,
  allowPdf = false,
  onPick,
  onRemove,
}: MediaUploadFieldProps) {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <Card style={{ gap: theme.spacing[2] }} testID={testID}>
      <Text variant="bodyStrong">{label}</Text>
      {helpText ? (
        <Text variant="caption" color="secondary">
          {helpText}
        </Text>
      ) : null}
      <View style={[styles.row, { gap: theme.spacing[2] }]}>
        <Button
          style={styles.action}
          size="sm"
          variant="secondary"
          leftIcon="plus"
          disabled={uploading}
          label={t('marketplace:media.pickImage')}
          onPress={() => onPick('image')}
          testID={`${testID}-pick-image`}
        />
        {allowPdf ? (
          <Button
            style={styles.action}
            size="sm"
            variant="secondary"
            leftIcon="plus"
            disabled={uploading}
            label={t('marketplace:media.pickPdf')}
            onPress={() => onPick('pdf')}
            testID={`${testID}-pick-pdf`}
          />
        ) : null}
      </View>
      {uploading ? (
        <Text variant="caption" color="secondary" testID={`${testID}-uploading`}>
          {t('marketplace:media.uploading')}
        </Text>
      ) : null}
      {fileIds.length === 0 ? (
        <Text variant="caption" color="secondary" testID={`${testID}-empty`}>
          {t('marketplace:media.empty')}
        </Text>
      ) : (
        fileIds.map((fileId) => (
          <View key={fileId} style={[styles.row, { gap: theme.spacing[2] }]}>
            <Badge variant="demo" size="sm" label={t('marketplace:media.attached')} />
            <Text variant="caption" color="secondary" style={styles.grow} numberOfLines={1}>
              {fileId}
            </Text>
            <Button
              variant="icon"
              size="sm"
              leftIcon="x"
              accessibilityLabel={t('marketplace:media.remove')}
              onPress={() => onRemove(fileId)}
              testID={`${testID}-remove-${fileId}`}
            />
          </View>
        ))
      )}
      <Text variant="caption" color="secondary">
        {t('marketplace:media.privateNote')}
      </Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  action: { flex: 1 },
  grow: { flex: 1 },
});
