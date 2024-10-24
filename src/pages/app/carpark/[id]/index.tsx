import { Button } from "~/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card"
import { NearbyCarparks } from "../../../../components/global/nearby-carparks"
import Navbar from "~/components/global/navbar"
import { api, RouterOutputs } from "~/utils/api"
import { useRouter } from "next/router"
import { Skeleton } from "~/components/ui/skeleton"
import { Input } from "~/components/ui/input"
import { useState } from "react"
import { toast } from "react-hot-toast"
import MapEmbed from "~/components/global/map-embed"
import Rating from "~/components/global/rating"
import { CreateReviewDialog } from "~/components/dialogs/create-review-dialog"
import { Car, Clock, DollarSign, Navigation } from "lucide-react"
import { ParkingControls } from "~/components/global/parking-controls"
import { FavouriteButton } from "~/components/global/favourite-button"
import { TRPCClientError } from '@trpc/client';
import APP_ROUTES from "~/lib/constants/APP_ROUTES"
import Location from "~/server/api/types/location"

type CarParkReview =  RouterOutputs["carPark"]["getFullDetails"]["reviews"][number]

export default function CarParkPage() {
  return (
    <>
      <Navbar />
      <CarParkMainContent />
    </>
  )
}

const CarParkMainContent = () => {
  const router = useRouter();
  const {
    isLoading: isCarParkLoading,
    data: carParkData
  } = api.carPark.getFullDetails.useQuery(
    { id: router.query.id as string },
    {
      enabled: !!router.query.id, // Only run the query if `id` exists
    }
  );

  const isLoading = isCarParkLoading || carParkData === undefined;

  return (
    <div className="flex flex-col lg:flex-row gap-4 p-4">
      <div className="w-full lg:w-1/2 flex flex-col gap-4">
        <div className="flex-1">
          {isLoading ? (
            <Skeleton className="w-full h-[300px] rounded" />
          ) : (
            <CarParkDetails
              id={carParkData?.id}
              name={carParkData?.name}
              isFavourited={carParkData?.isFavourited}
              address={carParkData?.address}
              location={carParkData?.location}
              availableSpace={carParkData?.availableLots}
            />
          )}
        </div>
        <div className="flex-1">
          {isLoading ? (
            <Skeleton className="w-full h-[300px] rounded" />
          ) : (
            <NearbyCarparks
              nearByCarParks={carParkData?.nearByCarParks}
            />
          )}
        </div>
      </div>
      <div className="w-full lg:w-1/2 flex flex-col gap-4">
        <div className="flex-1">
          {isLoading ? (
            <Skeleton className="w-full h-[400px] rounded" />
          ) : (
            carParkData?.address ? (
              <MapEmbed
                address={carParkData.address}
              />
            ) : (
              <p>No address available</p>
            )
          )}
        </div>
        <div className="flex-1">
          {isLoading ? (
            <Skeleton className="w-full h-[300px] rounded" />
          ) : (
            <CarParkReviews 
              carParkId={carParkData.id}
              reviews={carParkData.reviews}
            />
          )}
        </div>
      </div>
    </div>
  )
}

interface CarParkDetailsProps {
  id: string
  isFavourited: boolean
  location: Location
  name: string | undefined
  address: string | null | undefined
  availableSpace: number | undefined
}

const CarParkDetails = (props: CarParkDetailsProps) => {
  const { id, name, address, availableSpace, isFavourited, location } = props;
  const router = useRouter();
  const [rate, setRate] = useState<number | null>(null);

  const { mutate: getAppropriateRate } = api.carPark.getRate.useMutation();
  const { 
    mutateAsync: setHomeCarParkMutationAsync
   } = api.user.setHomeCarPark.useMutation();
  
   const { 
    mutateAsync: setWorkCarParkMutationAsync
   } = api.user.setWorkCarPark.useMutation()

  

   const handleWorkCarPark = () => {
       return toast.promise(
           setWorkCarParkMutationAsync({id}), 
           {
               loading: "Please hold...",
               success: "Successfully updated!",
               error: (error) => {
                   if (error instanceof TRPCClientError) {
                       return error.message;
                   }
                   return "Failed to update work carpark";
               }
           }
       );
   }


  const handleHomeCarPark = async () => {
    await toast.promise(setHomeCarParkMutationAsync({id}) ,{
      loading: "Please hold...",
      success:"Successfully updated!",
      error: (error) => {
        if (error instanceof TRPCClientError) {
            return error.message;
        }
        return "Failed to update home carpark";
    }
    })
  } 

  const handleRateChange = (hours: string) => {
    if(hours === "0" || hours === "") return setRate(null)
    getAppropriateRate(
      {
        id: router.query.id as string,
        hours: parseInt(hours)
      },
      {
        onSuccess: (rate) => {
          setRate(rate);
        }
      }
    );
  };

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{name ?? <Skeleton className="h-6 w-32 rounded" />}</CardTitle>
          <FavouriteButton carParkId={id} isFavourited={isFavourited} />
        </div>
        <CardDescription>{address ?? <Skeleton className="h-4 w-48 rounded" />}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Available Spaces Section */}
        <div className="flex items-center gap-2">
          <Car className="h-5 w-5 text-slate-600" />
          <div className="font-medium">
            Available spaces: {' '}
            <span className="text-green-600">
              {availableSpace ?? <Skeleton className="h-4 w-16 rounded inline-block" />}
            </span>
          </div>
        </div>

        {/* Hours Input and Rate Display Section */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
              <Clock className="h-4 w-4" />
              Parking Duration
            </div>
            <Input
              className="max-w-[200px]"
              id="hours"
              type="number"
              min="1"
              placeholder="Number of hours"
              onChange={e => handleRateChange(e.currentTarget.value)}
            />
          </div>

          {/* Rate Display */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
              <DollarSign className="h-4 w-4" />
              Estimated Cost
            </div>
            <div className="h-10 flex items-center">
              {rate !== null ? (
                <span className="text-lg font-semibold">${rate}</span>
              ) : (
                <span className="text-slate-500">Enter hours to see rate</span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
        <ParkingControls carParkId={id} />
        <Button
          variant="outline"
          onClick={() => router.push(APP_ROUTES.HOME(location,true))}
        >
          <Navigation className="h-4 w-4 mr-2" />
          Navigate Here
        </Button>
        <div className="flex gap-2 w-full sm:w-auto sm:ml-auto">
          <Button onClick={handleHomeCarPark} variant="outline" className="flex-1 sm:flex-none">
            Save as Home
          </Button>
          <Button onClick={handleWorkCarPark} variant="outline" className="flex-1 sm:flex-none">
            Save as Work
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

interface CarParkReviewProps {
  carParkId: string
  reviews:  CarParkReview[]
}

const CarParkReviews = (props: CarParkReviewProps) => {
  const { carParkId,reviews } = props;

  return (
    <Card>
      <CardHeader className="flex flex-row justify-between items-start">
        <div>
          <CardTitle>Reviews</CardTitle>
          <CardDescription>Reviews for this particular carpark</CardDescription>
        </div>
        <CreateReviewDialog 
          carParkId={carParkId}
        />
      </CardHeader>
      <CardContent>
        {reviews.map((review,key)=> (
          <CarParkReviewItem key={key} review={review} />
        ))}
      </CardContent>
    </Card>
  )
}

interface CarParkReviewItemProps {
  review: CarParkReview
}

const CarParkReviewItem = (props: CarParkReviewItemProps) => {
  const { userFirstName, userLastName, rating, description } = props.review;

  return (
    <Card className="mt-3">
      <CardHeader>
        <CardTitle>{userFirstName} {userLastName}</CardTitle>
        <Rating
          rating={rating}
        />
      </CardHeader>
      <CardContent>
        {description}
      </CardContent>
    </Card>
  )
}