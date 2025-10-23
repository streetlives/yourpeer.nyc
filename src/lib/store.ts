import { create } from "zustand";

interface FiltersStore {
  isOpen: boolean;
  resultsCount?: number;
  updateResultCount: (count: number) => void;
  open: () => void;
  close: () => void;
}

export const useFilters = create<FiltersStore>((set) => ({
  isOpen: false,
  resultsCount: 0,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  updateResultCount: (count: number) => set({ resultsCount: count }),
}));
