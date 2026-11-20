import { act } from '@testing-library/react-native';
import { useAssistanceDraftStore } from '../assistance-draft.store';

describe('assistance draft store', () => {
  beforeEach(async () => {
    await act(() => {
      useAssistanceDraftStore.getState().reset();
      useAssistanceDraftStore.setState({ hydrated: true });
    });
  });

  it('starts empty at step zero', () => {
    const state = useAssistanceDraftStore.getState();
    expect(state.step).toBe(0);
    expect(state.programId).toBeNull();
    expect(state.documents).toEqual([]);
  });

  it('persists section patches and stamps updatedAt', async () => {
    await act(() => {
      useAssistanceDraftStore.getState().patchIncome({ monthlyIncome: 90000 });
    });
    const state = useAssistanceDraftStore.getState();
    expect(state.income.monthlyIncome).toBe(90000);
    expect(state.updatedAt).not.toBeNull();
  });

  it('clamps the step index to the wizard range', async () => {
    await act(() => {
      useAssistanceDraftStore.getState().setStep(99);
    });
    expect(useAssistanceDraftStore.getState().step).toBe(7);
    await act(() => {
      useAssistanceDraftStore.getState().setStep(-3);
    });
    expect(useAssistanceDraftStore.getState().step).toBe(0);
  });

  it('never stores raw identity values, only fingerprints', async () => {
    await act(() => {
      useAssistanceDraftStore.getState().patchApplicant({ identityHash: 'a'.repeat(64) });
    });
    const serialized = JSON.stringify(useAssistanceDraftStore.getState().applicant);
    expect(serialized).toContain('identityHash');
    expect(serialized).not.toContain('identityNumber');
  });

  it('clears fingerprints on request', async () => {
    await act(() => {
      useAssistanceDraftStore.getState().patchApplicant({
        identityHash: 'a'.repeat(64),
        phoneHash: 'b'.repeat(64),
      });
    });
    await act(() => {
      useAssistanceDraftStore.getState().clearFingerprints();
    });
    const applicant = useAssistanceDraftStore.getState().applicant;
    expect(applicant.identityHash).toBeNull();
    expect(applicant.phoneHash).toBeNull();
  });

  it('adds and removes documents without duplicates', async () => {
    const document = {
      id: 'doc-1',
      kind: 'identity' as const,
      fileId: 'f1',
      fileName: 'a.jpg',
      mimeType: 'image/jpeg',
      size: 10,
      sha256: 'c'.repeat(64),
      uploadedAt: '2026-11-16T00:00:00.000Z',
    };
    await act(() => {
      useAssistanceDraftStore.getState().addDocument(document);
      useAssistanceDraftStore.getState().addDocument(document);
    });
    expect(useAssistanceDraftStore.getState().documents.length).toBe(1);
    await act(() => {
      useAssistanceDraftStore.getState().removeDocument('doc-1');
    });
    expect(useAssistanceDraftStore.getState().documents.length).toBe(0);
  });

  it('reset clears everything for a new application', async () => {
    await act(() => {
      useAssistanceDraftStore.getState().setProgram('p1');
      useAssistanceDraftStore.getState().setNotes('note');
    });
    await act(() => {
      useAssistanceDraftStore.getState().reset();
    });
    const state = useAssistanceDraftStore.getState();
    expect(state.programId).toBeNull();
    expect(state.notes).toBe('');
  });
});
