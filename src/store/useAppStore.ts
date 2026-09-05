import { create } from 'zustand';

interface AppState {
  activeModule: string;
  setActiveModule: (module: string) => void;
  isFabOpen: boolean;
  setFabOpen: (isOpen: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  activeModule: 'dashboard',
  setActiveModule: (module) => set({ activeModule: module }),
  isFabOpen: false,
  setFabOpen: (isOpen) => set({ isFabOpen: isOpen }),
}));
