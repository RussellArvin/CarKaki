import { type AppType } from "next/app";
import { ClerkProvider } from "@clerk/nextjs";
import { useEffect } from "react";

import { api } from "~/utils/api";
import { GeistSans } from "geist/font/sans";

import "~/styles/globals.css";
import useUserStore from "~/components/global/user-store";
import { useSeedNewUser } from "~/hooks/use-seed-new-user";

const MyApp: AppType = ({ Component, pageProps }) => {
  const { setUser, setIsUserLoading } = useUserStore();
  const { data: userData, isLoading: userDataIsLoading } = api.user.get.useQuery();

  //useSeedNewUser({ data: userData, isLoading: userDataIsLoading });

  useEffect(() => {
    if (userData && !userDataIsLoading) {
      setUser(userData);
    }
    setIsUserLoading(userDataIsLoading)
  }, [userData, userDataIsLoading]); // setUser removed from dependencies

  return (
    <ClerkProvider>
       <Component {...pageProps} />
    </ClerkProvider>
  );
};

export default api.withTRPC(MyApp);