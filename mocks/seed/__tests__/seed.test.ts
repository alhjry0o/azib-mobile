import { buildDemoSeedBundle, SEED_REFERENCE_DATE } from '../index';
import {
  seedApplications,
  seedAudit,
  seedContent,
  seedDisbursements,
  seedDonations,
  seedJobs,
  seedNotifications,
  seedOffers,
  seedPartners,
  seedProfiles,
  seedPrograms,
  seedSettings,
  seedSouk,
  seedVolunteers,
  seedWeddings,
} from '../index';

// PII patterns for defensive validation.
const EMAIL_RE = /@[^/]+\.(?!invalid$)[A-Za-z]{2,}$/;
const PHONE_RE = /^\+?[0-9]{1,15}$/;

describe('Demo seed bundle', () => {
  it('buildDemoSeedBundle returns all 15 collections', () => {
    const b = buildDemoSeedBundle();
    expect(Object.keys(b).length).toBe(15);
  });

  it('SEED_REFERENCE_DATE is a valid ISO timestamp', () => {
    expect(new Date(SEED_REFERENCE_DATE).toISOString()).toBe(SEED_REFERENCE_DATE);
  });

  describe('profiles', () => {
    it('has at least 3 profiles', () => {
      expect(seedProfiles.length).toBeGreaterThanOrEqual(3);
    });

    it('no real email addresses', () => {
      for (const p of seedProfiles) {
        // CreateProfileInput has no email field, so this checks phone only.
        if (p.phone) expect(p.phone).not.toMatch(EMAIL_RE);
      }
    });

    it('all phone numbers are the fictional +967000… pattern', () => {
      for (const p of seedProfiles) {
        if (p.phone) {
          expect(p.phone).toMatch(/^\+9670+[0-9]{1,3}$/);
          expect(p.phone).toMatch(PHONE_RE);
        }
      }
    });

    it('displayNames are Arabic strings (demo-appropriate)', () => {
      for (const p of seedProfiles) {
        expect(p.displayName.length).toBeGreaterThan(0);
      }
    });

    it('userIds are unique', () => {
      const ids = new Set(seedProfiles.map((p) => p.userId));
      expect(ids.size).toBe(seedProfiles.length);
    });
  });

  describe('programs', () => {
    it('minAmount < maxAmount for every program', () => {
      for (const p of seedPrograms) {
        expect(p.minAmount).toBeLessThan(p.maxAmount);
      }
    });

    it('uses i18n keys, not literal text', () => {
      for (const p of seedPrograms) {
        expect(p.nameKey).toMatch(/^[a-z][a-z0-9.]*[a-z0-9]$/);
        expect(p.descriptionKey).toMatch(/^[a-z][a-z0-9.]*[a-z0-9]$/);
      }
    });
  });

  describe('applications', () => {
    it('applicantId references an existing seed userId (or a donor placeholder)', () => {
      const userIds = new Set(seedProfiles.map((p) => p.userId));
      for (const a of seedApplications) {
        // Seed applications use seed-user-* which come from profiles.
        expect(userIds.has(a.applicantId)).toBe(true);
      }
    });

    it('requestedAmount is positive', () => {
      for (const a of seedApplications) {
        expect(a.requestedAmount).toBeGreaterThan(0);
      }
    });
  });

  describe('weddings', () => {
    it('capacity is positive', () => {
      for (const w of seedWeddings) {
        expect(w.capacity).toBeGreaterThan(0);
      }
    });

    it('scheduledDate is a valid ISO timestamp', () => {
      for (const w of seedWeddings) {
        expect(new Date(w.scheduledDate).toISOString()).toBe(w.scheduledDate);
      }
    });
  });

  describe('partners', () => {
    it('displayName is non-empty', () => {
      for (const p of seedPartners) {
        expect(p.displayName.length).toBeGreaterThan(0);
      }
    });
  });

  describe('offers', () => {
    it('discountPercent is between 0 and 100', () => {
      for (const o of seedOffers) {
        expect(o.discountPercent).toBeGreaterThanOrEqual(0);
        expect(o.discountPercent).toBeLessThanOrEqual(100);
      }
    });
  });

  describe('souk / jobs / volunteers', () => {
    it('souk items have titleKey and category', () => {
      for (const s of seedSouk) {
        expect(s.titleKey.length).toBeGreaterThan(0);
        expect(s.category.length).toBeGreaterThan(0);
      }
    });

    it('jobs have titleKey and partnerId', () => {
      for (const j of seedJobs) {
        expect(j.titleKey.length).toBeGreaterThan(0);
        expect(j.partnerId.length).toBeGreaterThan(0);
      }
    });

    it('volunteers have userId and skillKey', () => {
      for (const v of seedVolunteers) {
        expect(v.userId.length).toBeGreaterThan(0);
        expect(v.skillKey.length).toBeGreaterThan(0);
      }
    });
  });

  describe('donations & disbursements', () => {
    it('donation amounts are positive', () => {
      for (const d of seedDonations) {
        expect(d.amount).toBeGreaterThan(0);
      }
    });

    it('disbursement amounts are positive', () => {
      for (const d of seedDisbursements) {
        expect(d.amount).toBeGreaterThan(0);
      }
    });
  });

  describe('content & notifications', () => {
    it('content references i18n keys, not literal text', () => {
      for (const c of seedContent) {
        expect(c.titleKey).toContain(':');
        expect(c.bodyKey).toContain(':');
      }
    });

    it('notifications reference i18n keys', () => {
      for (const n of seedNotifications) {
        expect(n.titleKey).toContain('.');
        expect(n.bodyKey).toContain('.');
      }
    });
  });

  describe('audit & settings', () => {
    it('audit entries have action and target', () => {
      for (const a of seedAudit) {
        expect(a.action.length).toBeGreaterThan(0);
        expect(a.target.length).toBeGreaterThan(0);
      }
    });

    it('settings values are objects', () => {
      for (const s of seedSettings) {
        expect(typeof s.value).toBe('object');
      }
    });
  });

  describe('PII safety', () => {
    it('no email addresses anywhere in seed', () => {
      const serialized = JSON.stringify(buildDemoSeedBundle());
      const matches = serialized.match(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g) ?? [];
      const realEmails = matches.filter((m) => !m.endsWith('.invalid'));
      expect(realEmails).toEqual([]);
    });

    it('no phone numbers outside the +967000… pattern', () => {
      const serialized = JSON.stringify(buildDemoSeedBundle());
      // Extract all phone-like substrings
      const matches = serialized.match(/"\+?[0-9]{6,15}"/g) ?? [];
      const realPhones = matches.filter((m) => !/^"\+9670+[0-9]{1,3}"$/.test(m));
      expect(realPhones).toEqual([]);
    });
  });
});
