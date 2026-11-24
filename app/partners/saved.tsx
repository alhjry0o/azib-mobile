import { RequireAuth } from '@/features/auth';
import { SavedOffersScreen } from '@/features/partners';

export default function SavedOffersRoute() {
  return (
    <RequireAuth>
      <SavedOffersScreen />
    </RequireAuth>
  );
}
