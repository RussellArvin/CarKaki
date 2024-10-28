import React, { useMemo, useState, useEffect } from 'react';
import { Skeleton } from '../ui/skeleton';
import { env } from '~/env';

interface AdaptiveMapProps {
  address: string;
  navigate: boolean;
}

const AdaptiveMap: React.FC<AdaptiveMapProps> = ({ 
  address, 
  navigate,
}) => {

  const [userLocation, setUserLocation] = useState<string>('');
  const [isLoadingLocation, setIsLoadingLocation] = useState(navigate);
  const API_KEY = env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  // Get user's current location when in navigation mode
  useEffect(() => {
    if (navigate && navigator.geolocation) {
      setIsLoadingLocation(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation(`${latitude},${longitude}`);
          setIsLoadingLocation(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setIsLoadingLocation(false);
        }
      );
    }
  }, [navigate]);

  const mapUrl = useMemo(() => {
    if (navigate) {
      if (!userLocation || !address) return '';
      
      const [lat, lng] = userLocation.split(',').map(Number);
      
      return `https://www.google.com/maps/embed/v1/directions`
        + `?key=${API_KEY}`
        + `&origin=${encodeURIComponent(userLocation)}`
        + `&destination=${encodeURIComponent(address)}`
        + `&mode=driving`
        + `&zoom=15`  // Set a closer zoom level
        + `&center=${lat},${lng}`; // Center on user's location
    } else {
      return `https://www.google.com/maps/embed/v1/place`
        + `?key=${API_KEY}`
        + `&q=${encodeURIComponent(address)}`;
    }
  }, [address, userLocation, navigate]);

  if (isLoadingLocation) {
    return (
      <div className="w-full h-full p-6 bg-gray-50 rounded-lg">
        <div className="space-y-6">
          {/* Loading text - now more prominent */}
          <div className="flex flex-col items-center justify-center space-y-3 py-4">
            <div className="flex items-center justify-center space-x-3">
              <Skeleton className="h-6 w-6 rounded-full animate-pulse" />
              <h2 className="text-xl font-semibold text-gray-800">
                {navigate ? 'Getting your location...' : 'Loading map...'}
              </h2>
            </div>
            <p className="text-gray-500 text-center">
              {navigate 
                ? 'Please wait while we determine your current position' 
                : 'Preparing your map view'
              }
            </p>
          </div>
          
          {/* Map skeleton */}
          <div className="space-y-3">
            {/* Top bar */}
            <Skeleton className="h-10 w-full rounded" />
            
            {/* Main map area with grid pattern */}
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: 9 }, (_, i: number) => (
                <Skeleton key={i} className="h-24 w-full rounded" />
              ))}
            </div>
            
            {/* Bottom controls */}
            <div className="flex justify-end space-x-2">
              <Skeleton className="h-8 w-8 rounded" />
              <Skeleton className="h-8 w-8 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!mapUrl) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p>Unable to load map</p>
      </div>
    );
  }

  return (
    <iframe
      src={mapUrl}
      width="100%"
      height="100%"
      className="border-0 rounded-lg"
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      title={navigate ? "Directions to location" : "Location map"}
    />
  );
};

export default AdaptiveMap;