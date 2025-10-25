import { create } from "zustand";

interface FiltersStore {
  isOpen: boolean;
  resultsCount?: number;
  updateResultCount: (count: number) => void;
  open: () => void;
  close: () => void;
  isLoading: boolean;
  setLoading: (value: boolean) => void;
}

export const useFilters = create<FiltersStore>((set) => ({
  isOpen: false,
  resultsCount: 0,
  isLoading: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  updateResultCount: (count: number) => set({ resultsCount: count }),
  setLoading: (value) => set({ isLoading: value }),
}));
