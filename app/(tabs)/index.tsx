import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { RoutePlaceholder } from '@/components/shell';
import { ROUTES, href } from '@/constants/routes';

export default function HomeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  return (
    <RoutePlaceholder
      icon="home"
      title={t('common:shell.features.home.title')}
      description={t('common:shell.features.home.description')}
      phase="P07"
      action={{
        label: t('common:shell.placeholder.openServices'),
        onPress: () => router.navigate(href(ROUTES.tabs.services)),
      }}
      testID="home-screen"
    />
  );
}
