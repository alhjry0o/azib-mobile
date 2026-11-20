import { RequireAuth } from '@/features/auth';
import { AssistanceWizard } from '@/features/assistance';

export default function AssistanceNewRoute() {
  return (
    <RequireAuth>
      <AssistanceWizard />
    </RequireAuth>
  );
}
