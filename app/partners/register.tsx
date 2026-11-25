import { RequireAuth } from '@/features/auth';
import { PartnerRegisterScreen } from '@/features/partners';

export default function PartnerRegisterRoute() {
  return (
    <RequireAuth>
      <PartnerRegisterScreen />
    </RequireAuth>
  );
}
