import { create } from 'zustand';

interface LanguageStore {
  isSpanish: boolean;
  toggleLanguage: () => void;
  setLanguage: (isSpanish: boolean) => void;
}

export const useLanguageStore = create<LanguageStore>((set) => ({
  isSpanish: false,
  toggleLanguage: () => set((state) => ({ isSpanish: !state.isSpanish })),
  setLanguage: (isSpanish) => set({ isSpanish }),
}));
