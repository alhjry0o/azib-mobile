import { DELETION_GRACE_DAYS, createMockAuthProvider } from '@/providers/mock/auth';

const credentials = { email: 'security@azib.invalid', password: 'pass1234' };

async function signedIn() {
  const auth = createMockAuthProvider();
  const result = await auth.signIn(credentials);
  if (!result.ok) throw new Error('setup failed');
  return auth;
}

describe('mock auth security (P06.3)', () => {
  it('changePassword requires the correct current password', async () => {
    const auth = await signedIn();
    const wrong = await auth.changePassword({
      currentPassword: 'nope1234',
      newPassword: 'newpass123',
    });
    expect(wrong.ok).toBe(false);
    if (!wrong.ok) expect(wrong.error.meta.code).toBe('INVALID_CREDENTIALS');
  });

  it('changePassword updates the credential used by signIn', async () => {
    const auth = await signedIn();
    const changed = await auth.changePassword({
      currentPassword: 'pass1234',
      newPassword: 'newpass123',
    });
    expect(changed.ok).toBe(true);
    await auth.signOut();
    const oldLogin = await auth.signIn(credentials);
    expect(oldLogin.ok).toBe(false);
    const newLogin = await auth.signIn({ ...credentials, password: 'newpass123' });
    expect(newLogin.ok).toBe(true);
  });

  it('changePassword rejects a weak new password', async () => {
    const auth = await signedIn();
    const weak = await auth.changePassword({
      currentPassword: 'pass1234',
      newPassword: 'short',
    });
    expect(weak.ok).toBe(false);
    if (!weak.ok) expect(weak.error.kind).toBe('Validation');
  });

  it('lists sessions and marks exactly one as current', async () => {
    const auth = await signedIn();
    const list = await auth.listSessions();
    expect(list.ok).toBe(true);
    if (!list.ok) return;
    expect(list.value.length).toBe(1);
    expect(list.value.filter((s) => s.current).length).toBe(1);
  });

  it('revoking the current session clears it', async () => {
    const auth = await signedIn();
    const list = await auth.listSessions();
    if (!list.ok) throw new Error('setup failed');
    const current = list.value.find((s) => s.current);
    const revoked = await auth.revokeSession(current?.id ?? '');
    expect(revoked.ok).toBe(true);
    const session = await auth.getSession();
    expect(session.ok).toBe(true);
    if (session.ok) expect(session.value).toBeNull();
  });

  it('revoking an unknown session returns NotFound', async () => {
    const auth = await signedIn();
    const revoked = await auth.revokeSession('missing');
    expect(revoked.ok).toBe(false);
    if (!revoked.ok) expect(revoked.error.meta.code).toBe('SESSION_NOT_FOUND');
  });

  it('schedules deletion only after re-authentication', async () => {
    const auth = await signedIn();
    const wrong = await auth.requestAccountDeletion({ password: 'bad12345' });
    expect(wrong.ok).toBe(false);
    const scheduled = await auth.requestAccountDeletion({ password: 'pass1234' });
    expect(scheduled.ok).toBe(true);
    if (!scheduled.ok) return;
    expect(scheduled.value.status).toBe('pending');
    expect(scheduled.value.gracePeriodDays).toBe(DELETION_GRACE_DAYS);
    expect(scheduled.value.policyStatus).toBe('pending-human-approval');
    expect(scheduled.value.scheduledFor > scheduled.value.requestedAt).toBe(true);
  });

  it('cancels a deletion request and reports NotFound afterwards', async () => {
    const auth = await signedIn();
    await auth.requestAccountDeletion({ password: 'pass1234' });
    const cancelled = await auth.cancelAccountDeletion();
    expect(cancelled.ok).toBe(true);
    const again = await auth.cancelAccountDeletion();
    expect(again.ok).toBe(false);
    if (!again.ok) expect(again.error.meta.code).toBe('NO_DELETION_REQUEST');
  });

  it('exports account data without passwords or tokens', async () => {
    const auth = await signedIn();
    const exported = await auth.exportAccountData();
    expect(exported.ok).toBe(true);
    if (!exported.ok) return;
    const serialized = JSON.stringify(exported.value);
    expect(serialized).not.toContain('pass1234');
    expect(serialized).not.toContain('accessToken');
    expect(serialized).not.toContain('refreshToken');
    expect(exported.value.user.dataOrigin).toBe('demo');
    expect(exported.value.sessions.length).toBe(1);
  });

  it('security operations require an active session', async () => {
    const auth = createMockAuthProvider();
    const changed = await auth.changePassword({
      currentPassword: 'pass1234',
      newPassword: 'newpass123',
    });
    expect(changed.ok).toBe(false);
    const exported = await auth.exportAccountData();
    expect(exported.ok).toBe(false);
    const list = await auth.listSessions();
    expect(list.ok).toBe(true);
    if (list.ok) expect(list.value.length).toBe(0);
  });
});
