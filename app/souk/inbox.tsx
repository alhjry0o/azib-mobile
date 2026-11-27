import { RequireAuth } from '@/features/auth';
import { SoukInboxScreen } from '@/features/souk';

export default function SoukInboxRoute() {
  return (
    <RequireAuth>
      <SoukInboxScreen />
    </RequireAuth>
  );
}
