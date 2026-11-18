import { RequireAuth } from '@/features/auth';
import { ExportDataScreen } from '@/features/settings';

export default function ExportDataRoute() {
  return (
    <RequireAuth>
      <ExportDataScreen />
    </RequireAuth>
  );
}
