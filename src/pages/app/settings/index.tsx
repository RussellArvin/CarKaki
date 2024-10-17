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
import React from 'react';
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Label } from "~/components/ui/label";
import Navbar from "~/components/global/navbar"

const notifications = [
  {
    title: "Update name",
    description: "Fill in name.",
    navigation: "/settings/name",
  },
  {
    title: "Update password",
    description: "Change password",
    navigation: "/settings/password"
  },
  {
    title: "Delete account",
    description: "All user data will be removed upon deletion.",
    navigation: "/settings/delete"
  },
]


export default function MainSettings() {
  const {
    isLoading: isMainSettingsLoading,
    data: mainSettings
  } = api.user.getMainSettings.useQuery();


  return (
    <div>
      <Navbar/>
      <div className={`flex items-center justify-center min-h-screen`}>
        {isMainSettingsLoading ? (
          <Skeleton className="h-[500px] w-[500px] rounded-xl" />
        ) : mainSettings ? (
        <MainSettingsContent
            settings={mainSettings}
          />
        ) : (
          <div>No settings available</div> // Optional: handle the undefined case
        )}
      </div>
    </div>
  );
  
  
}

interface MainSettingsContentProps {
  settings: NonNullable<RouterOutputs["user"]["getMainSettings"]>
}

const MainSettingsContent = (props: MainSettingsContentProps) => {
  const router = useRouter();

  const { settings } = props;
  const {
    mutateAsync: updateMainSettingsMutation
  } = api.user.updateMainSettings.useMutation()

  const onSettingsChange = (isDarkMode: boolean, state: boolean) => {

  }

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
              checked={settings?.isNotificationsEnabled}
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
              checked={settings?.isDarkMode}
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
                <span className="flex h-2 w-2 translate-y-1 rounded-full bg-sky-500" />
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