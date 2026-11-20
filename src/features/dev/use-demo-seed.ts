import { useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useProviderContainer } from '@/providers';
import { populateHomeDemoData, type DemoSeedSummary } from './demo-seed';

export interface DemoSeedApi {
  readonly isDemo: boolean;
  readonly busy: boolean;
  readonly summary: DemoSeedSummary | null;
  run(): Promise<void>;
}

export function useDemoSeed(): DemoSeedApi {
  const container = useProviderContainer();
  const client = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [summary, setSummary] = useState<DemoSeedSummary | null>(null);

  const run = useCallback(async (): Promise<void> => {
    setBusy(true);
    const result = await populateHomeDemoData(container.repositories);
    await client.invalidateQueries({ queryKey: ['home'] });
    setSummary(result);
    setBusy(false);
  }, [container, client]);

  return { isDemo: container.mode === 'demo', busy, summary, run };
}
