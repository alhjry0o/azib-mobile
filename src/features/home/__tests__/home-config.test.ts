import {
  DEFAULT_HOME_CONFIG,
  hiddenFromMap,
  hiddenQuickActionsFromMap,
  moveInList,
  normalizeOrder,
} from '../config/default-home-config';
import {
  createMockHomeConfigSource,
  getHomeConfigSource,
  resetHomeConfigSource,
  setHomeConfigSource,
} from '../config/home-config.source';
import { HOME_QUICK_ACTION_IDS, HOME_SECTION_IDS } from '../config/home-config.types';
import { REGISTERED_SECTION_IDS } from '../sections/registry';

describe('home config defaults', () => {
  it('lists all eight planned sections in a stable order', () => {
    expect(DEFAULT_HOME_CONFIG.sections).toEqual(HOME_SECTION_IDS);
    expect(DEFAULT_HOME_CONFIG.hiddenSections).toEqual([]);
    expect(DEFAULT_HOME_CONFIG.hiddenQuickActions).toEqual([]);
  });

  it('registers only the sections implemented in P07.1', () => {
    expect(REGISTERED_SECTION_IDS).toEqual(['weddings', 'offers', 'souk', 'jobs']);
  });
});

describe('normalizeOrder', () => {
  it('drops unknown ids and duplicates', () => {
    const result = normalizeOrder(['jobs', 'nope', 'jobs', 'weddings']);
    expect(result.slice(0, 2)).toEqual(['jobs', 'weddings']);
    expect(new Set(result).size).toBe(HOME_SECTION_IDS.length);
  });

  it('appends every missing known id', () => {
    const result = normalizeOrder(['souk']);
    expect(result[0]).toBe('souk');
    for (const id of HOME_SECTION_IDS) expect(result).toContain(id);
  });

  it('returns the full default order for an empty input', () => {
    expect(normalizeOrder([])).toEqual(HOME_SECTION_IDS);
  });
});

describe('visibility maps', () => {
  it('treats only explicit false as hidden', () => {
    expect(hiddenFromMap({ weddings: false, jobs: true })).toEqual(['weddings']);
    expect(hiddenFromMap({})).toEqual([]);
  });

  it('filters quick actions the same way', () => {
    expect(hiddenQuickActionsFromMap({ jobs: false })).toEqual(['jobs']);
    expect(hiddenQuickActionsFromMap({ souk: true })).toEqual([]);
    expect(hiddenQuickActionsFromMap({ unknown: false })).toEqual([]);
  });

  it('keeps every quick action id known', () => {
    expect(HOME_QUICK_ACTION_IDS.length).toBe(7);
  });
});

describe('moveInList', () => {
  const list = ['a', 'b', 'c'] as const;

  it('moves down and up', () => {
    expect(moveInList(list, 'a', 1)).toEqual(['b', 'a', 'c']);
    expect(moveInList(list, 'c', -1)).toEqual(['a', 'c', 'b']);
  });

  it('is a no-op at the edges and for unknown ids', () => {
    expect(moveInList(list, 'a', -1)).toEqual(list);
    expect(moveInList(list, 'c', 1)).toEqual(list);
    expect(moveInList(list, 'z', 1)).toEqual(list);
  });
});

describe('home config source', () => {
  afterEach(() => {
    resetHomeConfigSource();
  });

  it('loads the default config from the mock source', async () => {
    const result = await createMockHomeConfigSource().load();
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.sections).toEqual(HOME_SECTION_IDS);
  });

  it('is swappable without touching consumers', async () => {
    setHomeConfigSource({
      id: 'test',
      load: async () => ({
        ok: true,
        value: { sections: ['jobs'], hiddenSections: [], hiddenQuickActions: [] },
      }),
    });
    expect(getHomeConfigSource().id).toBe('test');
    const result = await getHomeConfigSource().load();
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.sections).toEqual(['jobs']);
    resetHomeConfigSource();
    expect(getHomeConfigSource().id).toBe('mock');
  });
});
