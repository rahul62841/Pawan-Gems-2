import create from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface User {
  id?: number;
  name: string;
  email: string;
}

interface UserState {
  user: User | null;
  setUser: (user: User) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user: User) => set({ user }),
      logout: () => set({ user: null }),
    }),
    {
      name: "pawan_gems_user",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useUserStore;
