import { RequireAuth } from '@/features/auth';
import { DonateIntentScreen } from '@/features/finance';

export default function DonateIntentRoute() {
  return (
    <RequireAuth>
      <DonateIntentScreen />
    </RequireAuth>
  );
}
