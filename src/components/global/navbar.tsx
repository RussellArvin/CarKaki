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
        {user?.currentParking && (
          <Button 
            variant="secondary"
            className="bg-black/80 text-white hover:bg-black/70 min-w-[20rem]"
            onClick={() => router.push(APP_ROUTES.CARPARK(user?.currentParking?.id!))}
          >
            <span className="mr-2">🚘</span>
            Ongoing parking at: {user?.currentParking?.name}
          </Button>
        )}
      </div>
    </div>
  );
};

export default Navbar;