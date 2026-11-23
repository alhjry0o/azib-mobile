import { RequireAuth } from '@/features/auth';
import { GroupPollsScreen } from '@/features/weddings';

export default function GroupPollsRoute() {
  return (
    <RequireAuth>
      <GroupPollsScreen />
    </RequireAuth>
  );
}
