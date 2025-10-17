import { create } from 'zustand';

export const useAppStore = create((set) => ({
  refreshTick: 0,
  triggerRefresh: () => set((state) => ({ refreshTick: state.refreshTick + 1 })),
}));
