import { BellRing, Check, Moon } from "lucide-react"

import { cn } from "~/lib/utils"
import { Button } from "~/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import { Switch } from "~/components/ui/switch"
import { Router, useRouter } from "next/router"
import { api, RouterOutputs } from "~/utils/api"
import { Skeleton } from "~/components/ui/skeleton"
import React, { useEffect, useState } from 'react';
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Label } from "~/components/ui/label";
import Navbar from "~/components/global/navbar"
import APP_ROUTES from "~/lib/constants/APP_ROUTES"
import useUserStore from "~/components/global/user-store"
import toast from "react-hot-toast"
import { useTheme } from "next-themes"

const notifications = [
  {
    title: "Update name",
    description: "Fill in name.",
    navigation: APP_ROUTES.SETTINGS.NAME
  },
  {
    title: "Update password",
    description: "Change password",
    navigation: APP_ROUTES.SETTINGS.PASSWORD
  },
  {
    title: "Delete account",
    description: "All user data will be removed upon deletion.",
    navigation: APP_ROUTES.SETTINGS.DELETE
  },
]


export default function MainSettings() {
  const { user, isUserLoading } = useUserStore();

  return (
    <div>
      <Navbar/>
      <div className={`flex items-center justify-center min-h-screen`}>
        {isUserLoading ? (
          <Skeleton className="h-[500px] w-[500px] rounded-xl" />
        ) : user ? (
        <MainSettingsContent
            isNotificationsEnabled={user.isNotificationsEnabled}
            isDarkMode={user.isDarkMode}
          />
        ) : (
          <div>No settings available</div> // Optional: handle the undefined case
        )}
      </div>
    </div>
  );
  
  
}

interface MainSettingsContentProps {
  isNotificationsEnabled: boolean
  isDarkMode: boolean
}

const MainSettingsContent = (props: MainSettingsContentProps) => {
  const router = useRouter();
  const { setTheme } = useTheme()
  const { setIsNotificationsEnabled, setIsDarkMode } = useUserStore()

  const [isNotificationsChecked, setIsNotificationsChecked] = useState<boolean>(props.isNotificationsEnabled);
  const [isDarkModeChecked, setIsDarkModeChecked] = useState<boolean>(props.isDarkMode);

  const {
    mutateAsync: updateMainSettingsMutation
  } = api.user.updateMainSettings.useMutation()

  useEffect(() => {
    setIsNotificationsChecked(props.isNotificationsEnabled);
    setIsDarkModeChecked(props.isDarkMode);
  }, [props.isNotificationsEnabled, props.isDarkMode]);

  const onSettingsChange =  (newNotifications: boolean, newDarkMode: boolean) => {
    try {
      void toast.promise(
        updateMainSettingsMutation({
          isNotificationsEnabled: newNotifications,
          isDarkMode: newDarkMode
        }),
        {
          loading: "Updating settings...",
          success: "Settings Updated!",
          error: (err: Error) => `Error: ${err.message}`
        }
      );
      setIsNotificationsChecked(newNotifications);
      setIsDarkModeChecked(newDarkMode);
      newDarkMode ? setTheme("dark") : setTheme("light")
    } catch (error) {
      console.error("Failed to update settings:", error);
    }
  };

  const onNotificationsChange = () => {
    setIsNotificationsEnabled(!isNotificationsChecked);
    onSettingsChange(!isNotificationsChecked, isDarkModeChecked);
  };

  const onDarkModeChange = () => {
    setIsDarkMode(!isDarkModeChecked)
    onSettingsChange(isNotificationsChecked, !isDarkModeChecked);
  };

  return (
      <Card className={cn("w-[500px]")}>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className=" flex items-center space-x-4 rounded-md border p-4">
            <BellRing />
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium leading-none">
                Turn on notifications
              </p>
              <p className="text-sm text-muted-foreground">
                Send notifications to device.
              </p>
            </div>
            <Switch 
              checked={isNotificationsChecked}
              onCheckedChange={onNotificationsChange}
            />
          </div>
          <div className=" flex items-center space-x-4 rounded-md border p-4">
            <Moon />
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium leading-none">
                Dark mode
              </p>
              <p className="text-sm text-muted-foreground">
                Change appearance
              </p>
            </div>
            <Switch 
              checked={isDarkModeChecked}
              onCheckedChange={onDarkModeChange}
            />
          </div>
          <div>
            {notifications.map((notification, index) => (
              //TODO: CURSOR
              <div
                onClick={() => router.push(notification.navigation)}
                key={index}
                className="mb-4 grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0"
              >
                <span className="flex h-2 w-2 translate-y-1 rounded-full bg-blue-600" />
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {notification.title}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {notification.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full">
            <Check className="mr-2 h-4 w-4" /> Mark all as read
          </Button>
        </CardFooter>
      </Card>
  )
}