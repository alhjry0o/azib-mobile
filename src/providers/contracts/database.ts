// DatabaseProvider is a *marker* for database connectivity.
// Repositories are injected separately via the RepositoryContainer (Part 4).
// This interface exists so AppMode toggles and health checks cover the DB layer.

import type { ProviderBase } from '../types';

export interface DatabaseProvider extends ProviderBase {
  readonly name: 'database';
}
