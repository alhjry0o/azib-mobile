import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { RoutePlaceholder } from '@/components/shell';
import { ROUTES, href } from '@/constants/routes';

export default function CalculatorScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  return (
    <RoutePlaceholder
      icon="creditCard"
      title={t('common:shell.features.calculator.title')}
      description={t('common:shell.features.calculator.description')}
      phase="P14"
      action={{
        label: t('common:shell.placeholder.backHome'),
        onPress: () => router.replace(href(ROUTES.tabs.home)),
      }}
      testID="calculator-screen"
    />
  );
}
