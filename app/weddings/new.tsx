import { RequireAuth } from '@/features/auth';
import { CreateGroupScreen } from '@/features/weddings';

export default function CreateGroupRoute() {
  return (
    <RequireAuth>
      <CreateGroupScreen />
    </RequireAuth>
  );
}
