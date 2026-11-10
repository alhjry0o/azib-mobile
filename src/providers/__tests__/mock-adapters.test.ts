import {
  createMockAiProvider,
  createMockAnalyticsProvider,
  createMockAuthProvider,
  createMockContentProvider,
  createMockDatabaseProvider,
  createMockEmailProvider,
  createMockMapsProvider,
  createMockNotificationProvider,
  createMockPaymentProvider,
  createMockSearchProvider,
  createMockSmsProvider,
  createMockStorageProvider,
  withConfig,
} from '@/providers/mock';
import type { ContentArticle } from '@/providers/contracts';

describe('mock adapters', () => {
  describe('auth', () => {
    it('starts with no session', async () => {
      const auth = createMockAuthProvider();
      const r = await auth.getSession();
      expect(r.ok).toBe(true);
      if (r.ok) expect(r.value).toBe(null);
    });

    it('signIn creates a demo session with dataOrigin=demo', async () => {
      const auth = createMockAuthProvider();
      const r = await auth.signIn({ email: 'demo@example.com', password: 'x' });
      expect(r.ok).toBe(true);
      if (r.ok) {
        expect(r.value.user.dataOrigin).toBe('demo');
        expect(r.value.user.email).toBe('demo@example.com');
      }
    });

    it('rejects empty credentials with Validation error', async () => {
      const auth = createMockAuthProvider();
      const r = await auth.signIn({ email: '', password: 'x' });
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.error.kind).toBe('Validation');
    });

    it('signOut clears the session', async () => {
      const auth = createMockAuthProvider();
      await auth.signIn({ email: 'x@y.z', password: 'p' });
      await auth.signOut();
      const r = await auth.getSession();
      expect(r.ok).toBe(true);
      if (r.ok) expect(r.value).toBe(null);
    });

    it('forceError injects failure on every call', async () => {
      const auth = createMockAuthProvider(withConfig({ forceError: 'Network' }));
      const r = await auth.signIn({ email: 'x@y.z', password: 'p' });
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.error.kind).toBe('Network');
    });
  });

  describe('storage', () => {
    it('uploads and retrieves files', async () => {
      const s = createMockStorageProvider();
      const up = await s.uploadFile('file://local.png', { contentType: 'image/png' });
      expect(up.ok).toBe(true);
      if (!up.ok) return;
      expect(up.value.dataOrigin).toBe('demo');
      const url = await s.getPublicUrl(up.value.id);
      expect(url.ok).toBe(true);
      expect(s.__list().length).toBe(1);
    });

    it('returns NotFound for missing files', async () => {
      const s = createMockStorageProvider();
      const r = await s.getPublicUrl('nope');
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.error.kind).toBe('NotFound');
    });
  });

  describe('payment (ADR-0005 Non-Custodial)', () => {
    it('recordPledge stores intent, no money movement', async () => {
      const pay = createMockPaymentProvider();
      const r = await pay.recordPledge({ amount: 5000, currency: 'YER' });
      expect(r.ok).toBe(true);
      if (r.ok) {
        expect(r.value.status).toBe('pending');
        expect(r.value.dataOrigin).toBe('demo');
      }
    });

    it('rejects zero/negative amounts', async () => {
      const pay = createMockPaymentProvider();
      const r = await pay.recordPledge({ amount: 0, currency: 'YER' });
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.error.kind).toBe('Validation');
    });

    it('verifyExternalPayment returns null honestly (never fakes confirmation)', async () => {
      const pay = createMockPaymentProvider();
      const r = await pay.verifyExternalPayment('ref-123');
      expect(r.ok).toBe(true);
      if (r.ok) expect(r.value).toBe(null);
    });
  });

  describe('ai (ADR-0006 Advisory only)', () => {
    it('scoreEligibility returns advisory:true', async () => {
      const ai = createMockAiProvider();
      const r = await ai.scoreEligibility({ factors: { income: 50, family: 80 } });
      expect(r.ok).toBe(true);
      if (r.ok) {
        expect(r.value.advisory).toBe(true);
        expect(r.value.score).toBe(65);
      }
    });

    it('clamps scores to 0..100', async () => {
      const ai = createMockAiProvider();
      const high = await ai.scoreEligibility({ factors: { a: 500 } });
      expect(high.ok).toBe(true);
      if (high.ok) expect(high.value.score).toBe(100);
    });

    it('returns 0 for empty factors', async () => {
      const ai = createMockAiProvider();
      const r = await ai.scoreEligibility({ factors: {} });
      expect(r.ok).toBe(true);
      if (r.ok) expect(r.value.score).toBe(0);
    });
  });

  describe('content', () => {
    it('returns null for unknown slug', async () => {
      const c = createMockContentProvider();
      const r = await c.getArticleBySlug('missing');
      expect(r.ok).toBe(true);
      if (r.ok) expect(r.value).toBe(null);
    });

    it('lists injected articles', async () => {
      const article: ContentArticle = {
        id: 'a1',
        slug: 'welcome',
        titleKey: 'learn:title',
        bodyKey: 'learn:notConnectedYet',
      };
      const c = createMockContentProvider(undefined, [article]);
      const r = await c.listArticles();
      expect(r.ok).toBe(true);
      if (r.ok) expect(r.value.length).toBe(1);
    });
  });

  describe('search', () => {
    it('returns empty for empty query', async () => {
      const s = createMockSearchProvider();
      const r = await s.query({ text: '' });
      expect(r.ok).toBe(true);
      if (r.ok) expect(r.value).toEqual([]);
    });

    it('matches substring case-insensitively', async () => {
      const s = createMockSearchProvider(undefined, [
        { id: '1', score: 1, item: { title: 'Group Wedding' } },
        { id: '2', score: 1, item: { title: 'Souk' } },
      ]);
      const r = await s.query({ text: 'wedding' });
      expect(r.ok).toBe(true);
      if (r.ok) expect(r.value.length).toBe(1);
    });

    it('respects limit', async () => {
      const items = Array.from({ length: 10 }, (_, i) => ({
        id: String(i),
        score: 1,
        item: { title: 'match' },
      }));
      const s = createMockSearchProvider(undefined, items);
      const r = await s.query({ text: 'match', limit: 3 });
      expect(r.ok).toBe(true);
      if (r.ok) expect(r.value.length).toBe(3);
    });
  });

  describe('maps', () => {
    it('geocodes a known place', async () => {
      const m = createMockMapsProvider(undefined, [
        { id: 'p1', label: 'Sanaa', coordinates: { lat: 15.37, lng: 44.19 } },
      ]);
      const r = await m.geocode('sanaa');
      expect(r.ok).toBe(true);
      if (r.ok && r.value) {
        expect(r.value.lat).toBeCloseTo(15.37);
      }
    });

    it('returns null for unknown place', async () => {
      const m = createMockMapsProvider();
      const r = await m.geocode('nowhere');
      expect(r.ok).toBe(true);
      if (r.ok) expect(r.value).toBe(null);
    });
  });

  describe('notification', () => {
    it('schedules and cancels notifications', async () => {
      const n = createMockNotificationProvider();
      const perm = await n.requestPermission();
      expect(perm.ok).toBe(true);
      const sched = await n.scheduleLocal({ title: 't', body: 'b' }, 60);
      expect(sched.ok).toBe(true);
      if (!sched.ok) return;
      expect(n.__scheduled().length).toBe(1);
      await n.cancelScheduled(sched.value);
      expect(n.__scheduled().length).toBe(0);
    });
  });

  describe('email + sms', () => {
    it('email.send records messages', async () => {
      const e = createMockEmailProvider();
      const r = await e.send({ to: 'a@b.c', subject: 's', body: 'b' });
      expect(r.ok).toBe(true);
      expect(e.__sent().length).toBe(1);
    });

    it('sms.send records messages', async () => {
      const s = createMockSmsProvider();
      const r = await s.send({ to: '+000', body: 'b' });
      expect(r.ok).toBe(true);
      expect(s.__sent().length).toBe(1);
    });
  });

  describe('analytics', () => {
    it('tracks events and user id', async () => {
      const a = createMockAnalyticsProvider();
      await a.track({ name: 'test', properties: { k: 'v' } });
      await a.setUserId('u1');
      expect(a.__events().length).toBe(1);
      expect(a.__userId()).toBe('u1');
    });
  });

  describe('database', () => {
    it('is a marker with no capabilities', async () => {
      const d = createMockDatabaseProvider();
      expect(d.capabilities).toEqual([]);
      const hc = await d.healthCheck();
      expect(hc.status).toBe('ok');
    });
  });
});
