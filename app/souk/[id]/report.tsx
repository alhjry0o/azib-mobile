import { RequireAuth } from '@/features/auth';
import { SoukReportScreen } from '@/features/souk';

export default function SoukReportRoute() {
  return (
    <RequireAuth>
      <SoukReportScreen />
    </RequireAuth>
  );
}
