import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { RoutePlaceholder } from '@/components/shell';
import { ROUTES, href } from '@/constants/routes';

export default function MaintenanceScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  return (
    <RoutePlaceholder
      icon="clock"
      title={t('common:shell.maintenance.title')}
      description={t('common:shell.maintenance.description')}
      phase="P18"
      action={{
        label: t('common:buttons.retry'),
        onPress: () => router.replace(href(ROUTES.root)),
      }}
      testID="maintenance-screen"
    />
  );
}
