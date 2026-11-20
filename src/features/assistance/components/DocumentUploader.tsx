import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, StyleSheet, View } from 'react-native';
import {
  Badge,
  Banner,
  Button,
  Card,
  Icon,
  ProgressBar,
  SegmentedControl,
  Text,
} from '@/components/ui';
import type {
  ApplicationDocument,
  ApplicationDocumentKind,
} from '@/repositories/contracts/application';
import { useDirection } from '@/hooks';
import { useTheme } from '@/theme';
import { useDocumentUpload } from '../hooks/use-document-upload';

const KINDS: readonly ApplicationDocumentKind[] = ['identity', 'income_proof', 'engagement_proof'];

export interface DocumentUploaderProps {
  readonly documents: readonly ApplicationDocument[];
  readonly onAdd: (document: ApplicationDocument) => void;
  readonly onRemove: (id: string) => void;
}

function errorKey(code: string | undefined): string {
  if (code === 'PHOTO_PERMISSION_DENIED') return 'assistance:wizard.documents.permission';
  if (code === 'UNSUPPORTED_DOCUMENT_TYPE') return 'assistance:wizard.documents.type';
  if (code === 'DOCUMENT_TOO_LARGE') return 'assistance:wizard.documents.size';
  if (code === 'DOCUMENT_PROCESSING_FAILED') return 'assistance:wizard.documents.processing';
  return 'assistance:wizard.documents.failed';
}

export function DocumentUploader({ documents, onAdd, onRemove }: DocumentUploaderProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const { isRTL } = useDirection();
  const uploader = useDocumentUpload();
  const [kind, setKind] = useState<ApplicationDocumentKind>('identity');

  const pick = async (source: 'image' | 'pdf'): Promise<void> => {
    const result = await uploader.upload(kind, source);
    if (result.ok && result.value) onAdd(result.value);
  };

  return (
    <View style={[styles.container, { gap: theme.spacing[3] }]} testID="document-uploader">
      <SegmentedControl<ApplicationDocumentKind>
        segments={KINDS.map((k) => ({ value: k, label: t(`assistance:documents.kind.${k}`) }))}
        value={kind}
        onChange={setKind}
        testID="document-kind"
      />
      <View
        style={[
          styles.row,
          { flexDirection: isRTL ? 'row-reverse' : 'row', gap: theme.spacing[2] },
        ]}
      >
        <Button
          style={styles.action}
          variant="secondary"
          leftIcon="plus"
          label={t('assistance:wizard.documents.pickImage')}
          disabled={uploader.busy}
          onPress={() => {
            void pick('image');
          }}
          testID="document-pick-image"
        />
        <Button
          style={styles.action}
          variant="secondary"
          leftIcon="plus"
          label={t('assistance:wizard.documents.pickPdf')}
          disabled={uploader.busy}
          onPress={() => {
            void pick('pdf');
          }}
          testID="document-pick-pdf"
        />
      </View>

      {uploader.busy ? (
        <View testID="document-progress">
          <ProgressBar />
          <Text variant="caption" color="secondary">
            {t('assistance:wizard.documents.uploading')}
          </Text>
        </View>
      ) : null}

      {uploader.error ? (
        <Banner
          variant="error"
          message={t(errorKey(uploader.error.meta.code))}
          testID="document-error"
        />
      ) : null}

      {documents.length === 0 ? (
        <Text variant="body" color="secondary" testID="document-empty">
          {t('assistance:wizard.documents.empty')}
        </Text>
      ) : (
        documents.map((document) => (
          <Card key={document.id} testID={`document-${document.id}`} style={{ gap: theme.spacing[2] }}>
            <View
              style={[
                styles.row,
                { flexDirection: isRTL ? 'row-reverse' : 'row', gap: theme.spacing[3] },
              ]}
            >
              {document.mimeType.startsWith('image/') ? (
                <Image
                  source={{ uri: `memory://${document.fileId}` }}
                  style={styles.thumb}
                  testID={`document-thumb-${document.id}`}
                />
              ) : (
                <Icon name="info" size={24} color={theme.colors.text.secondary} />
              )}
              <View style={styles.text}>
                <Text variant="bodyStrong" numberOfLines={1}>
                  {document.fileName}
                </Text>
                <Text variant="caption" color="secondary">
                  {t(`assistance:documents.kind.${document.kind}`)}
                </Text>
              </View>
              <Button
                variant="icon"
                size="sm"
                leftIcon="x"
                accessibilityLabel={t('assistance:wizard.documents.remove')}
                onPress={() => onRemove(document.id)}
                testID={`document-remove-${document.id}`}
              />
            </View>
            <Badge variant="demo" size="sm" label={t('common:demo.badge')} />
          </Card>
        ))
      )}

      <Text variant="caption" color="secondary">
        {t('assistance:documents.limits')}
      </Text>
      <Text variant="caption" color="secondary" testID="document-fingerprint-note">
        {t('assistance:wizard.documents.fingerprintNote')}
      </Text>
      <Text variant="caption" color="secondary">
        {t('assistance:documents.private')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%' },
  row: { alignItems: 'center' },
  action: { flex: 1 },
  text: { flex: 1, gap: 2 },
  thumb: { width: 44, height: 44, borderRadius: 8 },
});
