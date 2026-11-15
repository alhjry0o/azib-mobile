import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { RoutePlaceholder } from '@/components/shell';
import { ROUTES, href } from '@/constants/routes';

export default function SearchScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  return (
    <RoutePlaceholder
      icon="search"
      title={t('common:shell.features.search.title')}
      description={t('common:shell.features.search.description')}
      phase="P16"
      action={{
        label: t('common:shell.placeholder.backHome'),
        onPress: () => router.replace(href(ROUTES.tabs.home)),
      }}
      testID="search-screen"
    />
  );
}
