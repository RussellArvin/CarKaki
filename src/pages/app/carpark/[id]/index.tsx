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
              address={carParkData?.address}
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
  id: string | undefined
  name: string | undefined
  address: string | null | undefined
  availableSpace: number | undefined
}

const CarParkDetails = (props: CarParkDetailsProps) => {
  const {
    id,
    name,
    address,
    availableSpace,
  } = props;

  const router = useRouter()
  const [rate, setRate] = useState<number | null>(null)

  const {
    mutate: getAppropriateRate
  } = api.carPark.getRate.useMutation()

  const handleRateChange = (hours: string) => {
    getAppropriateRate({
      id: router.query.id as string,
      hours: parseInt(hours)
    },
    {
      onSuccess: (rate) => {
        setRate(rate)
      }
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{name ?? <Skeleton className="h-6 w-32 rounded" />}</CardTitle>
        <CardDescription>{address ?? <Skeleton className="h-4 w-48 rounded" />}</CardDescription>
      </CardHeader>
      <CardContent>
        <div>
          Available spaces: {availableSpace ?? <Skeleton className="h-4 w-16 rounded" />}
        </div>
        <div>
          Enter number of hours you are parking for
        </div>
        <Input
          className="w-[200px]"
          id="hours"
          type="number"
          placeholder="Number of hours"
          onChangeCapture={e => handleRateChange(e.currentTarget.value)}
        />

      </CardContent>
      <CardFooter className="flex justify-between">
        <Button>Save as Home</Button>
        <Button>Save as Work</Button>
      </CardFooter>
    </Card>
  )
}

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
        {reviews.map((review)=> (
          <CarParkReviewItem review={review} />
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