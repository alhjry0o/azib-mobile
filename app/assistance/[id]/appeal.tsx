import { RequireAuth } from '@/features/auth';
import { AppealScreen } from '@/features/assistance';

export default function AppealRoute() {
  return (
    <RequireAuth>
      <AppealScreen />
    </RequireAuth>
  );
}
