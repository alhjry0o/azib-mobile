import { RequireAuth } from '@/features/auth';
import { InfoRequestScreen } from '@/features/assistance';

export default function InfoRequestRoute() {
  return (
    <RequireAuth>
      <InfoRequestScreen />
    </RequireAuth>
  );
}
