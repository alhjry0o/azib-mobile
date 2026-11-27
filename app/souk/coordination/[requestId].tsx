import { RequireAuth } from '@/features/auth';
import { SoukCoordinationScreen } from '@/features/souk';

export default function SoukCoordinationRoute() {
  return (
    <RequireAuth>
      <SoukCoordinationScreen />
    </RequireAuth>
  );
}
