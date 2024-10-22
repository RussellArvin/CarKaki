import { MapPin, Search } from "lucide-react";
import { useRouter } from "next/router"
import { useEffect, useState } from "react";
import Navbar from "~/components/global/navbar"
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import Location from "~/server/api/types/location";
import {Progress} from "~/components/ui/progress"
import { api } from "~/utils/api"
import APP_ROUTES from "~/lib/constants/APP_ROUTES";
import MapEmbed from "~/components/global/map-embed";
import proj4 from 'proj4';
import { Skeleton } from "~/components/ui/skeleton";
import useUserStore from "~/components/global/user-store";
import toast from "react-hot-toast";

// Define the projections
const WGS84 = 'EPSG:4326';
const SVY21 = 'EPSG:3414';


export default function HomePage(){
    return (
        <>
            <Navbar />
            <HomePageContent />
        </>
    )
}

const HomePageContent: React.FC = () => {
  const [coordinates, setCoordinates] = useState<Location | null>(null);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const { user, isUserLoading } = useUserStore();

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          // Add the definition for EPSG:3414
          proj4.defs('EPSG:3414', '+proj=tmerc +lat_0=1.366666666666667 +lon_0=103.8333333333333 +k=1.0 +x_0=28001.642 +y_0=38744.572 +ellps=WGS84 +units=m +no_defs');
          const [easting, northing] = proj4(WGS84, SVY21, [longitude, latitude]);
          setCoordinates({ x: easting, y: northing });
        },
        (err) => {
          setError("Geolocation is not enabled or available.");
        }
      );
    } else {
      setError("Geolocation is not supported by this browser.");
    }
  }, []);

  const {
    isLoading: isCarParkLoading,
    data: carPark
  } = api.carPark.getDetails.useQuery(
    { x: coordinates?.x ?? 0, y: coordinates?.y ?? 0 },
    { enabled: !!coordinates }
  );

  const {
    mutateAsync: startParkingMutationAsync
  } = api.carPark.startParking.useMutation()

  const {
    isLoading: isRateLoading,
    data: carParkRate
  } = api.carPark.getRateDetails.useQuery(
    { id: carPark?.id  ?? ''},
    { 
      enabled: !isCarParkLoading && Boolean(carPark?.id)
    }
  );

  const isPageLoading =  isCarParkLoading || carPark === undefined
    || isUserLoading || user === undefined || isRateLoading || carParkRate === undefined

    // const startParking = async () => {
    //   if (!carPark) return;
    
    //   await toast.promise(
    //     startParkingMutationAsync({
    //       id: carPark.id
    //     }), 
    //     {
    //       loading: 'Starting parking session...',
    //       success: 'Parking session started!',
    //       error: (e:Error) => e.message
    //     }
    //   );
    // }


  return (
    <div>
      {error ? (
        <p>{error}</p>
      ) : (
        <div className="flex h-screen bg-gray-100 p-4">
            {/* Left Panel */}
            <Card className="w-1/3 mr-4">
              <CardHeader className="bg-blue-600 text-white">
                {isPageLoading ? (
                  <Skeleton />
                ) : (
                  <>
                    <CardTitle>{carPark.name}</CardTitle>
                    <CardDescription className="text-blue-100">{carPark.capacity} lots</CardDescription>
                  </>
                )}
              </CardHeader>
              <CardContent className="p-6">
              {isPageLoading ? (
          <div className="space-y-4">
            <div className="flex space-x-2">
              <Skeleton className="w-full h-10 rounded" />
              <Skeleton className="w-10 h-10 rounded-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="w-full h-4 rounded" />
              <Skeleton className="w-2/3 h-4 rounded" />
              <Skeleton className="w-1/2 h-4 rounded" />
            </div>
            <div className="flex items-start space-x-2">
              <Skeleton className="w-5 h-5 rounded-full" />
              <Skeleton className="w-full h-4 rounded" />
            </div>
            <Skeleton className="w-full h-10 rounded" />
          </div>
                ) : (
                  <>
                    <div className="flex space-x-2 mb-6">
                      <Input placeholder="Location" />
                      <Button size="icon"><Search className="h-4 w-4" /></Button>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-2">
                          <span>Available spaces:</span>
                          <span>{carPark.availableLots}</span>
                        </div>
                        <Progress value={(carPark.availableLots / carPark.capacity) * 100} className="h-2" />
                      </div>
                      {(carParkRate.min !== 0 && carParkRate.rate !== 0) ? (
                        <>
                          <div className="flex justify-between">
                            <span>Minimum Time</span>
                            <span>{carParkRate.min}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Rate</span>
                            <span>{carParkRate.rate}</span>
                          </div>
                        </>
                      ) :  <div className="flex justify-between">
                      <span>Rate</span>
                      <span>Parking is free currently!</span>
                    </div>
                    }
                      <div className="flex items-start pt-4">
                        <MapPin className="mr-2 h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm">{carPark.address}</p>
                      </div>
                    </div>
                    <Button
                      onClick={() => router.push(APP_ROUTES.CARPARK(carPark.id))}
                      className="w-full mt-6"
                    >
                      See More!
                    </Button>
                    <Button
                      onClick={() => router.push(APP_ROUTES.CARPARK(carPark.id))}
                      className="w-full mt-3"
                    >
                      Start Parking
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Right Panel - Map */}
            <Card className="w-2/3">
              <CardContent className="p-4 h-full">
              {isPageLoading ? (
                  <Skeleton className="w-full h-full rounded-[1rem]" />
                ) : (
                  carPark.address ? (
                    <MapEmbed 
                      address={carPark.address}
                    />
                  ) : (
                    <p>none</p>
                  )
                )}
              </CardContent>
            </Card>
          </div>
      )}
    </div>
  );
  
};

// const HomePageSideBar = () => {

// }