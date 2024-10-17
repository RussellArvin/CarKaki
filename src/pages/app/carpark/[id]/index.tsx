import { Button } from "~/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card"
import { NearbyCarparks } from "./components/nearby-carparks"
import Navbar from "~/components/global/navbar"
import { api } from "~/utils/api"
import { useRouter } from "next/router"
import { Skeleton } from "~/components/ui/skeleton"
import { string } from "zod"
import { Input } from "~/components/ui/input"
import { useState } from "react"
import { toast } from "react-hot-toast"


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
            {isCarParkLoading || carParkData === undefined  ? (
                <Skeleton className="h-[500px] w-[500px] rounded-xl" />
            ) : (
                <>
                    <div className="w-full lg:w-1/2 space-y-4">
                        <CarParkDetails 
                            id={carParkData.id}
                            name={carParkData.name}
                            address={carParkData.address}
                            availableSpace={carParkData.availableLots}
                        />
                        <NearbyCarparks 
                            nearByCarParks={carParkData.nearByCarParks}
                        />
                    </div>
                    <div className="w-full lg:w-1/2 h-[500px]">
                        <CarParkMap />
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
            onSuccess: ({rate}) => {
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

const CarParkMap = () => {
    return (
        <div className="relative w-full h-full rounded-lg overflow-hidden">
            <iframe
                className="w-full h-full"
                src="https://maps.google.com/maps?width=100%&height=100%&hl=en&q=Marina+Bay+Singapore&t=&z=14&ie=UTF8&iwloc=B&output=embed"
            ></iframe>
            <div className="absolute top-4 right-4">
                <Button variant="secondary" size="sm">Search this area</Button>
            </div>
        </div>
    );
};