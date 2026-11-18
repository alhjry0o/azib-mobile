import type { AccountExport } from '@/providers';
import {
  EXPORT_NOTICES,
  buildExportDocument,
  exportFileName,
  serializeExport,
} from '../export-service';

const account: AccountExport = {
  generatedAt: '2026-11-16T10:00:00.000Z',
  dataOrigin: 'demo',
  user: {
    id: 'demo-user-1',
    email: 'export@azib.invalid',
    phone: null,
    displayName: 'Demo User',
    dataOrigin: 'demo',
    createdAt: '2026-11-01T00:00:00.000Z',
    roles: ['member'],
    consents: [{ docId: 'terms', version: 'draft-1', acceptedAt: '2026-11-01T00:00:00.000Z' }],
  },
  consents: [{ docId: 'terms', version: 'draft-1', acceptedAt: '2026-11-01T00:00:00.000Z' }],
  sessions: [
    {
      id: 'demo-session-1',
      deviceLabel: 'demo-device-1',
      createdAt: '2026-11-16T09:00:00.000Z',
      lastSeenAt: '2026-11-16T10:00:00.000Z',
      current: true,
    },
  ],
  deletionRequest: null,
};

const preferences = {
  numberSystem: 'latn' as const,
  appearance: 'dark',
  visibility: 'private' as const,
  storiesConsent: false,
  notifications: { enabled: true, assistance: true, weddings: true, marketplace: false },
  biometricLock: false,
};

describe('export service', () => {
  it('builds a versioned document with the account and preferences', () => {
    const document = buildExportDocument({
      account,
      profile: null,
      preferences,
      now: new Date('2026-11-16T12:00:00.000Z'),
    });
    expect(document.schemaVersion).toBe(1);
    expect(document.generatedAt).toBe('2026-11-16T12:00:00.000Z');
    expect(document.account?.user.id).toBe('demo-user-1');
    expect(document.preferences.numberSystem).toBe('latn');
    expect(document.notices).toEqual(EXPORT_NOTICES);
  });

  it('never serializes tokens or passwords', () => {
    const document = buildExportDocument({ account, profile: null, preferences });
    const json = serializeExport(document);
    expect(json).not.toContain('accessToken');
    expect(json).not.toContain('refreshToken');
    expect(json).not.toContain('password');
    expect(() => JSON.parse(json)).not.toThrow();
  });

  it('produces readable, stable JSON', () => {
    const document = buildExportDocument({
      account,
      profile: null,
      preferences,
      now: new Date('2026-11-16T12:00:00.000Z'),
    });
    const json = serializeExport(document);
    expect(json.includes('\n')).toBe(true);
    expect(JSON.parse(json).app.name).toBe('AZIB');
  });

  it('names the file from the generation date', () => {
    expect(exportFileName('2026-11-16T12:00:00.000Z')).toBe('azib-export-20261116.json');
  });

  it('handles a signed-out export honestly', () => {
    const document = buildExportDocument({ account: null, profile: null, preferences });
    expect(document.account).toBeNull();
    expect(document.profile).toBeNull();
  });
});
