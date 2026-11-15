// Dev-only gate. In production builds every (dev) route (including the
// existing Gallery) resolves to NotFound. Dev screens themselves land in P05.3.
import { Redirect, Stack } from 'expo-router';
import { env } from '@/config';
import { ROUTES, href } from '@/constants/routes';

export default function DevLayout() {
  if (env.APP_MODE === 'production') {
    return <Redirect href={href(ROUTES.notFound)} />;
  }
  return <Stack screenOptions={{ headerShown: false }} />;
}
