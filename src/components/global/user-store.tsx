import { create } from 'zustand';
import { RouterOutputs } from '~/utils/api';

type UserDetails = RouterOutputs["user"]["get"]

interface UserStore {
    user: UserDetails | null;
    isUserLoading: boolean;
    setUser: (user: UserDetails | null) => void;
    setIsUserLoading: (isUserLoading: boolean) => void;
}

export const useUserStore = create<UserStore>((set, get) => ({
    user: null,
    isUserLoading: false,
    setUser: (user) => set({ user }),
    setIsUserLoading: (isUserLoading: boolean) => set({isUserLoading})
}));

export default useUserStore;