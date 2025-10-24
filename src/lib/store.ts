import { create } from "zustand";

// interface LocationsQuery {
//   category?: Category | null;
//   subcategory?: SubCategory | null;
//   openingHours?: "open" | "any";
//   requirementsType?: ParsedRequirements;
// }

interface FiltersStore {
  isOpen: boolean;
  resultsCount?: number;
  updateResultCount: (count: number) => void;
  open: () => void;
  close: () => void;
  isLoading: boolean;
  setLoading: (value: boolean) => void;
  // query: LocationsQuery;
  // setCategory: (category: Category) => void;
  // setSubcategory: (subcategory: SubCategory | null) => void;
  // setOpeningHours: (openingHours: "open" | "any") => void;
  // setRequirementsType: (req: ParsedRequirements) => void;
}

export const useFilters = create<FiltersStore>((set) => ({
  isOpen: false,
  resultsCount: 0,
  isLoading: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  updateResultCount: (count: number) => set({ resultsCount: count }),
  setLoading: (value) => set({ isLoading: value }),
  // query: {},
  // setCategory: (category) => set((store) => ({ query: { category } })),
  // setSubcategory: (subcategory) =>
  //   set((store) => ({ query: { ...store.query, subcategory } })),
  // setRequirementsType: (requirementsType) =>
  //   set((store) => ({ query: { ...store.query, requirementsType } })),
  // setOpeningHours: (openingHours) =>
  //   set((store) => ({ query: { ...store.query, openingHours } })),
}));
