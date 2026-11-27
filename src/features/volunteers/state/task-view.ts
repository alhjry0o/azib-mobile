// SHARED DISPLAY PROJECTION (D-3). Ambassador and volunteer tasks stay two
// distinct domains — no migration, no deletion. Only the VIEW is unified so a
// single component can render both boards in P13.3.
import type { AmbassadorTask } from '@/repositories/contracts/ambassador';
import type { VolunteerTask } from '@/repositories/contracts/volunteer-task';

export type TaskSource = 'volunteer' | 'ambassador';

export interface TaskView {
  readonly id: string;
  readonly source: TaskSource;
  readonly titleKey: string;
  readonly governorateId: string;
  readonly kindKey: string;
  readonly status: string;
  readonly dataOrigin: 'demo' | 'real';
  readonly actionable: boolean;
}

export function volunteerTaskToView(task: VolunteerTask): TaskView {
  return Object.freeze({
    id: task.id,
    source: 'volunteer' as const,
    titleKey: task.titleKey,
    governorateId: task.governorateId,
    kindKey: `marketplace:volunteers.kinds.${task.kind}`,
    status: task.status,
    dataOrigin: task.dataOrigin,
    actionable: task.status === 'assigned' || task.status === 'accepted',
  });
}

export function ambassadorTaskToView(task: AmbassadorTask): TaskView {
  return Object.freeze({
    id: task.id,
    source: 'ambassador' as const,
    titleKey: task.titleKey,
    governorateId: task.governorateId,
    kindKey: `marketplace:ambassador.kinds.${task.kind}`,
    status: task.status,
    dataOrigin: task.dataOrigin,
    actionable: task.status === 'assigned',
  });
}

export interface TaskViewFilters {
  readonly governorateId: string | null;
  readonly source: TaskSource | null;
  readonly actionableOnly: boolean;
}

export const DEFAULT_TASK_FILTERS: TaskViewFilters = Object.freeze({
  governorateId: null,
  source: null,
  actionableOnly: false,
});

export function filterTaskViews(
  views: readonly TaskView[],
  filters: TaskViewFilters,
): readonly TaskView[] {
  return views.filter((view) => {
    if (filters.governorateId && view.governorateId !== filters.governorateId) return false;
    if (filters.source && view.source !== filters.source) return false;
    if (filters.actionableOnly && !view.actionable) return false;
    return true;
  });
}
