import { create } from "zustand";

export const useAuthStore = create((set) => ({
  user: null, // { id, email, fullName, role }
  token: null, // JWT
  setAuth: (user, token) => set({ user, token }),
  clearAuth: () => set({ user: null, token: null }),
}));
