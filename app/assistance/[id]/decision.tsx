import { RequireAuth } from '@/features/auth';
import { DecisionScreen } from '@/features/assistance';

export default function DecisionRoute() {
  return (
    <RequireAuth>
      <DecisionScreen />
    </RequireAuth>
  );
}
