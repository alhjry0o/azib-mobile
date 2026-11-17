import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { Avatar, Banner, Button, Text } from '@/components/ui';
import { useTheme } from '@/theme';
import { useAvatarUpload } from '../use-avatar-upload';

export interface AvatarPickerProps {
  readonly name: string;
  readonly testID?: string;
}

function errorKey(code: string | undefined): string {
  if (code === 'PHOTO_PERMISSION_DENIED') return 'profile:avatar.permissionDenied';
  if (code === 'AVATAR_TOO_LARGE') return 'profile:avatar.tooLarge';
  if (code === 'IMAGE_PROCESSING_FAILED') return 'profile:avatar.processingFailed';
  return 'profile:avatar.failed';
}

export function AvatarPicker({ name, testID }: AvatarPickerProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const avatar = useAvatarUpload();

  return (
    <View style={[styles.container, { gap: theme.spacing[3] }]} testID={testID}>
      <Avatar name={name} uri={avatar.avatarUrl} size="xl" ring testID={`${testID ?? 'avatar'}-preview`} />
      <Button
        variant="secondary"
        size="sm"
        leftIcon="plus"
        loading={avatar.busy}
        label={t('profile:avatar.change')}
        onPress={() => {
          void avatar.upload();
        }}
        testID="avatar-change"
      />
      {avatar.avatarUrl ? (
        <Button
          variant="ghost"
          size="sm"
          leftIcon="x"
          label={t('profile:avatar.remove')}
          onPress={avatar.remove}
          testID="avatar-remove"
        />
      ) : null}
      {avatar.error ? (
        <Banner
          variant="error"
          message={t(errorKey(avatar.error.meta.code))}
          testID="avatar-error"
        />
      ) : null}
      <Text variant="caption" color="secondary" align="center">
        {t('profile:avatar.sessionNote')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', width: '100%' },
});
