// Dock badge count. Honest default: 0 (hidden) — no notification source
// exists before P16. P16 feeds the real unread count via
// useShellStore.setUnreadNotifications(). Keeping this hook as the single
// read point means the Dock never changes when the source lands.
import { useShellStore } from '@/stores';

export function useNotificationsBadge(): number {
  return useShellStore((s) => s.unreadNotifications);
}
