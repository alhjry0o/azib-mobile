import { RequireAuth } from '@/features/auth';
import { JobReportScreen } from '@/features/jobs';

export default function JobReportRoute() {
  return (
    <RequireAuth>
      <JobReportScreen />
    </RequireAuth>
  );
}
