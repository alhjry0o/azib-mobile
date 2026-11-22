import { RequireAuth } from '@/features/auth';
import { BeneficiaryDisbursementsScreen } from '@/features/finance';

export default function BeneficiaryDisbursementsRoute() {
  return (
    <RequireAuth>
      <BeneficiaryDisbursementsScreen />
    </RequireAuth>
  );
}
