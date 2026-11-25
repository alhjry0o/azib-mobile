import { RequireAuth } from '@/features/auth';
import { PartnerDashboardScreen } from '@/features/partners';

export default function PartnerDashboardRoute() {
  return (
    <RequireAuth>
      <PartnerDashboardScreen />
    </RequireAuth>
  );
}
