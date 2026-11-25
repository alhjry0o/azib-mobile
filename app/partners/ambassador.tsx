import { RequireAuth } from '@/features/auth';
import { AmbassadorScreen } from '@/features/partners';

export default function AmbassadorRoute() {
  return (
    <RequireAuth>
      <AmbassadorScreen />
    </RequireAuth>
  );
}
