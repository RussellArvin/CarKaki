import { useRouter } from "next/router"
import {useEffect} from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
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

// Define the schema for our form
const formSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
})

// Infer the type from our schema
type FormData = z.infer<typeof formSchema>

export default function NameSettings() {
  const router = useRouter();
  const { user, setUser } = useUserStore();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: user?.firstName,
      lastName: user?.lastName,
    },
  });

  const {
    mutateAsync: updateNamesMutationAsync
  } = api.user.updateNames.useMutation()

  const onSubmit = (data: FormData) => {
    toast.promise(updateNamesMutationAsync({...data}),{
      success:"Names updated successfully",
      loading:"Updating names...",
      error:(err:Error) => err.message
    })
    
  };

  useEffect(() => {
    if (user) {
      form.reset({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
      });
    }
  }, [user, form]);

  return (
    <>
      <Navbar />
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-[500px]">
          <CardHeader>
            <CardTitle>Name</CardTitle>
            <CardDescription>Update your name</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage /> 
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
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
            <Button
              onClick={form.handleSubmit(onSubmit)}
            >
              Confirm
            </Button>
          </CardFooter>
        </Card>
      </div>
    </>
  )
}