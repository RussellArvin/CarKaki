import { useRouter } from "next/router"
import * as React from "react"

import { Button } from "~/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import { Input } from "~/components/ui/input"
import APP_ROUTES from "~/lib/constants/APP_ROUTES"

export default function NameSettings() {
  const router = useRouter();

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-[500px]">
        <CardHeader>
          <CardTitle>Name</CardTitle>
          <CardDescription>Update your name</CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <div className="grid w-full items-center gap-4">
                <h1>Enter your name</h1>
              <div className="flex flex-col space-y-1.5">
                <Input id="firstName" placeholder="First Name" />
              </div>
              <div className="flex flex-col space-y-1.5">
              <Input id="lastName" placeholder="Last Name" />
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline"
            onClick={() => router.push(APP_ROUTES.SETTINGS.MAIN)}
          >
            Cancel
          </Button>
          <Button>
            Confirm
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}