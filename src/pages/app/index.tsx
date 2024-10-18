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

const ParkingInfo = () => {
  // Assuming these values come from your API query
  const parkingData = {
    name: "Marina Bay",
    totalSpaces: 400,
    availableSpaces: 325,
    hourlyRate: 4.5,
    dailyRate: 45,
    address: "Marina Bay, Downtown Core, 018940 Singapore",
    mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.8201990848656!2d103.85309661475397!3d1.2839325990635548!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31da1904937e1633%3A0x62099677b59fca76!2sMarina%20Bay%20Open%20Carpark!5e0!3m2!1sen!2sus!4v1634918784184!5m2!1sen!2sus"
  };

  const availabilityPercentage = (parkingData.availableSpaces / parkingData.totalSpaces) * 100;

  return (
    <div className="flex h-screen bg-gray-100 p-4">
      {/* Left Panel */}
      <Card className="w-1/3 mr-4">
        <CardHeader className="bg-blue-600 text-white">
          <CardTitle>{parkingData.name}</CardTitle>
          <CardDescription className="text-blue-100">{parkingData.totalSpaces} lots</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex space-x-2 mb-6">
            <Input placeholder="Location" />
            <Button size="icon"><Search className="h-4 w-4" /></Button>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span>Available spaces:</span>
                <span>{parkingData.availableSpaces}</span>
              </div>
              <Progress value={availabilityPercentage} className="h-2" />
            </div>
            <div className="flex justify-between">
              <span>Hourly rate:</span>
              <span>$7</span>
            </div>
            <div className="flex justify-between">
              <span>Daily rate:</span>
              <span>$45</span>
            </div>
            <div className="flex items-start pt-4">
              <MapPin className="mr-2 h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm">{parkingData.address}</p>
            </div>
          </div>
          <Button className="w-full mt-6">Let's Go!</Button>
        </CardContent>
      </Card>

      {/* Right Panel - Map */}
      <Card className="w-2/3">
        <CardContent className="p-0 h-full">
          <iframe
            src={parkingData.mapUrl}
            width="100%"
            height="100%"
            style={{border:0}}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </CardContent>
      </Card>
    </div>
  );
};

const HomePageContent: React.FC = () => {
  const [coordinates, setCoordinates] = useState<Location | null>(null);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

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


  return (
    <div>
      {error ? (
        <p>{error}</p>
      ) : !coordinates || isCarParkLoading ? (
        <p>Loading coordinates...</p>
      ) : carPark ? (
        <div className="flex h-screen bg-gray-100 p-4">
            {/* Left Panel */}
            <Card className="w-1/3 mr-4">
              <CardHeader className="bg-blue-600 text-white">
                <CardTitle>{carPark.name}</CardTitle>
                <CardDescription className="text-blue-100">{carPark.capacity} lots</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
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
                  <div className="flex justify-between">
                    <span>Hourly rate:</span>
                    <span>$7</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Daily rate:</span>
                    <span>$45</span>
                  </div>
                  <div className="flex items-start pt-4">
                    <MapPin className="mr-2 h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm">{carPark.address}</p>
                  </div>
                </div>
                <Button 
                  onClick={()=> router.push(APP_ROUTES.CARPARK(carPark.id))}
                  className="w-full mt-6"
                >
                  See More!
                </Button>
              </CardContent>
            </Card>

            {/* Right Panel - Map */}
            <Card className="w-2/3">
              <CardContent className="p-0 h-full">
              {carPark.address ? (
                <MapEmbed 
                  address={carPark.address}
                />
              ) : (
                <p>none</p>
              )}
              </CardContent>
            </Card>
          </div>
      ) : (
        <p>No car park found.</p> // This is the fallback when no car park is found
      )}
    </div>
  );
  
};

const HomePageSideBar = () => {

}