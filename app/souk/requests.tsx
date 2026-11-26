import { RequireAuth } from '@/features/auth';
import { SoukMyRequestsScreen } from '@/features/souk';

export default function SoukRequestsRoute() {
  return (
    <RequireAuth>
      <SoukMyRequestsScreen />
    </RequireAuth>
  );
}
