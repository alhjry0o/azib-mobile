import { RequireAuth } from '@/features/auth';
import { SoukRequestScreen } from '@/features/souk';

export default function SoukRequestRoute() {
  return (
    <RequireAuth>
      <SoukRequestScreen />
    </RequireAuth>
  );
}
