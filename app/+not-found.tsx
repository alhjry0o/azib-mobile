import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { RoutePlaceholder } from '@/components/shell';
import { ROUTES, href } from '@/constants/routes';

export default function NotFoundScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  return (
    <RoutePlaceholder
      icon="alertCircle"
      title={t('common:shell.notFound.title')}
      description={t('common:shell.notFound.description')}
      phase="P05"
      action={{
        label: t('common:shell.placeholder.backHome'),
        onPress: () => router.replace(href(ROUTES.root)),
      }}
      testID="not-found-screen"
    />
  );
}
