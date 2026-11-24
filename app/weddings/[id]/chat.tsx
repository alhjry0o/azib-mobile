import { RequireAuth } from '@/features/auth';
import { GroupChatScreen } from '@/features/weddings';

export default function GroupChatRoute() {
  return (
    <RequireAuth>
      <GroupChatScreen />
    </RequireAuth>
  );
}
