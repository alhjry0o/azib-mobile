import { useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import {
  Badge,
  Banner,
  Button,
  Card,
  Checkbox,
  EmptyState,
  ErrorState,
  Skeleton,
  Text,
  TextInput,
} from '@/components/ui';
import { authErrorKey } from '@/features/auth/errors';
import { useDirection } from '@/hooks';
import { useTheme } from '@/theme';
import { WeddingScaffold } from '../components/WeddingScaffold';
import { useWeddingGroup } from '../hooks/use-wedding-group';
import { useWeddingMembership } from '../hooks/use-wedding-membership';
import { JoinRequestSchema } from '../schemas/group';
import { can } from '../state/roles';

export function GroupMembersScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const { isRTL } = useDirection();
  const params = useLocalSearchParams<{ id?: string }>();
  const groupId = params.id ?? '';
  const group = useWeddingGroup(groupId);
  const membership = useWeddingMembership(groupId);
  const [message, setMessage] = useState('');
  const [consent, setConsent] = useState(false);
  const [inviteeId, setInviteeId] = useState('');
  const [joinError, setJoinError] = useState<string | null>(null);

  const data = group.data;
  const role = data?.myRole ?? null;
  const canDecide = role !== null && can(role, 'approve_join');
  const canInvite = role !== null && can(role, 'invite');

  const sendJoin = async (): Promise<void> => {
    const parsed = JoinRequestSchema.safeParse({ message, displayNameConsent: consent });
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      setJoinError(first ? first.message : 'weddings:validation.message');
      return;
    }
    setJoinError(null);
    const result = await membership.join(parsed.data.message, parsed.data.displayNameConsent);
    if (result.ok) {
      setMessage('');
      setConsent(false);
    }
  };

  const sendInvite = async (): Promise<void> => {
    if (inviteeId.trim().length === 0) return;
    const result = await membership.invite(inviteeId.trim());
    if (result.ok) setInviteeId('');
  };

  return (
    <WeddingScaffold
      testID="group-members-screen"
      title={t('weddings:members.title')}
      subtitle={t('weddings:members.subtitle')}
      notConnectedRetry={group.refetch}
    >
      {group.isLoading ? <Skeleton variant="rect" height={120} /> : null}
      {group.error ? (
        <ErrorState
          title={t('weddings:discovery.errorTitle')}
          description={t('weddings:discovery.errorDescription')}
          onRetry={group.refetch}
          testID="members-error"
        />
      ) : null}
      {membership.error ? (
        <Banner
          variant="error"
          message={t(authErrorKey(membership.error))}
          testID="members-action-error"
        />
      ) : null}

      {data && !data.isMember ? (
        <Card style={{ gap: theme.spacing[3] }} testID="join-form">
          <Text variant="h3">{t('weddings:detail.join')}</Text>
          <TextInput
            testID="join-message"
            label={t('weddings:detail.joinMessage')}
            required
            value={message}
            onChangeText={setMessage}
            errorText={joinError ? t(joinError) : undefined}
          />
          <Checkbox
            testID="join-consent"
            checked={consent}
            onCheckedChange={setConsent}
            label={t('weddings:detail.joinConsent')}
          />
          <Button
            fullWidth
            loading={membership.busy}
            label={t('weddings:detail.join')}
            onPress={() => {
              void sendJoin();
            }}
            testID="join-submit"
          />
        </Card>
      ) : null}

      {data && canInvite ? (
        <Card style={{ gap: theme.spacing[3] }} testID="invite-form">
          <Text variant="h3">{t('weddings:members.invite')}</Text>
          <TextInput
            testID="invite-user-id"
            label={t('weddings:members.inviteUserId')}
            value={inviteeId}
            onChangeText={setInviteeId}
            autoCapitalize="none"
          />
          <Button
            fullWidth
            loading={membership.busy}
            label={t('weddings:members.invite')}
            onPress={() => {
              void sendInvite();
            }}
            testID="invite-submit"
          />
        </Card>
      ) : null}

      {data && canDecide ? (
        <View style={{ gap: theme.spacing[2] }} testID="join-requests">
          <Text variant="h3">{t('weddings:members.requests')}</Text>
          {membership.requests.filter((r) => r.status === 'pending').length === 0 ? (
            <Text variant="body" color="secondary" testID="requests-empty">
              {t('weddings:members.empty')}
            </Text>
          ) : null}
          {membership.requests
            .filter((r) => r.status === 'pending')
            .map((request) => (
              <Card key={request.id} style={{ gap: theme.spacing[2] }} testID={`request-${request.id}`}>
                <Text variant="body">{request.message}</Text>
                <View
                  style={[
                    styles.row,
                    { flexDirection: isRTL ? 'row-reverse' : 'row', gap: theme.spacing[2] },
                  ]}
                >
                  <Button
                    style={styles.action}
                    size="sm"
                    label={t('weddings:members.approve')}
                    onPress={() => {
                      void membership.decide(request.id, 'approved');
                    }}
                    testID={`request-approve-${request.id}`}
                  />
                  <Button
                    style={styles.action}
                    size="sm"
                    variant="secondary"
                    label={t('weddings:members.reject')}
                    onPress={() => {
                      void membership.decide(
                        request.id,
                        'rejected',
                        'weddings:members.rejectReason',
                      );
                    }}
                    testID={`request-reject-${request.id}`}
                  />
                </View>
              </Card>
            ))}
        </View>
      ) : null}

      <Text variant="h3">{t('weddings:members.title')}</Text>
      {data && data.members.length === 0 ? (
        <EmptyState
          icon="users"
          title={t('weddings:members.empty')}
          description={t('weddings:members.emptyDescription')}
          testID="members-empty"
        />
      ) : null}
      {data?.members.map((member) => (
        <Card key={member.memberId} style={{ gap: theme.spacing[2] }} testID={`member-${member.memberId}`}>
          <View
            style={[
              styles.row,
              { flexDirection: isRTL ? 'row-reverse' : 'row', gap: theme.spacing[2] },
            ]}
          >
            <Text variant="bodyStrong" style={styles.grow}>
              {member.label ?? t('weddings:members.anonymous')}
            </Text>
            {member.isSelf ? (
              <Badge variant="accent" size="sm" label={t('weddings:members.you')} />
            ) : null}
            <Badge
              variant={member.status === 'active' ? 'success' : 'neutral'}
              size="sm"
              label={t(`weddings:members.${member.status}`)}
            />
          </View>
          <Text variant="caption" color="secondary">
            {t(`weddings:detail.${member.role === 'co_organizer' ? 'coOrganizer' : member.role}`)}
          </Text>
          {role === 'organizer' && member.role !== 'organizer' && member.status === 'active' ? (
            <Button
              variant="ghost"
              size="sm"
              label={
                member.role === 'co_organizer'
                  ? t('weddings:members.makeMember')
                  : t('weddings:members.makeCoOrganizer')
              }
              onPress={() => {
                void membership.setRole(
                  member.memberId,
                  member.role === 'co_organizer' ? 'member' : 'co_organizer',
                );
              }}
              testID={`member-role-${member.memberId}`}
            />
          ) : null}
        </Card>
      ))}
    </WeddingScaffold>
  );
}

const styles = StyleSheet.create({
  row: { alignItems: 'center' },
  action: { flex: 1 },
  grow: { flex: 1 },
});
