import { create } from 'zustand';

export const useThemeStore = create(set => ({
  appTheme: 'light',
  toggleTheme: () =>
    set(state => ({ appTheme: state.appTheme === 'light' ? 'dark' : 'light' })),
}));
