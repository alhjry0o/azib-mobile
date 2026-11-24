import { useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import {
  Badge,
  Banner,
  Button,
  Card,
  EmptyState,
  ErrorState,
  Skeleton,
  Text,
  TextInput,
} from '@/components/ui';
import { authErrorKey } from '@/features/auth/errors';
import { useTheme } from '@/theme';
import { WeddingScaffold } from '../components/WeddingScaffold';
import { useWeddingChat } from '../hooks/use-wedding-chat';
import { useWeddingGroup } from '../hooks/use-wedding-group';
import { CHAT_RETENTION_DAYS } from '../chat/retention';
import { canModerate } from '../chat/moderation';

export function GroupChatScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ id?: string }>();
  const groupId = params.id ?? '';
  const group = useWeddingGroup(groupId);
  const chat = useWeddingChat(groupId);
  const [draft, setDraft] = useState('');

  const role = group.data?.myRole ?? null;
  const moderator = canModerate(role);

  const send = async (): Promise<void> => {
    const result = await chat.send(draft);
    if (result.ok) setDraft('');
  };

  return (
    <WeddingScaffold
      testID="group-chat-screen"
      title={t('weddings:chat.title')}
      subtitle={t('weddings:chat.subtitle')}
      notConnectedRetry={undefined}
    >
      <Banner variant="info" message={t('weddings:chat.rules')} testID="chat-rules" />
      {chat.actionError ? (
        <Banner
          variant="error"
          message={t(authErrorKey(chat.actionError))}
          testID="chat-action-error"
        />
      ) : null}
      {chat.error ? (
        <ErrorState
          title={t('weddings:discovery.errorTitle')}
          description={t('weddings:discovery.errorDescription')}
          testID="chat-error"
        />
      ) : null}
      {chat.isLoading ? <Skeleton variant="rect" height={100} /> : null}

      {!chat.isLoading && chat.messages.length === 0 ? (
        <EmptyState
          icon="message"
          title={t('weddings:chat.empty')}
          description={t('weddings:chat.emptyDescription')}
          testID="chat-empty"
        />
      ) : null}

      {chat.messages.map((message) => (
        <Card key={message.id} style={{ gap: theme.spacing[2] }} testID={`chat-message-${message.id}`}>
          <Text variant="body">
            {message.status === 'removed' ? t('weddings:chat.removed') : message.text}
          </Text>
          {message.status === 'reported' ? (
            <Badge variant="warning" size="sm" label={t('weddings:chat.reported')} />
          ) : null}
          <View style={[styles.row, { gap: theme.spacing[2] }]}>
            <Button
              variant="ghost"
              size="sm"
              label={t('weddings:chat.report')}
              onPress={() => {
                void chat.report(message.id);
              }}
              testID={`chat-report-${message.id}`}
            />
            {moderator ? (
              <Button
                variant="ghost"
                size="sm"
                label={t('weddings:chat.remove')}
                onPress={() => {
                  void chat.remove(message.id);
                }}
                testID={`chat-remove-${message.id}`}
              />
            ) : null}
            {moderator ? (
              <Button
                variant="ghost"
                size="sm"
                label={t('weddings:chat.mute')}
                onPress={() => {
                  void chat.mute(message.authorId);
                }}
                testID={`chat-mute-${message.id}`}
              />
            ) : null}
          </View>
        </Card>
      ))}

      {group.data?.isMember ? (
        <View style={{ gap: theme.spacing[2] }}>
          <TextInput
            testID="chat-input"
            label={t('weddings:chat.compose')}
            value={draft}
            onChangeText={setDraft}
          />
          <Button
            fullWidth
            loading={chat.busy}
            label={t('weddings:chat.send')}
            onPress={() => {
              void send();
            }}
            testID="chat-send"
          />
        </View>
      ) : (
        <Text variant="body" color="secondary" testID="chat-not-member">
          {t('weddings:chat.blocked.notMember')}
        </Text>
      )}

      {moderator && chat.mutes.length > 0 ? (
        <Button
          variant="ghost"
          fullWidth
          label={t('weddings:chat.unmute')}
          onPress={() => {
            const first = chat.mutes[0];
            if (first) void chat.unmute(first.userId);
          }}
          testID="chat-unmute"
        />
      ) : null}

      <Text variant="caption" color="secondary">
        {t('weddings:chat.retentionNote', { days: CHAT_RETENTION_DAYS })}
      </Text>
    </WeddingScaffold>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
});
