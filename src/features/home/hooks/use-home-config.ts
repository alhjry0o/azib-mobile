// Merges the swappable source with the user's persisted customization.
import { useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSettingsStore } from '@/stores';
import {
  DEFAULT_HOME_CONFIG,
  hiddenFromMap,
  hiddenQuickActionsFromMap,
  moveInList,
  normalizeOrder,
} from '../config/default-home-config';
import { getHomeConfigSource } from '../config/home-config.source';
import {
  HOME_QUICK_ACTION_IDS,
  type HomeQuickActionId,
  type HomeSectionId,
} from '../config/home-config.types';
import { REGISTERED_SECTION_IDS } from '../sections/registry';

export interface HomeConfigApi {
  readonly order: readonly HomeSectionId[];
  readonly visibleSections: readonly HomeSectionId[];
  readonly hiddenSections: readonly HomeSectionId[];
  readonly quickActions: readonly HomeQuickActionId[];
  readonly isLoading: boolean;
  setSectionVisible(id: HomeSectionId, visible: boolean): void;
  moveSection(id: HomeSectionId, delta: number): void;
  setQuickActionVisible(id: HomeQuickActionId, visible: boolean): void;
  reset(): void;
}

export function useHomeConfig(): HomeConfigApi {
  const source = getHomeConfigSource();
  const storedOrder = useSettingsStore((s) => s.homeSectionOrder);
  const sectionMap = useSettingsStore((s) => s.homeSectionVisibility);
  const quickMap = useSettingsStore((s) => s.homeQuickActionVisibility);
  const setHomeSectionOrder = useSettingsStore((s) => s.setHomeSectionOrder);
  const setHomeSectionVisible = useSettingsStore((s) => s.setHomeSectionVisible);
  const setHomeQuickActionVisible = useSettingsStore((s) => s.setHomeQuickActionVisible);
  const resetHomeSections = useSettingsStore((s) => s.resetHomeSections);

  const query = useQuery({
    queryKey: ['home', 'config', source.id],
    queryFn: () => source.load(),
    staleTime: Infinity,
  });

  const base = query.data?.ok ? query.data.value : DEFAULT_HOME_CONFIG;

  const order = useMemo(() => {
    const merged = normalizeOrder(storedOrder.length > 0 ? storedOrder : base.sections);
    return merged.filter((id) => REGISTERED_SECTION_IDS.includes(id));
  }, [storedOrder, base]);

  const hiddenSections = useMemo(() => hiddenFromMap(sectionMap), [sectionMap]);
  const visibleSections = useMemo(
    () => order.filter((id) => !hiddenSections.includes(id)),
    [order, hiddenSections],
  );
  const quickActions = useMemo(() => {
    const hidden = hiddenQuickActionsFromMap(quickMap);
    return HOME_QUICK_ACTION_IDS.filter((id) => !hidden.includes(id));
  }, [quickMap]);

  const moveSection = useCallback(
    (id: HomeSectionId, delta: number): void => {
      setHomeSectionOrder(moveInList(order, id, delta));
    },
    [order, setHomeSectionOrder],
  );

  return {
    order,
    visibleSections,
    hiddenSections,
    quickActions,
    isLoading: query.isLoading,
    setSectionVisible: setHomeSectionVisible,
    moveSection,
    setQuickActionVisible: setHomeQuickActionVisible,
    reset: resetHomeSections,
  };
}
