import { Button } from "~/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card"
import { NearbyCarparks } from "./components/nearby-carparks"


export default function CarParkPage(){
    return (
        <CarParkMainContent />
    )
}

const CarParkMainContent = () => {
    return (
        <div className="flex flex-col lg:flex-row gap-4 p-4">
            <div className="w-full lg:w-1/2 space-y-4">
                <CarParkDetails />
                <NearbyCarparks />
            </div>
            <div className="w-full lg:w-1/2 h-[500px]">
                <CarParkMap />
            </div>
        </div>
    )
}

const CarParkDetails = () => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Marina Bay Car Park</CardTitle>
                <CardDescription>8 Marina Blvd, Singapore 018981</CardDescription>
            </CardHeader>
            <CardContent>
                <div>
                    Available spaces: 325
                </div>
                <div>
                    Hourly rate: $4.50
                </div>
                <div>
                    Daily Rate: $45
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
            <div className="absolute bottom-4 left-4 bg-white bg-opacity-75 px-2 py-1 rounded text-sm">
                Marina Bay
            </div>
        </div>
    );
};