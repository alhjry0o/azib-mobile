import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { RoutePlaceholder } from '@/components/shell';
import { ROUTES, href } from '@/constants/routes';

export default function LearnScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  return (
    <RoutePlaceholder
      icon="info"
      title={t('common:shell.features.learn.title')}
      description={t('common:shell.features.learn.description')}
      phase="P15"
      action={{
        label: t('common:shell.placeholder.backHome'),
        onPress: () => router.replace(href(ROUTES.tabs.home)),
      }}
      testID="learn-screen"
    />
  );
}
