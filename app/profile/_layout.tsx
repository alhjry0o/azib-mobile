import { Stack } from 'expo-router';
import { RequireAuth } from '@/features/auth';

export default function ProfileLayout() {
  return (
    <RequireAuth>
      <Stack screenOptions={{ headerShown: false }} />
    </RequireAuth>
  );
}
