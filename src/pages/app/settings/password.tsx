import { useRouter } from "next/router"
import * as React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import Navbar from "~/components/global/navbar"

import { Button } from "~/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form"
import { Input } from "~/components/ui/input"
import APP_ROUTES from "~/lib/constants/APP_ROUTES"
import { toast } from "react-hot-toast"
import { api } from "~/utils/api"
import { TRPCClientError } from "@trpc/client"

const passwordSchema = z.object({
  newPassword: z.string().min(8, "Password must be at least 8 characters long"),
  confirmPassword: z.string().min(8, "Password must be at least 8 characters long"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type PasswordFormData = z.infer<typeof passwordSchema>

export default function PasswordSettings() {
  return (
    <>
      <Navbar />
      <PasswordContent />
    </>
  )
}

const PasswordContent = () => {
  const router = useRouter();

  const form = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const {
    mutateAsync: updatePasswordMutationAsync
  } = api.user.updatePassword.useMutation()

  const onSubmit = async (data: PasswordFormData) => {
    await toast.promise(
      updatePasswordMutationAsync({ password: data.newPassword }),
      {
        loading: "Updating password...",
        success: "Password updated successfully",
        error: (error) => {
          if (error instanceof TRPCClientError) {
              return error.message;
          }
          return "Failed to update passwords";
      }
      }
    );
    await router.push(APP_ROUTES.SETTINGS.MAIN);
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="w-[500px]">
        <CardHeader>
          <CardTitle>Update Password</CardTitle>
          <CardDescription>Password must be at least 8 characters long.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Enter new password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Confirm new password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline"
            onClick={() => router.push(APP_ROUTES.SETTINGS.MAIN)}
          >
            Cancel
          </Button>
          <Button onClick={form.handleSubmit(onSubmit)}>
            Confirm
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}