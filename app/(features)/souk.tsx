import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { RoutePlaceholder } from '@/components/shell';
import { ROUTES, href } from '@/constants/routes';

export default function SoukScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  return (
    <RoutePlaceholder
      icon="shoppingBag"
      title={t('common:shell.features.souk.title')}
      description={t('common:shell.features.souk.description')}
      phase="P12"
      action={{
        label: t('common:shell.placeholder.backHome'),
        onPress: () => router.replace(href(ROUTES.tabs.home)),
      }}
      testID="souk-screen"
    />
  );
}
