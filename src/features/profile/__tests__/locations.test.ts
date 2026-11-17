import {
  childrenOf,
  deepestId,
  isValidChain,
  locationById,
  locationChain,
  selectionFromId,
} from '../locations';

describe('location tree', () => {
  it('lists governorates at the root', () => {
    const roots = childrenOf(null);
    expect(roots.length).toBeGreaterThan(0);
    expect(roots.every((r) => r.level === 'governorate')).toBe(true);
  });

  it('cascades children by parent', () => {
    const districts = childrenOf('sanaa');
    expect(districts.length).toBeGreaterThan(0);
    expect(districts.every((d) => d.parentId === 'sanaa')).toBe(true);
    expect(childrenOf('maeen').map((a) => a.id)).toContain('hadda');
  });

  it('marks every row as demo pending human review', () => {
    for (const row of childrenOf(null)) {
      expect(row.dataOrigin).toBe('demo');
      expect(row.verificationStatus).toBe('pending-human-review');
      expect(row.nameKey.startsWith('profile:locations.')).toBe(true);
    }
  });

  it('builds a root-to-leaf chain', () => {
    expect(locationChain('hadda').map((l) => l.id)).toEqual(['sanaa', 'maeen', 'hadda']);
    expect(locationChain('sanaa').map((l) => l.id)).toEqual(['sanaa']);
    expect(locationChain('nope')).toEqual([]);
    expect(locationChain(null)).toEqual([]);
  });

  it('splits a stored id back into cascade levels', () => {
    expect(selectionFromId('hadda')).toEqual({
      governorateId: 'sanaa',
      districtId: 'maeen',
      areaId: 'hadda',
    });
    expect(selectionFromId('maeen')).toEqual({
      governorateId: 'sanaa',
      districtId: 'maeen',
      areaId: null,
    });
    expect(selectionFromId(null)).toEqual({
      governorateId: null,
      districtId: null,
      areaId: null,
    });
  });

  it('returns the deepest selected id', () => {
    expect(deepestId({ governorateId: 'sanaa', districtId: 'maeen', areaId: 'hadda' })).toBe('hadda');
    expect(deepestId({ governorateId: 'sanaa', districtId: 'maeen', areaId: null })).toBe('maeen');
    expect(deepestId({ governorateId: 'sanaa', districtId: null, areaId: null })).toBe('sanaa');
    expect(deepestId({ governorateId: null, districtId: null, areaId: null })).toBeNull();
  });

  it('validates parent-child integrity', () => {
    expect(isValidChain({ governorateId: 'sanaa', districtId: 'maeen', areaId: 'hadda' })).toBe(true);
    expect(isValidChain({ governorateId: 'sanaa', districtId: 'maeen', areaId: null })).toBe(true);
    expect(isValidChain({ governorateId: 'aden', districtId: 'maeen', areaId: null })).toBe(false);
    expect(isValidChain({ governorateId: 'sanaa', districtId: 'maeen', areaId: 'jeruf' })).toBe(false);
    expect(isValidChain({ governorateId: null, districtId: null, areaId: null })).toBe(false);
  });

  it('returns null for unknown ids', () => {
    expect(locationById('missing')).toBeNull();
    expect(locationById(undefined)).toBeNull();
  });
});
