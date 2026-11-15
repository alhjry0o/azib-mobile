import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { RoutePlaceholder } from '@/components/shell';
import { ROUTES, href } from '@/constants/routes';

export default function JobsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  return (
    <RoutePlaceholder
      icon="users"
      title={t('common:shell.features.jobs.title')}
      description={t('common:shell.features.jobs.description')}
      phase="P13"
      action={{
        label: t('common:shell.placeholder.backHome'),
        onPress: () => router.replace(href(ROUTES.tabs.home)),
      }}
      testID="jobs-screen"
    />
  );
}
