import { RequireAuth } from '@/features/auth';
import { OfferComposerScreen } from '@/features/partners';

export default function OfferNewRoute() {
  return (
    <RequireAuth>
      <OfferComposerScreen />
    </RequireAuth>
  );
}
