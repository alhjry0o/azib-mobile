import { RequireAuth } from '@/features/auth';
import { SecuritySettingsScreen } from '@/features/settings';

export default function SecuritySettingsRoute() {
  return (
    <RequireAuth>
      <SecuritySettingsScreen />
    </RequireAuth>
  );
}
