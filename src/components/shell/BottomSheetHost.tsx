// Global bottom-sheet host over the P04 BottomSheet. Driven by shell.store.
// The store guarantees a sheet and a dialog are never open together.
import { BottomSheet, Text } from '@/components/ui';
import { useShellStore } from '@/stores';
import { useTheme } from '@/theme';

export function BottomSheetHost() {
  const sheet = useShellStore((s) => s.sheet);
  const close = useShellStore((s) => s.closeSheet);
  const theme = useTheme();

  return (
    <BottomSheet visible={sheet !== null} onClose={close} testID="shell-sheet">
      {sheet?.title ? (
        <Text variant="h2" style={{ marginBottom: theme.spacing[3] }}>
          {sheet.title}
        </Text>
      ) : null}
      {sheet?.content ?? null}
    </BottomSheet>
  );
}
