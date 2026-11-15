import { useTranslation } from 'react-i18next';
import { RoutePlaceholder } from '@/components/shell';

export default function PartnersScreen() {
  const { t } = useTranslation();
  return (
    <RoutePlaceholder
      icon="users"
      title={t('common:shell.features.partners.title')}
      description={t('common:shell.features.partners.description')}
      phase="P11"
      testID="partners-screen"
    />
  );
}
