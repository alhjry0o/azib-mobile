import { RequireAuth } from '@/features/auth';
import { OfferComposerScreen } from '@/features/partners';

export default function OfferEditRoute() {
  return (
    <RequireAuth>
      <OfferComposerScreen />
    </RequireAuth>
  );
}
