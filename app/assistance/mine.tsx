import { RequireAuth } from '@/features/auth';
import { MyApplicationsScreen } from '@/features/assistance';

export default function MyApplicationsRoute() {
  return (
    <RequireAuth>
      <MyApplicationsScreen />
    </RequireAuth>
  );
}
