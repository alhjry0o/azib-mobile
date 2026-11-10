// MapsProvider contract. Backed by a small in-memory table in demo, by a maps SDK in backend (later).

import type { Result } from '@/core/result';
import type { ProviderBase } from '../types';

export interface Coordinates {
  readonly lat: number;
  readonly lng: number;
}

export interface PlaceResult {
  readonly id: string;
  readonly label: string;
  readonly coordinates: Coordinates;
}

export interface MapsProvider extends ProviderBase {
  readonly name: 'maps';
  geocode(address: string): Promise<Result<Coordinates | null>>;
  reverseGeocode(coordinates: Coordinates): Promise<Result<string | null>>;
}
