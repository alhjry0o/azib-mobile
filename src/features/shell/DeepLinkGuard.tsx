// Runtime enforcement of the deep-link allowlist.
// Allowed URLs: router already handles them. Guarded URLs: layout guards decide.
// Everything else: replaced with +not-found. Renders nothing.
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import * as Linking from 'expo-linking';
import { ROUTES, href } from '@/constants/routes';
import { resolveDeepLink } from './deep-links';

export function DeepLinkGuard() {
  const url = Linking.useURL();
  const router = useRouter();

  useEffect(() => {
    const resolution = resolveDeepLink(url);
    if (resolution.kind === 'not-found') {
      router.replace(href(ROUTES.notFound));
    }
  }, [url, router]);

  return null;
}
