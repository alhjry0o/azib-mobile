import { RequireAuth } from '@/features/auth';
import { MyApplicationsScreen } from '@/features/jobs';

export default function MyApplicationsRoute() {
  return (
    <RequireAuth>
      <MyApplicationsScreen />
    </RequireAuth>
  );
}
