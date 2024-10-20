import { useRouter } from "next/router"
import * as React from "react"
import Navbar from "~/components/global/navbar"
import useUserStore from "~/components/global/user-store"

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
import { Label } from "~/components/ui/label"
import APP_ROUTES from "~/lib/constants/APP_ROUTES"

export default function PasswordSettings(){
    return (
        <>
        <Navbar />
        <PasswordContent />ß
        </>
    )
}

const PasswordContent = () => {
    const router = useRouter();
    return (
        <div className="flex items-center justify-center min-h-screen">
            <Card className="w-[500px]">
                <CardHeader>
                <CardTitle>Update Password</CardTitle>
                <CardDescription>Password must be at least 8 characters long.</CardDescription>
                </CardHeader>
                <CardContent>
                <form>
                    <div className="grid w-full items-center gap-4">
                    <div className="flex flex-col space-y-1.5">
                        <Label htmlFor="password">New password</Label>
                        <Input id="password" placeholder="Enter" />
                    </div>
                    <div className="flex flex-col space-y-1.5">
                        <Label htmlFor="repeat-password">New Password:</Label>
                        <Input id="repeat-password" placeholder="Minimum 8 characters" />
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