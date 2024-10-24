import { ChevronLeft, ChevronRight, MapIcon, MapPin, Navigation } from "lucide-react";
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
import proj4 from 'proj4';
import { Skeleton } from "~/components/ui/skeleton";
import useUserStore from "~/components/global/user-store";
import { ParkingControls } from "~/components/global/parking-controls";
import AdaptiveMap from "~/components/global/adaptive-map";

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
  const [navigate, setNavigate] = useState<boolean>(false);
  const [offset, setOffset] = useState<number>(0);

  const router = useRouter();
  const { user, isUserLoading } = useUserStore();

  useEffect(() => {

    const {navigate} = router.query;
    if(typeof navigate === 'string'){
      const isNavigating = navigate === 'true';

      setNavigate(isNavigating)
    }

    if (!isUserLoading && user && router.isReady) {
      // Priority 1: Check for current parking
      if (user.currentParking?.location?.x != null && user.currentParking?.location?.y != null) {
        setCoordinates({
          x: user.currentParking.location.x,
          y: user.currentParking.location.y
        });
        return;
      }

      // Priority 2: Check for query parameters
      const { x, y } = router.query;
      if (typeof x === 'string' && typeof y === 'string') {
        const xNum = parseInt(x);
        const yNum = parseInt(y);
        
        if (!isNaN(xNum) && !isNaN(yNum)) {
          setCoordinates({
            x: xNum,
            y: yNum
          });
          return;
        }
      }

      // Priority 3: Use geolocation
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
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
    }
  }, [router.isReady, router.query, user, isUserLoading]);

  const {
    isLoading: isCarParkLoading,
    data: carPark
  } = api.carPark.getDetails.useQuery(
    { x: coordinates?.x ?? 0, y: coordinates?.y ?? 0, offset },
    { enabled: !!coordinates }
  );

  const {
    isLoading: isRateLoading,
    data: carParkRate
  } = api.carPark.getRateDetails.useQuery(
    { id: carPark?.id ?? '' },
    { 
      enabled: !isCarParkLoading && Boolean(carPark?.id)
    }
  );

  const handleNavigate = () => {
    setNavigate(!navigate);
  }

  const handleNext = () => {
    setOffset(offset + 1);
  }
  
  const handlePrevious = () => {
    if (offset === 0) return;
    setOffset(offset - 1);
  }

  const isPageLoading = isCarParkLoading || carPark === undefined
    || isUserLoading || user === undefined || isRateLoading || carParkRate === undefined;


  return (
    <div>
      {error ? (
        <p>{error}</p>
      ) : (
        <div className="flex h-screen p-4">
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
                            <span>{carParkRate.min} minutes</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Rate</span>
                            <span>${carParkRate.rate.toFixed(2)}</span>
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
                    <div className="mt-6 space-y-3">
                    {/* Primary actions - Start Parking and See More */}
                    <div className="flex gap-3">
                      <ParkingControls carParkId={carPark.id}/>
                      <Button
                        variant="outline"
                        onClick={() => router.push(APP_ROUTES.CARPARK(carPark.id))}
                        className="flex-1"
                      >
                        See More!
                      </Button>
                    </div>
                    
                    {/* Navigation controls */}
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant="default"
                          className="w-full"
                          onClick={handlePrevious}
                        >
                          <ChevronLeft className="h-4 w-4 mr-1" />
                          Previous
                        </Button>
                        
                        <Button
                          variant="default"
                          className="w-full"
                          onClick={handleNext}
                        >
                          Next
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                      
                      <Button
                        variant="outline"
                        onClick={handleNavigate}
                        className="w-full"
                      >
                        {navigate ? (
                          <>
                            <MapIcon className="h-4 w-4 mr-2" />
                            Show Overview
                          </>
                        ) : (
                          <>
                            <Navigation className="h-4 w-4 mr-2" />
                            Navigate Here
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
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
                    <AdaptiveMap 
                      address={carPark.address}
                      navigate={navigate}
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

//const customMapEmbed

// const HomePageSideBar = () => {

// }