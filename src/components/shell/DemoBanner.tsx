import { useTranslation } from 'react-i18next';
import { Banner } from '@/components/ui';
import { useAppModeStore, useShellStore } from '@/stores';

export function DemoBanner() {
  const mode = useAppModeStore((s) => s.mode);
  const dismissed = useShellStore((s) => s.demoBannerDismissed);
  const dismiss = useShellStore((s) => s.dismissDemoBanner);
  const { t } = useTranslation();

  if (mode !== 'demo' || dismissed) return null;

  return (
    <Banner
      variant="demo"
      message={t('common:demo.description')}
      onDismiss={dismiss}
      testID="demo-banner"
    />
  );
}
