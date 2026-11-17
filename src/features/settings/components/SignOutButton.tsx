import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui';
import { ROUTES, href } from '@/constants/routes';
import { useAuth } from '@/features/auth';
import { useShellStore } from '@/stores';

export interface SignOutButtonProps {
  readonly testID?: string;
}

export function SignOutButton({ testID = 'settings-sign-out' }: SignOutButtonProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const auth = useAuth();
  const openDialog = useShellStore((s) => s.openDialog);
  const [busy, setBusy] = useState(false);

  const confirm = (): void => {
    openDialog({
      title: t('profile:settings.signOut.title'),
      description: t('profile:settings.signOut.description'),
      confirmLabel: t('profile:settings.signOut.confirm'),
      cancelLabel: t('common:buttons.cancel'),
      destructive: true,
      onConfirm: () => {
        void (async () => {
          setBusy(true);
          const result = await auth.signOut();
          setBusy(false);
          if (result.ok) router.replace(href(ROUTES.auth.welcome));
        })();
      },
    });
  };

  return (
    <Button
      variant="danger"
      fullWidth
      loading={busy}
      label={t('profile:settings.signOut.action')}
      onPress={confirm}
      testID={testID}
    />
  );
}
