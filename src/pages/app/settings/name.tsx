import { useRouter } from "next/router"
import { useRef } from "react"
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
import NameForm, { NameFormRef } from "~/components/global/name-form"
import APP_ROUTES from "~/lib/constants/APP_ROUTES"

export default function NameSettings() {
  const router = useRouter();
  const formRef = useRef<NameFormRef>(null);

  const handleSubmit = async () => {
    await formRef.current?.submit();
  };

  return (
    <>
      <Navbar />
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle>Name</CardTitle>
            <CardDescription>Update your name</CardDescription>
          </CardHeader>
          <CardContent>
            <NameForm ref={formRef} />
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              variant="outline"
              onClick={() => router.push(APP_ROUTES.SETTINGS.MAIN)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
            >
              Confirm
            </Button>
          </CardFooter>
        </Card>
      </div>
    </>
  )
}