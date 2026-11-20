import { useEffect } from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import {
  ShellProviders,
  createTestQueryClient,
  makeDemoSession,
  resetShellStores,
} from '@/features/shell/__tests__/test-utils';
import { sessionQueryKey } from '@/features/shell/use-session';
import { useProviderContainer, type ProviderContainer } from '@/providers';
import { useAssistanceDraftStore, useAuthStore } from '@/stores';
import { seedAssistancePayloads } from '../../../../mocks/seed/assistance';
import { AssistanceWizard } from '../wizard/AssistanceWizard';

const mockReplace = jest.fn();
let container: ProviderContainer | null = null;

jest.mock('expo-router', () => ({
  Redirect: ({ href }: { href: string }) => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { View } = require('react-native');
    return <View testID={`redirect:${href}`} />;
  },
  useRouter: () => ({ replace: mockReplace, push: jest.fn(), navigate: jest.fn() }),
}));

jest.mock('expo-crypto', () => ({
  CryptoDigestAlgorithm: { SHA256: 'SHA-256' },
  digestStringAsync: jest.fn(async (_a: string, d: string) => `${d}${'x'.repeat(64)}`.slice(0, 64)),
}));

jest.mock('../components/DocumentUploader', () => ({
  DocumentUploader: () => null,
}));

function Probe() {
  const providerContainer = useProviderContainer();
  useEffect(() => {
    container = providerContainer;
  }, [providerContainer]);
  return null;
}

const payload = seedAssistancePayloads[0]!;

function clientWithSession() {
  const client = createTestQueryClient();
  client.setQueryData(sessionQueryKey('demo'), { ok: true, value: makeDemoSession() });
  return client;
}

async function fillDraft(): Promise<void> {
  await act(() => {
    const store = useAssistanceDraftStore.getState();
    store.setProgram('program-1');
    store.patchApplicant(payload.applicant);
    store.patchIncome(payload.income);
    store.patchAssets(payload.assets);
    store.patchObligations(payload.obligations);
    store.patchEngagement(payload.engagement);
    for (const document of payload.documents) store.addDocument(document);
    store.patchDeclarations({
      truthful: true,
      verificationConsent: true,
      processingConsent: true,
      publicationConsent: false,
    });
    store.setRequestedAmount(150000);
  });
}

describe('AssistanceWizard', () => {
  beforeEach(async () => {
    mockReplace.mockClear();
    container = null;
    await resetShellStores();
    await act(() => {
      useAuthStore.setState({ guestActive: false, hydrated: true, challenge: null });
      useAssistanceDraftStore.getState().reset();
    });
  });

  it('redirects to the program list when no program is selected', async () => {
    await render(
      <ShellProviders client={clientWithSession()}>
        <Probe />
        <AssistanceWizard />
      </ShellProviders>,
    );
    expect(screen.getByTestId('redirect:/assistance')).toBeTruthy();
  });

  it('blocks advancing an incomplete step and shows inline errors', async () => {
    await act(() => {
      useAssistanceDraftStore.getState().setProgram('program-1');
    });
    await render(
      <ShellProviders client={clientWithSession()}>
        <Probe />
        <AssistanceWizard />
      </ShellProviders>,
    );
    expect(screen.getByTestId('step-applicant')).toBeTruthy();
    await fireEvent.press(screen.getByTestId('wizard-next'));
    await waitFor(() => {
      expect(screen.getByTestId('wizard-errors')).toBeTruthy();
    });
    expect(useAssistanceDraftStore.getState().step).toBe(0);
  });

  it('advances through the eight steps and submits with a reference', async () => {
    await fillDraft();
    await render(
      <ShellProviders client={clientWithSession()}>
        <Probe />
        <AssistanceWizard />
      </ShellProviders>,
    );
    for (let i = 0; i < 7; i += 1) {
      await fireEvent.press(screen.getByTestId('wizard-next'));
    }
    await waitFor(() => {
      expect(screen.getByTestId('step-submit')).toBeTruthy();
    });
    await fireEvent.press(screen.getByTestId('submit-action'));
    await waitFor(() => {
      expect(screen.getByTestId('wizard-reference')).toBeTruthy();
    });
    expect(useAssistanceDraftStore.getState().programId).toBeNull();
    const listed = await container!.repositories.applications.listByApplicant('demo-user-test');
    expect(listed.ok).toBe(true);
    if (listed.ok) expect(listed.value.length).toBe(1);
  });

  it('goes back one step without losing the draft', async () => {
    await fillDraft();
    await render(
      <ShellProviders client={clientWithSession()}>
        <Probe />
        <AssistanceWizard />
      </ShellProviders>,
    );
    await fireEvent.press(screen.getByTestId('wizard-next'));
    await waitFor(() => {
      expect(screen.getByTestId('step-income')).toBeTruthy();
    });
    await fireEvent.press(screen.getByTestId('wizard-back'));
    expect(screen.getByTestId('step-applicant')).toBeTruthy();
    expect(useAssistanceDraftStore.getState().income.monthlyIncome).toBe(payload.income.monthlyIncome);
  });
});
