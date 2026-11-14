// Global dialog host over the P04 Dialog. Driven by shell.store.
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button, Dialog } from '@/components/ui';
import { useShellStore } from '@/stores';
import { useTheme } from '@/theme';

export function DialogHost() {
  const dialog = useShellStore((s) => s.dialog);
  const close = useShellStore((s) => s.closeDialog);
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <Dialog
      visible={dialog !== null}
      onClose={close}
      title={dialog?.title}
      description={dialog?.description}
      testID="shell-dialog"
    >
      <View style={[styles.actions, { gap: theme.spacing[2] }]}>
        {dialog?.cancelLabel ? (
          <Button
            variant="ghost"
            label={dialog.cancelLabel}
            onPress={close}
            testID="shell-dialog-cancel"
          />
        ) : null}
        <Button
          variant={dialog?.destructive ? 'danger' : 'primary'}
          label={dialog?.confirmLabel ?? t('common:buttons.ok')}
          onPress={() => {
            dialog?.onConfirm?.();
            close();
          }}
          testID="shell-dialog-confirm"
        />
      </View>
    </Dialog>
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: 'row', justifyContent: 'flex-end', flexWrap: 'wrap' },
});
