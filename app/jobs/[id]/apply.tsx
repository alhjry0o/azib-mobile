import { RequireAuth } from '@/features/auth';
import { JobApplyScreen } from '@/features/jobs';

export default function JobApplyRoute() {
  return (
    <RequireAuth>
      <JobApplyScreen />
    </RequireAuth>
  );
}
