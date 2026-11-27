import { RequireAuth } from '@/features/auth';
import { JobComposerScreen } from '@/features/jobs';

export default function JobNewRoute() {
  return (
    <RequireAuth>
      <JobComposerScreen />
    </RequireAuth>
  );
}
