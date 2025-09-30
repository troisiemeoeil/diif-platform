import { create } from "zustand";

export const useAppStore = create((set) => ({
    stemKey: null,
    stemInfo: null,
    sheetOpen: false,
    setStemKey: (key) => set({ stemKey: key }),
    setStemInfo: (info) => set({ stemInfo: info }),
    setSheetOpen: (open) => set({ sheetOpen: open }),
}));