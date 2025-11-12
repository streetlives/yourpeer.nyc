import { create } from "zustand";
import { persist } from "zustand/middleware";

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

interface ViewStore {
  showMapViewOnMobile: boolean;
  setShowMapViewOnMobile: (value: boolean) => void;
}

export const useViewStore = create<ViewStore>()(
  persist(
    (set) => ({
      showMapViewOnMobile: false,
      setShowMapViewOnMobile: (value: boolean) =>
        set({ showMapViewOnMobile: value }),
    }),
    {
      name: "view-store", // storage key name
    },
  ),
);
