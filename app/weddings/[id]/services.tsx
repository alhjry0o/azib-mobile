import { RequireAuth } from '@/features/auth';
import { GroupServicesScreen } from '@/features/weddings';

export default function GroupServicesRoute() {
  return (
    <RequireAuth>
      <GroupServicesScreen />
    </RequireAuth>
  );
}
