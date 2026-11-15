import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { Text } from '@/components/ui';
import { Providers } from '@/components/ui/__tests__/test-utils';
import { useShellStore } from '@/stores';
import { BottomSheetHost } from '../BottomSheetHost';
import { DialogHost } from '../DialogHost';

function renderHosts() {
  return render(
    <Providers>
      <DialogHost />
      <BottomSheetHost />
    </Providers>,
  );
}

describe('DialogHost + BottomSheetHost', () => {
  beforeEach(async () => {
    await act(async () => {
      useShellStore.setState({ dialog: null, sheet: null });
    });
  });

  it('opens a dialog from the store and runs confirm then closes', async () => {
    const onConfirm = jest.fn();
    renderHosts();
    await act(async () => {
      useShellStore.getState().openDialog({
        title: 'Confirm action',
        description: 'Are you sure?',
        confirmLabel: 'Yes',
        cancelLabel: 'No',
        onConfirm,
      });
    });
    expect(screen.getByTestId('shell-dialog')).toBeTruthy();
    fireEvent.press(screen.getByTestId('shell-dialog-confirm'));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(useShellStore.getState().dialog).toBeNull();
  });

  it('closes the dialog from the cancel button without confirming', async () => {
    const onConfirm = jest.fn();
    renderHosts();
    await act(async () => {
      useShellStore.getState().openDialog({
        title: 'Confirm action',
        confirmLabel: 'Yes',
        cancelLabel: 'No',
        onConfirm,
      });
    });
    fireEvent.press(screen.getByTestId('shell-dialog-cancel'));
    expect(onConfirm).not.toHaveBeenCalled();
    expect(useShellStore.getState().dialog).toBeNull();
  });

  it('opens a sheet with content from the store', async () => {
    renderHosts();
    await act(async () => {
      useShellStore.getState().openSheet({
        title: 'Sheet title',
        content: <Text testID="sheet-content">Sheet body</Text>,
      });
    });
    expect(screen.getByTestId('shell-sheet')).toBeTruthy();
    expect(screen.getByTestId('sheet-content')).toBeTruthy();
  });

  it('never keeps a dialog and a sheet open at the same time (P04 rule)', async () => {
    renderHosts();
    await act(async () => {
      useShellStore.getState().openDialog({ title: 'D', confirmLabel: 'OK' });
    });
    await act(async () => {
      useShellStore.getState().openSheet({ content: <Text>Body</Text> });
    });
    expect(useShellStore.getState().dialog).toBeNull();
    expect(useShellStore.getState().sheet).not.toBeNull();
    await act(async () => {
      useShellStore.getState().openDialog({ title: 'D', confirmLabel: 'OK' });
    });
    expect(useShellStore.getState().sheet).toBeNull();
    expect(useShellStore.getState().dialog).not.toBeNull();
  });
});
