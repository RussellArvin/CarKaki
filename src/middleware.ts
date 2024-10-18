import { authMiddleware } from "@clerk/nextjs";
import APP_ROUTES from "./lib/constants/APP_ROUTES";
 
export default authMiddleware(({
      publicRoutes:[
            APP_ROUTES.LANDING
      ]
}));
 
export const config = {
      matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};