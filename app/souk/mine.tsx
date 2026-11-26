import { RequireAuth } from '@/features/auth';
import { SoukMyItemsScreen } from '@/features/souk';

export default function SoukMineRoute() {
  return (
    <RequireAuth>
      <SoukMyItemsScreen />
    </RequireAuth>
  );
}
