import { RequireAuth } from '@/features/auth';
import { GroupBudgetScreen } from '@/features/weddings';

export default function GroupBudgetRoute() {
  return (
    <RequireAuth>
      <GroupBudgetScreen />
    </RequireAuth>
  );
}
