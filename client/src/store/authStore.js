import axios from 'axios';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const BASE_URL = import.meta.env.VITE_API_URL;

export const authStore = create(
  persist(
    (set, get) => ({
      token: null,
      user_id: null,
      username: null,
      roomId: null,
      isLoading: false,

      login: ({ user_id, username, token }) => {
        set({ user_id, username, token });
      },
      logout: () => {
        set({ user_id: null, username: null, token: null, roomId: null });
      },

      setRoomId: roomId => {
        set({ roomId });
      },
      setUsername: username => set({ username }),

      removeRoomId: () => {
        set({ roomId: null });
      },

      validateToken: async () => {
        const token = get().token;
        if (!token) {
          return false;
        }
        try {
          set({ isLoading: true });
          const response = await axios.get(`${BASE_URL}/auth/validate`, {
            headers: {
              Authorization: `Bearer ${get().token}`,
            },
          });

          set({ isLoading: false });
          return response.status === 200;
        } catch (error) {
          set({ isLoading: false });
          if (
            error.response?.status === 401 ||
            error.response?.status === 403
          ) {
            get().logout();
          }
          return false;
        }
      },

      isAuthenticated: async () => {
        const token = get().token;
        if (!token) {
          return false;
        }
        return await get().validateToken();
      },
    }),

    {
      name: 'authStore',
    }
  )
);
