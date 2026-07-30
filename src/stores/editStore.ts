import { create } from 'zustand'

interface EditState {
  isEditMode: boolean
  toggleEditMode: () => void
  setEditMode: (mode: boolean) => void
}

export const useEditStore = create<EditState>((set) => ({
  isEditMode: false,
  toggleEditMode: () => set((s) => ({ isEditMode: !s.isEditMode })),
  setEditMode: (mode) => set({ isEditMode: mode }),
}))