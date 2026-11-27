import { RequireAuth } from '@/features/auth';
import { JobApplicantsScreen } from '@/features/jobs';

export default function JobApplicantsRoute() {
  return (
    <RequireAuth>
      <JobApplicantsScreen />
    </RequireAuth>
  );
}
