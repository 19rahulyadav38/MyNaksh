import { create } from 'zustand';

/**
 * Which timeline messages are currently on screen (vertically). Kept separate
 * from chat state so scroll-driven updates never touch message data.
 */
type VisibilityState = {
  visibleMessageIds: ReadonlySet<string>;
  setVisibleMessageIds: (ids: string[]) => void;
};

export const useVisibilityStore = create<VisibilityState>()(set => ({
  visibleMessageIds: new Set(),
  setVisibleMessageIds: ids => set({ visibleMessageIds: new Set(ids) }),
}));

export function useIsMessageVisible(id: string): boolean {
  return useVisibilityStore(state => state.visibleMessageIds.has(id));
}
