import { create } from 'zustand';
import {  persist } from 'zustand/middleware';

export const useThemeStore = create(
  persist(
    set => ({
      appTheme: 'light',
      toggleTheme: () =>
        set(state => ({
          appTheme: state.appTheme === 'light' ? 'dark' : 'light',
        })),
    }),
    {
      name: 'app-theme',
    }
  )
);



