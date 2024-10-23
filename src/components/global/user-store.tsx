import { create } from 'zustand';
import { RouterOutputs } from '~/utils/api';

type UserDetails = RouterOutputs["user"]["get"]

interface UserStore {
    user: UserDetails | null;
    isUserLoading: boolean;
    setUser: (user: UserDetails | null) => void;
    setIsDarkMode:  (isDarkMode: boolean) => void;
    setIsNotificationsEnabled: (isNotificationsEnabled: boolean) => void;
    setIsUserLoading: (isUserLoading: boolean) => void;
}

export const useUserStore = create<UserStore>((set, get) => ({
    user: null,
    isUserLoading: false,
    setUser: (user) => set({ user }),
    setIsDarkMode: (isDarkMode) =>{
        const user = get().user;
        if(!user) return;

        return set({
            user: {
                ...user,
                isDarkMode
            }
        })
    },
    setIsNotificationsEnabled: (isNotificationsEnabled) => {
        const user = get().user;
        if(!user) return;

        return set({
            user: {
                ...user,
                isNotificationsEnabled
            }
        })
    },
    setIsUserLoading: (isUserLoading: boolean) => set({isUserLoading})
}));

export default useUserStore;