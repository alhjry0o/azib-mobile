import { RequireAuth } from '@/features/auth';
import { SoukItemComposerScreen } from '@/features/souk';

export default function SoukNewRoute() {
  return (
    <RequireAuth>
      <SoukItemComposerScreen />
    </RequireAuth>
  );
}
