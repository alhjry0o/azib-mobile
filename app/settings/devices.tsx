import { RequireAuth } from '@/features/auth';
import { DevicesScreen } from '@/features/settings';

export default function DevicesRoute() {
  return (
    <RequireAuth>
      <DevicesScreen />
    </RequireAuth>
  );
}
