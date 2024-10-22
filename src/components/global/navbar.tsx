import { useRouter } from "next/router";
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    navigationMenuTriggerStyle,
  } from "~/components/ui/navigation-menu"
import APP_ROUTES from "~/lib/constants/APP_ROUTES";


const Navbar = () => {
  const router = useRouter();
    return (
      <div className="border-b bg-blue-600">
        <div className="flex h-16 items-center px-4">
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
      </div>
    );
  };

export default Navbar;