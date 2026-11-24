import { RequireAuth } from '@/features/auth';
import { GroupCountdownScreen } from '@/features/weddings';

export default function GroupCountdownRoute() {
  return (
    <RequireAuth>
      <GroupCountdownScreen />
    </RequireAuth>
  );
}
