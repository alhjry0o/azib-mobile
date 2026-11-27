import { RequireAuth } from '@/features/auth';
import { SoukHandoverScreen } from '@/features/souk';

export default function SoukHandoverRoute() {
  return (
    <RequireAuth>
      <SoukHandoverScreen />
    </RequireAuth>
  );
}
