import { Button } from "~/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card"
import { NearbyCarparks } from "../../../../components/global/nearby-carparks"
import Navbar from "~/components/global/navbar"
import { api } from "~/utils/api"
import { useRouter } from "next/router"
import { Skeleton } from "~/components/ui/skeleton"
import { Input } from "~/components/ui/input"
import { useState } from "react"
import { toast } from "react-hot-toast"
import MapEmbed from "~/components/global/map-embed"


export default function CarParkPage(){
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
    
    return (
        <div className="flex flex-col lg:flex-row gap-4 p-4">
            {isCarParkLoading || carParkData === undefined ? (
                <Skeleton className="h-[500px] w-[500px] rounded-xl" />
            ) : (
                <>
                    <div className="w-full lg:w-1/2 flex flex-col gap-4">
                        <div className="flex-1">
                            <CarParkDetails 
                                id={carParkData.id}
                                name={carParkData.name}
                                address={carParkData.address}
                                availableSpace={carParkData.availableLots}
                            />
                        </div>
                        <div className="flex-1">
                            <NearbyCarparks 
                                nearByCarParks={carParkData.nearByCarParks}
                            />
                        </div>
                    </div>
                    <div className="w-full lg:w-1/2 flex flex-col gap-4">
                        <div className="flex-1">
                            {carParkData.address ? (
                                <MapEmbed 
                                    address={carParkData.address}
                                />
                            ) : (
                                <p>No address available</p>
                            )}
                        </div>
                        <div className="flex-1">
                            <CarParkReviews />
                        </div>
                    </div>
                </>
            )}
        </div>
    )
    
}

interface CarParkDetailsProps {
    id: string
    name: string
    address: string | null
    availableSpace: number

}

const CarParkDetails = (props: CarParkDetailsProps) => {
    const {
        id,
        name,
        address,
        availableSpace,
    } = props;
    
    const router = useRouter()
    const [rate, setRate] = useState<number|null>(null)

    const {
        mutate: getAppropriateRate
    } = api.carPark.getRate.useMutation()

    const handleRateChange = (hours: string) => {

        getAppropriateRate({
            id: router.query.id as string,
            hours:parseInt(hours)
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
                <CardTitle>{name}</CardTitle>
                <CardDescription>{address}</CardDescription>
            </CardHeader>
            <CardContent>
                <div>
                    Available spaces: {availableSpace}
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
                <div>
                    {rate}
                </div>
            </CardContent>
            <CardFooter className="flex justify-between">
                <Button>Save as Home</Button>
                <Button>Save as Work</Button>
            </CardFooter>
        </Card>
    )
}

const CarParkReviews = () => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Reviews</CardTitle>
                <CardDescription>Reviews for this particular carpark</CardDescription>
                <Button
                    variant="outline"
                >Add</Button>
            </CardHeader>
            <CardContent>
                <CarParkReviewItem />
                <CarParkReviewItem />
            </CardContent>

        </Card>
    )
}

const CarParkReviewItem = () => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>John Tan</CardTitle>
            </CardHeader>
            <CardContent>
                Very Cool!
            </CardContent>

        </Card>
    )
}