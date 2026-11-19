import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Icon, ListItem } from '@/components/ui';
import { ROUTES, href } from '@/constants/routes';
import { useTheme } from '@/theme';

export function StaffShortcutSection() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <ListItem
      variant="card"
      style={{ marginHorizontal: theme.spacing[4] }}
      title={t('home:roles.staff.title')}
      subtitle={t('home:roles.staff.description')}
      leading={<Icon name="shield" size={20} />}
      onPress={() => router.navigate(href(ROUTES.staff))}
      testID="role-staff"
    />
  );
}
