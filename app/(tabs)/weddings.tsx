import { useTranslation } from 'react-i18next';
import { RoutePlaceholder } from '@/components/shell';

export default function WeddingsScreen() {
  const { t } = useTranslation();
  return (
    <RoutePlaceholder
      icon="heart"
      title={t('common:shell.features.weddings.title')}
      description={t('common:shell.features.weddings.description')}
      phase="P10"
      testID="weddings-screen"
    />
  );
}
