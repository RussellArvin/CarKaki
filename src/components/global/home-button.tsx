import { useRouter } from "next/router"
import { Button } from "../ui/button";
import { House } from "lucide-react";
import APP_ROUTES from "~/lib/constants/APP_ROUTES";

export const HomeButton = () => {
    const router = useRouter();

    return (
        <Button 
            className="w-full"
            onClick={()=>router.push(APP_ROUTES.HOME())}
        >
            <House className="mr-2 h-4 w-4" /> Back to Home
          </Button>
    )
}