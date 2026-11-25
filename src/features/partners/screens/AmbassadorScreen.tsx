import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import {
  Badge,
  Banner,
  Button,
  Card,
  EmptyState,
  ErrorState,
  Select,
  Skeleton,
  Text,
  Textarea,
} from '@/components/ui';
import { authErrorKey } from '@/features/auth/errors';
import { childrenOf } from '@/features/profile/locations';
import { useTheme } from '@/theme';
import { MediaUploadField } from '../components/MediaUploadField';
import { PartnerScaffold } from '../components/PartnerScaffold';
import { useAmbassador } from '../hooks/use-ambassador';

export function AmbassadorScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const ambassador = useAmbassador();
  const [region, setRegion] = useState<string | null>(null);
  const [motivation, setMotivation] = useState('');
  const [photos, setPhotos] = useState<readonly string[]>([]);

  const governorates = childrenOf(null).map((g) => ({ value: g.id, label: t(g.nameKey) }));
  const application = ambassador.application;
  const approved = application?.status === 'approved';

  const apply = async (): Promise<void> => {
    if (!region) return;
    await ambassador.apply([region], motivation);
  };

  const uploadPhoto = async (): Promise<void> => {
    const result = await ambassador.uploadPhoto();
    if (result.ok && result.value) {
      const fileId = result.value;
      setPhotos((prev) => [...prev, fileId]);
    }
  };

  return (
    <PartnerScaffold
      testID="ambassador-screen"
      title={t('marketplace:ambassador.title')}
      subtitle={t('marketplace:ambassador.subtitle')}
      notConnectedRetry={ambassador.refetch}
    >
      <Banner
        variant="info"
        message={t('marketplace:ambassador.privacyNote')}
        testID="ambassador-privacy-note"
      />
      {ambassador.isLoading ? <Skeleton variant="rect" height={120} /> : null}
      {ambassador.error ? (
        <ErrorState
          title={t('marketplace:browser.errorTitle')}
          description={t('marketplace:browser.errorDescription')}
          onRetry={ambassador.refetch}
          testID="ambassador-error"
        />
      ) : null}
      {ambassador.actionError ? (
        <Banner
          variant="error"
          message={t(authErrorKey(ambassador.actionError))}
          testID="ambassador-action-error"
        />
      ) : null}

      {!ambassador.isLoading && !application ? (
        <Card style={{ gap: theme.spacing[3] }} testID="ambassador-apply-form">
          <Text variant="h3">{t('marketplace:ambassador.applyTitle')}</Text>
          <Select
            testID="ambassador-region"
            label={t('marketplace:ambassador.region')}
            required
            value={region}
            options={governorates}
            onChange={setRegion}
          />
          <Textarea
            testID="ambassador-motivation"
            label={t('marketplace:ambassador.motivation')}
            required
            value={motivation}
            onChangeText={setMotivation}
            minHeight={90}
          />
          <Button
            fullWidth
            loading={ambassador.busy}
            label={t('marketplace:ambassador.apply')}
            onPress={() => {
              void apply();
            }}
            testID="ambassador-apply"
          />
        </Card>
      ) : null}

      {application ? (
        <Card style={{ gap: theme.spacing[2] }} testID="ambassador-application">
          <Text variant="h3">{t('marketplace:ambassador.applicationTitle')}</Text>
          <Badge
            variant={
              application.status === 'approved'
                ? 'verified'
                : application.status === 'rejected'
                  ? 'danger'
                  : 'pending'
            }
            size="sm"
            label={t(`marketplace:ambassador.status.${application.status}`)}
            testID="ambassador-application-status"
          />
          {application.reasonKey ? (
            <Text variant="caption" color="secondary">
              {t(application.reasonKey)}
            </Text>
          ) : null}
        </Card>
      ) : null}

      {approved ? (
        <>
          <Text variant="h3">{t('marketplace:ambassador.tasksTitle')}</Text>
          {ambassador.tasks.length === 0 ? (
            <EmptyState
              icon="checkCircle"
              title={t('marketplace:ambassador.tasksEmpty')}
              description={t('marketplace:ambassador.tasksEmptyDescription')}
              testID="ambassador-tasks-empty"
            />
          ) : null}
          <MediaUploadField
            testID="ambassador-photos"
            label={t('marketplace:ambassador.photos')}
            fileIds={photos}
            uploading={ambassador.busy}
            onPick={() => {
              void uploadPhoto();
            }}
            onRemove={(fileId) => setPhotos((prev) => prev.filter((id) => id !== fileId))}
          />
          {ambassador.tasks.map((task) => (
            <Card key={task.id} style={{ gap: theme.spacing[2] }} testID={`ambassador-task-${task.id}`}>
              <Text variant="bodyStrong">{t(task.titleKey)}</Text>
              <View style={[styles.row, { gap: theme.spacing[2] }]}>
                <Badge
                  variant={task.status === 'accepted' ? 'success' : 'pending'}
                  size="sm"
                  label={t(`marketplace:ambassador.taskStatus.${task.status}`)}
                />
                <Text variant="caption" color="secondary">
                  {t(`profile:locations.${task.governorateId}`)}
                </Text>
              </View>
              {task.status === 'assigned' ? (
                <Button
                  size="sm"
                  loading={ambassador.busy}
                  label={t('marketplace:ambassador.submitTask')}
                  onPress={() => {
                    void ambassador.submitTask(task.id, null, photos);
                  }}
                  testID={`ambassador-submit-${task.id}`}
                />
              ) : null}
            </Card>
          ))}
        </>
      ) : null}
    </PartnerScaffold>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
});
