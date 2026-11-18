import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Icon, ListItem, Text, type IconName } from '@/components/ui';
import { ROUTES, href } from '@/constants/routes';
import { useTheme } from '@/theme';
import { SettingsScaffold } from '../components/SettingsScaffold';
import { SignOutButton } from '../components/SignOutButton';

interface Row {
  readonly key: string;
  readonly route: string;
  readonly icon: IconName;
}

const ACCOUNT_ROWS: readonly Row[] = [
  { key: 'account', route: ROUTES.settings.account, icon: 'user' },
  { key: 'profile', route: ROUTES.profile.root, icon: 'userCheck' },
  { key: 'privacy', route: ROUTES.settings.privacy, icon: 'shield' },
];

const SECURITY_ROWS: readonly Row[] = [
  { key: 'security', route: ROUTES.settings.security, icon: 'shield' },
  { key: 'devices', route: ROUTES.settings.devices, icon: 'phone' },
  { key: 'exportData', route: ROUTES.settings.exportData, icon: 'creditCard' },
];

const PREFERENCE_ROWS: readonly Row[] = [
  { key: 'language', route: ROUTES.settings.language, icon: 'menu' },
  { key: 'appearance', route: ROUTES.settings.appearance, icon: 'sparkles' },
  { key: 'numbers', route: ROUTES.settings.numbers, icon: 'creditCard' },
  { key: 'notifications', route: ROUTES.settings.notifications, icon: 'bell' },
];

const ABOUT_ROWS: readonly Row[] = [
  { key: 'help', route: ROUTES.settings.help, icon: 'info' },
  { key: 'about', route: ROUTES.settings.about, icon: 'info' },
  { key: 'terms', route: ROUTES.legal.terms, icon: 'info' },
  { key: 'privacyDoc', route: ROUTES.legal.privacy, icon: 'shield' },
];

export function SettingsIndexScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { t } = useTranslation();

  const renderRows = (rows: readonly Row[]) =>
    rows.map((row) => (
      <ListItem
        key={row.key}
        variant="card"
        title={t(`profile:settings.rows.${row.key}`)}
        leading={<Icon name={row.icon} size={20} />}
        onPress={() => router.push(href(row.route))}
        testID={`settings-row-${row.key}`}
      />
    ));

  return (
    <SettingsScaffold
      testID="settings-screen"
      title={t('profile:settings.title')}
      subtitle={t('profile:settings.subtitle')}
      backTo={ROUTES.tabs.account}
    >
      <Text variant="h3">{t('profile:settings.sections.account')}</Text>
      {renderRows(ACCOUNT_ROWS)}
      <Text variant="h3">{t('auth:security.section')}</Text>
      {renderRows(SECURITY_ROWS)}
      <ListItem
        variant="card"
        destructive
        title={t('profile:settings.rows.deleteAccount')}
        leading={<Icon name="xCircle" size={20} />}
        onPress={() => router.push(href(ROUTES.settings.deleteAccount))}
        testID="settings-row-deleteAccount"
      />
      <Text variant="h3">{t('profile:settings.sections.preferences')}</Text>
      {renderRows(PREFERENCE_ROWS)}
      <Text variant="h3">{t('profile:settings.sections.about')}</Text>
      {renderRows(ABOUT_ROWS)}
      <SignOutButton testID="settings-sign-out" />
      <Text variant="caption" color="secondary" style={{ marginTop: theme.spacing[2] }}>
        {t('profile:settings.serverNote')}
      </Text>
    </SettingsScaffold>
  );
}
