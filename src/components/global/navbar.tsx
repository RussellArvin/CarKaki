import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    navigationMenuTriggerStyle,
  } from "~/components/ui/navigation-menu"


const Navbar = () => {
    return (
      <div className="border-b bg-blue">
        <div className="flex h-16 items-center px-4">
          <h1 className="text-[#FFFFFF] text-3xl font-bold mr-6">CarKaki</h1>
          <NavigationMenu>
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
                  Settings
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink className={navigationMenuTriggerStyle()}>
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