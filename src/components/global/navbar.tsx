import { useRouter } from "next/router";
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    navigationMenuTriggerStyle,
} from "~/components/ui/navigation-menu"
import APP_ROUTES from "~/lib/constants/APP_ROUTES";
import { Button } from "../ui/button";
import useUserStore from "./user-store";

const Navbar = () => {
  const router = useRouter();
  const { user } = useUserStore();
  return (
    <div className="border-b bg-blue-600">
      <div className="flex h-16 items-center px-4 justify-between"> {/* Added justify-between */}
        <div className="flex items-center"> {/* Wrapped logo and nav in a div */}
          <h1 className="text-[#FFFFFF] text-3xl font-bold mr-6">CarKaki</h1>
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink 
                  onClick={()=>router.push(APP_ROUTES.HOME)}
                  className={navigationMenuTriggerStyle()}
                >
                  Home
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink 
                  onClick={()=>router.push(APP_ROUTES.SETTINGS.MAIN)}
                  className={navigationMenuTriggerStyle()}
                >
                  Settings
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink 
                  className={navigationMenuTriggerStyle()}
                  onClick={() => router.push(APP_ROUTES.PROFILE.MAIN)}
                >
                  Profile
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Parking notification */}
        {(() => {
          const currentParking = user?.currentParking;
          const isNotificationsEnabled = user?.isNotificationsEnabled;

          const canDisplayNotification = currentParking !== null && currentParking !== undefined && isNotificationsEnabled && isNotificationsEnabled !== undefined

          return canDisplayNotification && (
            <Button 
                variant="secondary"
                className="bg-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary-foreground))]/90 text-[hsl(var(--primary))] min-w-[20rem]"
                onClick={() => router.push(APP_ROUTES.CARPARK(currentParking.carParkId))}
              >
              <span className="mr-2">🚘</span>
              Ongoing parking at: {currentParking.name}
            </Button>
          );
        })()}
      </div>
    </div>
  );
};

export default Navbar;