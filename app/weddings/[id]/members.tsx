import { RequireAuth } from '@/features/auth';
import { GroupMembersScreen } from '@/features/weddings';

export default function GroupMembersRoute() {
  return (
    <RequireAuth>
      <GroupMembersScreen />
    </RequireAuth>
  );
}
