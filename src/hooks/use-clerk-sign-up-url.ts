import { useClerk } from "@clerk/nextjs";
import APP_ROUTES from "~/lib/constants/APP_ROUTES";

export function useClerkSignUpUrl() {
    const clerk = useClerk();
    return clerk.buildSignUpUrl({
        afterSignUpUrl: APP_ROUTES.HOME(),
        afterSignInUrl: APP_ROUTES.HOME()
    });
}