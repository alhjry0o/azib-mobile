import { RequireAuth } from '@/features/auth';
import { AccountSettingsScreen } from '@/features/settings';

export default function AccountSettingsRoute() {
  return (
    <RequireAuth>
      <AccountSettingsScreen />
    </RequireAuth>
  );
}
