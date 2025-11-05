import { create } from "zustand";

export const useAppStore = create((set) => ({
    stemKey: null,
    stemInfo: null,
    sheetOpen: false,
    logNumber: 0,
    setStemKey: (key) => set({ stemKey: key }),
    setStemInfo: (info) => set({ stemInfo: info }),
    setSheetOpen: (open) => set({ sheetOpen: open }),
    setLogNumber: (num) => set({ logNumber: num }),

}));


export const useControlSawmillModal = create((set) => ({
    open: undefined,
    setOpenModal: (state) => set(({ open: state })),
    highlightedFeatureId: null,
    setHighlightedFeatureId: (id) => set({ highlightedFeatureId: id }),
}))