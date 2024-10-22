import { type AppType } from "next/app";
import { ClerkProvider } from "@clerk/nextjs";
import { useEffect } from "react";
import { Toaster } from 'react-hot-toast';
import type { AppProps } from "next/app";

import { api } from "~/utils/api";
import { GeistSans } from "geist/font/sans";
import { ThemeProvider } from "~/components/global/theme-provider"

import "~/styles/globals.css";
import useUserStore from "~/components/global/user-store";
import { useSeedNewUser } from "~/hooks/use-seed-new-user";

// Remove the AppContent component and keep everything in MyApp
const MyApp: AppType = ({ Component, pageProps }) => {
  const { setUser, setIsUserLoading } = useUserStore();
  const { data: userData, isLoading: userDataIsLoading } = api.user.get.useQuery();

  useSeedNewUser({ data: userData, isLoading: userDataIsLoading });

  useEffect(() => {
    if (userData && !userDataIsLoading) {
      setUser(userData);
    }
    setIsUserLoading(userDataIsLoading)
  }, [userData, userDataIsLoading, setIsUserLoading, setUser]);

  return (
    <ClerkProvider {...pageProps}>
      <ThemeProvider 
        attribute="class"
        defaultTheme={userData?.isDarkMode ? "dark" : "light"}
        enableSystem={false}
        storageKey="theme"
        disableTransitionOnChange
      >
          <Component {...pageProps} />
          <Toaster />
      </ThemeProvider>
    </ClerkProvider>
  );
};

export default api.withTRPC(MyApp);