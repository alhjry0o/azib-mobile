import { Stack } from 'expo-router';

// Public preferences stay reachable for guests; server-dependent screens
// guard themselves (RequireAuth / NotConnected) inside their own screens.
export default function SettingsLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
