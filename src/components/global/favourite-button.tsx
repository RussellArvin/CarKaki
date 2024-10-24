import { TRPCClientError } from "@trpc/client"
import { Heart } from "lucide-react"
import toast from "react-hot-toast"
import { api } from "~/utils/api"

interface FavouriteButtonProps {
    carParkId: string
    isFavourited: boolean
}

export const FavouriteButton = ({carParkId, isFavourited}: FavouriteButtonProps) => {
    const carParkContext = api.useUtils().carPark
    const userContext = api.useUtils().user;
    const {
        mutateAsync: setFavouriteMutationAsync
    } = api.carPark.setFavourite.useMutation()
    
    const handleChange = async () => {
        await toast.promise(
            setFavouriteMutationAsync({
                id: carParkId,
                isFavourited: !isFavourited
            }),
            {
                loading: "Please hold...",
                success: ()=>{
                    void carParkContext.invalidate()
                    void userContext.invalidate();
                    return "Carpark has been updated successfully!"
                },
                error: (error) => {
                    if (error instanceof TRPCClientError) {
                        return error.message;
                    }
                    return "Failed to favourite carpark";
                }
            }
        )
    }

    return (
        <Heart
            fill={isFavourited ? "red" : "none"}
            stroke={isFavourited ? "red" : "hsl(var(--primary))"}
            className="cursor-pointer hover:cursor-hand" 
            onClick={handleChange}
        />
    )
}