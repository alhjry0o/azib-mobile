import { RequireAuth } from '@/features/auth';
import { ReceiptsScreen } from '@/features/finance';

export default function ReceiptsRoute() {
  return (
    <RequireAuth>
      <ReceiptsScreen />
    </RequireAuth>
  );
}
