import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import {
  Avatar,
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorState,
  NotConnectedState,
  Screen,
  Skeleton,
  Text,
} from '@/components/ui';
import { ROUTES, href } from '@/constants/routes';
import { useSession } from '@/features/shell/use-session';
import { useProviderContainer } from '@/providers';
import { useTheme } from '@/theme';
import { locationChain } from '../locations';
import { useAvatarUpload } from '../use-avatar-upload';
import { useProfile } from '../use-profile';

export function ProfileScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const container = useProviderContainer();
  const session = useSession();
  const profileApi = useProfile();
  const avatar = useAvatarUpload();

  const user = session.result?.ok ? (session.result.value?.user ?? null) : null;
  const name = profileApi.profile?.displayName ?? user?.displayName ?? '';
  const chain = locationChain(profileApi.profile?.city ?? null);
  const locationLabel = chain.map((node) => t(node.nameKey)).join(' / ');
  const verified = !session.result?.ok || !session.result.value?.pendingVerification;

  if (container.mode === 'backend') {
    return (
      <Screen testID="profile-screen" style={styles.center}>
        <NotConnectedState
          title={t('profile:notConnectedYet')}
          description={t('profile:settings.serverNote')}
          onRetry={profileApi.refetch}
        />
      </Screen>
    );
  }

  if (profileApi.isLoading) {
    return (
      <Screen testID="profile-loading" contentStyle={styles.content}>
        <Skeleton variant="circle" />
        <Skeleton variant="text" width="60%" />
        <Skeleton variant="rect" height={120} />
      </Screen>
    );
  }

  if (profileApi.error) {
    return (
      <Screen testID="profile-screen" style={styles.center}>
        <ErrorState
          title={t('profile:error.title')}
          description={t('profile:error.description')}
          onRetry={profileApi.refetch}
        />
      </Screen>
    );
  }

  if (!profileApi.profile) {
    return (
      <Screen testID="profile-screen" style={styles.center}>
        <EmptyState
          testID="profile-empty"
          icon="user"
          title={t('profile:empty.title')}
          description={t('profile:empty.description')}
          action={{
            label: t('profile:empty.action'),
            onPress: () => {
              void profileApi.createDefault();
            },
            loading: profileApi.busy,
          }}
        />
      </Screen>
    );
  }

  return (
    <Screen
      scroll
      testID="profile-screen"
      contentStyle={{ gap: theme.spacing[4], paddingBottom: theme.spacing[10] }}
    >
      <View style={styles.hero}>
        <Avatar name={name} uri={avatar.avatarUrl} size="xl" ring testID="profile-avatar" />
        <Text variant="h1" align="center">
          {name}
        </Text>
        <View style={styles.badges}>
          <Badge
            variant={verified ? 'verified' : 'pending'}
            label={verified ? t('profile:verification.verified') : t('profile:verification.pending')}
            testID="profile-verification"
          />
          {profileApi.profile.dataOrigin === 'demo' ? (
            <Badge variant="demo" label={t('common:demo.badge')} testID="profile-demo" />
          ) : null}
        </View>
      </View>

      <Card testID="profile-card">
        <Text variant="caption" color="secondary">
          {t('profile:fields.gender')}
        </Text>
        <Text variant="bodyStrong">{t(`profile:gender.${profileApi.profile.gender}`)}</Text>
        <Text variant="caption" color="secondary" style={{ marginTop: theme.spacing[2] }}>
          {t('profile:fields.maritalStatus')}
        </Text>
        <Text variant="bodyStrong">
          {t(`profile:marital.${profileApi.profile.maritalStatus}`)}
        </Text>
        <Text variant="caption" color="secondary" style={{ marginTop: theme.spacing[2] }}>
          {t('profile:view.location')}
        </Text>
        <Text variant="bodyStrong" testID="profile-location">
          {locationLabel || t('profile:view.none')}
        </Text>
      </Card>

      <Button
        fullWidth
        leftIcon="user"
        label={t('profile:view.edit')}
        onPress={() => router.push(href(ROUTES.profile.edit))}
        testID="profile-edit"
      />
      <Button
        variant="secondary"
        fullWidth
        leftIcon="settings"
        label={t('profile:settings.title')}
        onPress={() => router.push(href(ROUTES.settings.root))}
        testID="profile-settings"
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { justifyContent: 'center' },
  content: { gap: 12, paddingVertical: 16 },
  hero: { alignItems: 'center', gap: 8, marginTop: 16 },
  badges: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center' },
});
