// In-memory MapsProvider. Empty by default; seed populates in Part 5.
// Places are looked up by exact label match (case-insensitive).

import type { Result } from '@/core/result';

import type { Coordinates, MapsProvider, PlaceResult } from '../contracts/maps';
import type { HealthCheckResult } from '../types';
import { DEFAULT_MOCK_CONFIG, simulateMockIO, type MockProviderConfig } from './config';

export function createMockMapsProvider(
  config: MockProviderConfig = DEFAULT_MOCK_CONFIG,
  places: readonly PlaceResult[] = [],
): MapsProvider {
  const table = new Map(places.map((p) => [p.label.toLowerCase(), p]));

  return Object.freeze({
    name: 'maps' as const,
    mode: 'mock' as const,
    capabilities: ['geocode', 'reverseGeocode'] as const,
    async healthCheck(): Promise<HealthCheckResult> {
      return { status: 'ok', checkedAt: Date.now() };
    },
    async geocode(address: string): Promise<Result<Coordinates | null>> {
      const failure = await simulateMockIO(config);
      if (failure) return { ok: false, error: failure };
      const found = table.get(address.trim().toLowerCase());
      return { ok: true, value: found?.coordinates ?? null };
    },
    async reverseGeocode(coordinates: Coordinates): Promise<Result<string | null>> {
      const failure = await simulateMockIO(config);
      if (failure) return { ok: false, error: failure };
      const tolerance = 0.0001;
      for (const place of table.values()) {
        if (
          Math.abs(place.coordinates.lat - coordinates.lat) < tolerance &&
          Math.abs(place.coordinates.lng - coordinates.lng) < tolerance
        ) {
          return { ok: true, value: place.label };
        }
      }
      return { ok: true, value: null };
    },
  });
}
