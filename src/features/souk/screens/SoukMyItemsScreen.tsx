import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { Banner, Button, Card, ErrorState, Skeleton, Text } from '@/components/ui';
import { ROUTES, href } from '@/constants/routes';
import { useTheme } from '@/theme';
import { GiftEmptyState } from '../components/GiftEmptyState';
import { SoukItemStatusBadge } from '../components/SoukBadges';
import { SoukScaffold } from '../components/SoukScaffold';
import { useSoukMine } from '../hooks/use-souk-mine';
import { soukErrorKey } from '../state/error-keys';
import { toItemWorkflowStatus } from '../state/item-machine';

export function SoukMyItemsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();
  const mine = useSoukMine();

  return (
    <SoukScaffold
      testID="souk-mine-screen"
      title={t('marketplace:souk.mine.title')}
      subtitle={t('marketplace:souk.mine.subtitle')}
      notConnectedRetry={mine.refetch}
    >
      <Button
        fullWidth
        variant="secondary"
        leftIcon="bell"
        label={t('marketplace:souk.inbox.title')}
        onPress={() => router.push(href(ROUTES.souk.inbox))}
        testID="souk-mine-open-inbox"
      />

      {mine.isLoading ? <Skeleton variant="rect" height={120} /> : null}
      {mine.error ? (
        <ErrorState
          title={t('marketplace:souk.browser.errorTitle')}
          description={t('marketplace:souk.browser.errorDescription')}
          onRetry={mine.refetch}
          testID="souk-mine-error"
        />
      ) : null}
      {mine.actionError ? (
        <Banner
          variant="error"
          message={t(soukErrorKey(mine.actionError))}
          testID="souk-mine-action-error"
        />
      ) : null}
      {!mine.isLoading && !mine.error && mine.items.length === 0 ? (
        <GiftEmptyState
          title={t('marketplace:souk.mine.empty')}
          description={t('marketplace:souk.mine.emptyDescription')}
          actionLabel={t('marketplace:souk.composer.title')}
          onAction={() => router.push(href(ROUTES.souk.new))}
          testID="souk-mine-empty"
        />
      ) : null}

      <View style={{ gap: theme.spacing[3] }}>
        {mine.items.map((item) => {
          const status = toItemWorkflowStatus(item.status);
          return (
            <Card key={item.id} style={{ gap: theme.spacing[2] }} testID={`souk-mine-${item.id}`}>
              <Text variant="bodyStrong">{item.title ?? t(item.titleKey)}</Text>
              <SoukItemStatusBadge status={item.status} testID={`souk-mine-status-${item.id}`} />
              {status === 'draft' || status === 'expired' ? (
                <Button
                  size="sm"
                  loading={mine.busy}
                  label={
                    status === 'expired'
                      ? t('marketplace:souk.mine.relist')
                      : t('marketplace:souk.mine.publish')
                  }
                  onPress={() => {
                    void (status === 'expired' ? mine.relist(item.id) : mine.publish(item.id));
                  }}
                  testID={`souk-mine-publish-${item.id}`}
                />
              ) : null}
              {status === 'available' ? (
                <Button
                  size="sm"
                  variant="ghost"
                  loading={mine.busy}
                  label={t('marketplace:souk.mine.withdraw')}
                  onPress={() => {
                    void mine.withdraw(item.id);
                  }}
                  testID={`souk-mine-withdraw-${item.id}`}
                />
              ) : null}
              <Button
                variant="ghost"
                size="sm"
                label={t('marketplace:souk.browser.openItem')}
                onPress={() => router.push(href(ROUTES.souk.detail(item.id)))}
                testID={`souk-mine-open-${item.id}`}
              />
            </Card>
          );
        })}
      </View>
    </SoukScaffold>
  );
}
