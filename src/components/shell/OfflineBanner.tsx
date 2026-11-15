import { useTranslation } from 'react-i18next';
import { Banner } from '@/components/ui';
import { useOfflineStatus } from '@/features/shell/use-offline-status';

export function OfflineBanner() {
  const offline = useOfflineStatus();
  const { t } = useTranslation();
  if (!offline) return null;
  return <Banner variant="warning" message={t('common:shell.offline')} testID="offline-banner" />;
}
