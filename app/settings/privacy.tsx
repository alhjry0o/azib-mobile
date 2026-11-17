import { RequireAuth } from '@/features/auth';
import { PrivacySettingsScreen } from '@/features/settings';

export default function PrivacySettingsRoute() {
  return (
    <RequireAuth>
      <PrivacySettingsScreen />
    </RequireAuth>
  );
}
