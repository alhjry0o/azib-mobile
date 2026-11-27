import { RequireAuth } from '@/features/auth';
import { SavedJobsScreen } from '@/features/jobs';

export default function SavedJobsRoute() {
  return (
    <RequireAuth>
      <SavedJobsScreen />
    </RequireAuth>
  );
}
