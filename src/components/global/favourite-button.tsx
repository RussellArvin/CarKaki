import { Heart } from "lucide-react"
import toast from "react-hot-toast"
import { api } from "~/utils/api"

interface FavouriteButtonProps {
    carParkId: string
    isFavourited: boolean
}

export const FavouriteButton = ({carParkId, isFavourited}: FavouriteButtonProps) => {
    const carParkContext = api.useUtils().carPark
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
                    return "Carpark has been updated successfully!"
                },
                error: (e:Error) => e.message
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