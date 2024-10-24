import React, { useMemo, useState, useEffect } from 'react';
import { Skeleton } from '../ui/skeleton';

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
  const API_KEY = 'AIzaSyDZlGggHFMUbVH0aEY7b4JtJvd-MPF1OoY'

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
        <Skeleton className="w-full h-full rounded-[1rem]" />
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