import { authMiddleware } from "@clerk/nextjs";
import APP_ROUTES from "./lib/constants/APP_ROUTES";
 
export default authMiddleware(({
      publicRoutes:[
            APP_ROUTES.LANDING,
            APP_ROUTES.CLERK_WEBHOOK
      ]
}));
 
export const config = {
      matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};