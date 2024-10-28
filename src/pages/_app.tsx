import { type AppType } from "next/app";
import { ClerkProvider } from "@clerk/nextjs";
import { useEffect } from "react";
import { Toaster } from 'react-hot-toast';

import { api } from "~/utils/api";
import { ThemeProvider } from "~/components/global/theme-provider"

import "~/styles/globals.css";
import useUserStore from "~/components/global/user-store";
import { useSeedNewUser } from "~/hooks/use-seed-new-user";

// Remove the AppContent component and keep everything in MyApp
const MyApp: AppType = ({ Component, pageProps }) => {
  const { setUser, setIsUserLoading } = useUserStore();
  const { data: userData, isLoading: userDataIsLoading } = api.user.get.useQuery();

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
          <Toaster
            toastOptions={{
              style: {
                background: 'hsl(var(--background))',
                color: 'hsl(var(--foreground))',
                border: '1px solid hsl(var(--border))'
              } 
            }}
          /> 
      </ThemeProvider>
    </ClerkProvider>
  );
};

export default api.withTRPC(MyApp);