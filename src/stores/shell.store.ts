// Ephemeral shell UI state: dialog/sheet hosts, demo banner, notifications badge.
// No persist (session-only). No server data here (ADR-0002).
// P04 rule enforced: Dialog and BottomSheet are never open at the same time.
import type { ReactNode } from 'react';
import { create } from 'zustand';

export interface ShellDialogOptions {
  /** Pre-translated strings (caller uses t() before opening). */
  readonly title: string;
  readonly description?: string;
  readonly confirmLabel: string;
  readonly cancelLabel?: string;
  readonly destructive?: boolean;
  readonly onConfirm?: () => void;
}

export interface ShellSheetOptions {
  readonly title?: string;
  readonly content: ReactNode;
}

export interface ShellState {
  dialog: ShellDialogOptions | null;
  sheet: ShellSheetOptions | null;
  demoBannerDismissed: boolean;
  /**
   * Unread notifications count for the Dock badge.
   * Honest default 0 (no notification source exists before P16).
   * P16 wires the real source via setUnreadNotifications().
   */
  unreadNotifications: number;
  openDialog: (options: ShellDialogOptions) => void;
  closeDialog: () => void;
  openSheet: (options: ShellSheetOptions) => void;
  closeSheet: () => void;
  dismissDemoBanner: () => void;
  setUnreadNotifications: (count: number) => void;
}

export const useShellStore = create<ShellState>()((set) => ({
  dialog: null,
  sheet: null,
  demoBannerDismissed: false,
  unreadNotifications: 0,
  openDialog: (options) => set({ dialog: options, sheet: null }),
  closeDialog: () => set({ dialog: null }),
  openSheet: (options) => set({ sheet: options, dialog: null }),
  closeSheet: () => set({ sheet: null }),
  dismissDemoBanner: () => set({ demoBannerDismissed: true }),
  setUnreadNotifications: (count) =>
    set({ unreadNotifications: Math.max(0, Math.floor(count)) }),
}));
