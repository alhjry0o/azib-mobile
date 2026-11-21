import { RequireAuth } from '@/features/auth';
import { ApplicationDetailScreen } from '@/features/assistance';

export default function ApplicationDetailRoute() {
  return (
    <RequireAuth>
      <ApplicationDetailScreen />
    </RequireAuth>
  );
}
