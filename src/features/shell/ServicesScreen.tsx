// Services hub: every row navigates to a real screen.
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Icon, ListItem, Screen, Text, type IconName } from '@/components/ui';
import { ROUTES, href } from '@/constants/routes';
import { useTheme } from '@/theme';

interface ServiceLink {
  readonly key: string;
  readonly route: string;
  readonly icon: IconName;
}

const SERVICE_LINKS: readonly ServiceLink[] = [
  { key: 'assistance', route: ROUTES.assistance.root, icon: 'wallet' },
  { key: 'souk', route: ROUTES.features.souk, icon: 'shoppingBag' },
  { key: 'jobs', route: ROUTES.features.jobs, icon: 'users' },
  { key: 'volunteers', route: ROUTES.features.volunteers, icon: 'userCheck' },
  { key: 'learn', route: ROUTES.features.learn, icon: 'info' },
  { key: 'calculator', route: ROUTES.features.calculator, icon: 'creditCard' },
  { key: 'guide', route: ROUTES.features.guide, icon: 'sparkles' },
  { key: 'notifications', route: ROUTES.features.notifications, icon: 'bell' },
  { key: 'search', route: ROUTES.features.search, icon: 'search' },
];

export function ServicesScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <Screen
      scroll
      testID="services-screen"
      contentStyle={{ paddingBottom: theme.spacing[12], gap: theme.spacing[2] }}
    >
      <Text variant="h1" style={{ marginTop: theme.spacing[4] }}>
        {t('common:shell.features.services.title')}
      </Text>
      <Text variant="body" color="secondary" style={{ marginBottom: theme.spacing[2] }}>
        {t('common:shell.features.services.description')}
      </Text>
      {SERVICE_LINKS.map((link) => (
        <ListItem
          key={link.key}
          variant="card"
          title={t(`common:shell.features.${link.key}.title`)}
          leading={<Icon name={link.icon} size={20} />}
          onPress={() => router.push(href(link.route))}
          testID={`service-${link.key}`}
        />
      ))}
    </Screen>
  );
}
