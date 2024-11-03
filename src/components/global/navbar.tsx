import { useRouter } from "next/router";
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    navigationMenuTriggerStyle,
} from "~/components/ui/navigation-menu"
import { Sheet, SheetContent, SheetTrigger } from "~/components/ui/sheet"
import { Button } from "../ui/button";
import { Menu } from "lucide-react"
import APP_ROUTES from "~/lib/constants/APP_ROUTES";
import useUserStore from "./user-store";
import { UserButton } from "@clerk/nextjs";
import { useState } from "react";
import { Url } from "next/dist/shared/lib/router/router";

const Navbar = () => {
  const router = useRouter();
  const { user } = useUserStore();
  const [isOpen, setIsOpen] = useState(false);

  const navigationItems = [
    { name: "Home", route: APP_ROUTES.HOME() },
    { name: "Settings", route: APP_ROUTES.SETTINGS.MAIN },
    { name: "Profile", route: APP_ROUTES.PROFILE.MAIN },
  ];

  const handleNavigation = (route: Url) => {
    router.push(route);
    setIsOpen(false);
  };

  const ParkingNotification = () => {
    const currentParking = user?.currentParking;
    const isNotificationsEnabled = user?.isNotificationsEnabled;
    const canDisplayNotification = currentParking !== null && 
                                 currentParking !== undefined && 
                                 isNotificationsEnabled && 
                                 isNotificationsEnabled !== undefined;

    if (!canDisplayNotification) return null;

    return (
      <Button 
        variant="secondary"
        className="bg-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary-foreground))]/90 text-[hsl(var(--primary))] max-w-[150px] sm:max-w-[200px] md:max-w-none md:min-w-[20rem] text-sm md:text-base"
        onClick={() => router.push(APP_ROUTES.CARPARK(currentParking.carParkId))}
      >
        <span className="mr-2">🚘</span>
        <span className="truncate">Ongoing parking at: {currentParking.name}</span>
      </Button>
    );
  };

  return (
    <div className="border-b bg-blue-600">
      <div className="flex h-16 items-center px-4 justify-between">
        <div className="flex items-center">
          <h1 className="text-[#FFFFFF] text-2xl md:text-3xl font-bold mr-6">CarKaki</h1>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:block">
            <NavigationMenu>
              <NavigationMenuList>
                {navigationItems.map((item) => (
                  <NavigationMenuItem key={item.name}>
                    <NavigationMenuLink 
                      onClick={() => handleNavigation(item.route)}
                      className={navigationMenuTriggerStyle()}
                    >
                      {item.name}
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <ParkingNotification />
          
          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <nav className="flex flex-col gap-4">
                  {navigationItems.map((item) => (
                    <Button
                      key={item.name}
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => handleNavigation(item.route)}
                    >
                      {item.name}
                    </Button>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
          <UserButton afterSignOutUrl={APP_ROUTES.LANDING} />
        </div>
      </div>
    </div>
  );
};

export default Navbar;