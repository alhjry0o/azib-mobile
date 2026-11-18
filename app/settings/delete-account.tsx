import { RequireAuth } from '@/features/auth';
import { DeleteAccountScreen } from '@/features/settings';

export default function DeleteAccountRoute() {
  return (
    <RequireAuth>
      <DeleteAccountScreen />
    </RequireAuth>
  );
}
