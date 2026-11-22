import { RequireAuth } from '@/features/auth';
import { MyDonationsScreen } from '@/features/finance';

export default function MyDonationsRoute() {
  return (
    <RequireAuth>
      <MyDonationsScreen />
    </RequireAuth>
  );
}
