import React, { useEffect, useImperativeHandle, forwardRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import useUserStore from "~/components/global/user-store"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form"
import { Input } from "~/components/ui/input"
import { api } from "~/utils/api"
import { toast } from "react-hot-toast"
import { TRPCClientError } from "@trpc/client"

const formSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
})

export type FormData = z.infer<typeof formSchema>

export type NameFormRef = {
  submit: () => Promise<void>;
  getValues: () => FormData;
  reset: () => void;
}

const NameForm = forwardRef<NameFormRef>((_, ref) => {
  const { user, setUser } = useUserStore();
  const { mutateAsync: updateNamesMutationAsync } = api.user.updateNames.useMutation();
  const userContext = api.useUtils().user;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
    },
  });

  const onSubmit = async (data: FormData) => {
    await toast.promise(updateNamesMutationAsync({...data}), {
      success: () => {
        userContext.invalidate();
        return "Names updated successfully"
      },
      loading: "Updating names...",
      error: (error) => {
        if (error instanceof TRPCClientError) {
          return error.message;
        }
        return "Failed to update user names";
      }
    });
  };

  useImperativeHandle(ref, () => ({
    submit: () => form.handleSubmit(onSubmit)(),
    getValues: () => form.getValues(),
    reset: () => form.reset(),
  }));

  useEffect(() => {
    if (user) {
      form.reset({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
      });
    }
  }, [user, form]);

  return (
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
  );
});

NameForm.displayName = 'NameForm';

export default NameForm;