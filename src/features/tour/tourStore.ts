import { create } from 'zustand';

import { addAnalyticsSink } from '../../shared/analytics/analytics';
import { TOUR_STEPS, type TourStepId } from './tourSteps';

type TourState = {
  isOpen: boolean;
  completed: ReadonlySet<TourStepId>;
  /** Analytics events seen this session; shown live in the analytics step. */
  eventCount: number;
  hasAutoOpened: boolean;

  open: () => void;
  close: () => void;
  /** Opens the tour the first time it's called in a session. */
  openOnce: () => void;
  markDone: (id: TourStepId) => void;
  reset: () => void;
};

export const useTourStore = create<TourState>()(set => ({
  isOpen: false,
  completed: new Set(),
  eventCount: 0,
  hasAutoOpened: false,

  open: () => set({ isOpen: true, hasAutoOpened: true }),
  close: () => set({ isOpen: false }),
  openOnce: () =>
    set(state =>
      state.hasAutoOpened ? state : { isOpen: true, hasAutoOpened: true },
    ),
  markDone: id =>
    set(state =>
      state.completed.has(id)
        ? state
        : { completed: new Set([...state.completed, id]) },
    ),
  reset: () => set({ completed: new Set(), eventCount: 0 }),
}));

/** Steps that complete when the reviewer performs the action themselves. */
const STEP_BY_EVENT = new Map(
  TOUR_STEPS.flatMap(step =>
    step.completesOn ? [[step.completesOn, step.id] as const] : [],
  ),
);

// The tour listens to the same analytics stream as any other consumer.
addAnalyticsSink(event => {
  useTourStore.setState(state => ({ eventCount: state.eventCount + 1 }));
  const stepId = STEP_BY_EVENT.get(event.name);
  if (stepId) {
    useTourStore.getState().markDone(stepId);
  }
});
