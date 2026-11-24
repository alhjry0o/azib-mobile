import { RequireAuth } from '@/features/auth';
import { GroupCompletionScreen } from '@/features/weddings';

export default function GroupCompletionRoute() {
  return (
    <RequireAuth>
      <GroupCompletionScreen />
    </RequireAuth>
  );
}
