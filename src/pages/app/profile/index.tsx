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
import { Input } from "~/components/ui/input"

const notifications = [
  {
    title: "View favourite Carparks",
    description: "View your favourited carparks!",
    navigation: APP_ROUTES.PROFILE.FAVOURITE
  },
  {
    title: "View Parking History",
    description: "Your most recent parkings!",
    navigation: APP_ROUTES.PROFILE.HISTORY
  },
  {
    title: "Edit saved Carparks",
    description: "Find your home and work carpark here!",
    navigation: APP_ROUTES.PROFILE.SAVED
  },
  {
    title: "View Frequented Carparks",
    description: "Some of the carparks you often visit!",
    navigation: APP_ROUTES.PROFILE.FREQUENT_CARPARKS
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
  const {user,isUserLoading} = useUserStore()

  return (
      <Card className={cn("w-[500px]")}>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
            {isUserLoading ? (<Skeleton className="h-[250px]" />) : (
              <>
                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input type="text" id="firstName" disabled value={user?.firstName} />
              </div>
              <div className="grid w-full max-w-sm items-center gap-1.5">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input type="text" id="lastName" disabled value={user?.lastName}/>
              </div>
              <div className="grid w-full max-w-sm items-center gap-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input type="email" id="email" disabled value={user?.email} />
              </div>
              </>
            )}
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