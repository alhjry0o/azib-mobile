import { useTranslation } from 'react-i18next';
import { RoutePlaceholder } from '@/components/shell';

export default function StaffIndexScreen() {
  const { t } = useTranslation();
  return (
    <RoutePlaceholder
      icon="shield"
      title={t('common:shell.features.staff.title')}
      description={t('common:shell.features.staff.description')}
      phase="P17"
      testID="staff-screen"
    />
  );
}
