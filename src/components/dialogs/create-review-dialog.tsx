import { Button } from "~/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog"
import z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Input } from "~/components/ui/input"
import { Label } from "~/components/ui/label"
import { Textarea } from "../ui/textarea"
import { Form, FormField, FormItem, FormMessage } from "../ui/form"
import toast from "react-hot-toast"
import { api } from "~/utils/api"

const formSchema = z.object({
  rating: z.number().min(1).max(5),
  description: z.string().min(1)
})

type FormValues = z.infer<typeof formSchema>

interface CreateReviewDialogProps {
    carParkId: string
}

export function CreateReviewDialog(props: CreateReviewDialogProps) {
    const { carParkId } = props;

    const {
        mutateAsync: createReviewMutationAsync
    } = api.carPark.review.useMutation();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      rating: undefined,
      description: ""
    }
  })

  const onSubmit = async (values: FormValues) => {
    const{ rating,description } = values

    await toast.promise(createReviewMutationAsync({
        description,
        rating,
        id: carParkId
    }),{
        loading: "Creating review....",
        success: "Review created successfully!",
        error: (e:Error) => e.message
    })
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Add</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Review</DialogTitle>
          <DialogDescription>
            Write a review for the carpark here
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 py-4">
              <FormField
                control={form.control}
                name="rating"
                render={({ field: { onChange, ...field } }) => (
                  <FormItem>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="rating" className="text-right">
                        Rating
                      </Label>
                      <div className="col-span-3">
                        <Input
                          type="number"
                          onChange={(e) => onChange(Number(e.target.value))}
                          {...field}
                          className="col-span-3"
                        />
                        <FormMessage />
                      </div>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="description" className="text-right">
                        Description
                      </Label>
                      <div className="col-span-3">
                        <Textarea
                          placeholder="Enter your description here"
                          {...field}
                          className="col-span-3"
                        />
                        <FormMessage />
                      </div>
                    </div>
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}