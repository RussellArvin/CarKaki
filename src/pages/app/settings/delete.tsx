import { useClerk } from "@clerk/nextjs"
import { TRPCClientError } from "@trpc/client"
import { useRouter } from "next/router"
import * as React from "react"
import toast from "react-hot-toast"
import Navbar from "~/components/global/navbar"

import { Button } from "~/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import APP_ROUTES from "~/lib/constants/APP_ROUTES"
import { api } from "~/utils/api"

export default function DeleteUserSettingsPage(){
    return (
        <>
        <Navbar />
        <DeleteUserContent />
        </>
    )
}

const DeleteUserContent = () => {
    const { signOut } = useClerk();

    const {
        mutateAsync: deleteUserMutationAsync
    } = api.user.delete.useMutation();

    const handleDelete = async () => {
        await toast.promise(
            deleteUserMutationAsync(), 
            {
              loading: 'Deleting User...',
              success: () => {
                void signOut();
                return 'User Successfully deleted!'
              },
              error: (error) => {
                if (error instanceof TRPCClientError) {
                    return error.message;
                }
                return "Failed to delete user";
            }
            }
          );
    }

    const router = useRouter();
    return (
        <div className="flex items-center justify-center min-h-screen">
            <Card className="w-[500px]">
                <CardHeader>
                <CardTitle>Delete Account</CardTitle>
                </CardHeader>
                <CardContent>
                    <p
                        className="text-red-600"
                    >
                        This action will be permanent.<br/> All user data including saved car parks and account details will be removed upon deletion.
                    </p>
                </CardContent>
                <CardFooter className="flex justify-between">
                <Button 
                    variant="outline"
                    onClick={() => router.push(APP_ROUTES.SETTINGS.MAIN)}
                >
                    Cancel
                </Button>
                <Button
                    onClick={handleDelete}
                    variant="destructive"
                >
                    Confirm
                </Button>
                </CardFooter>
            </Card>
            </div>
    )
}