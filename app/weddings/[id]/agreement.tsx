import { RequireAuth } from '@/features/auth';
import { GroupAgreementScreen } from '@/features/weddings';

export default function GroupAgreementRoute() {
  return (
    <RequireAuth>
      <GroupAgreementScreen />
    </RequireAuth>
  );
}
