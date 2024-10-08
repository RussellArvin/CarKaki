import { env } from "~/env";
import Location from "../types/location";
import axios from "axios";
import { GoogleMapsGeocodingResponse } from "../types/google-maps-types";

export class GoogleMap {
    private static readonly API_KEY = env.GOOGLE_MAPS_API_KEY

    public static async getAddressFromCoordinates(location: { x: number; y: number }): Promise<string | null> {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${location.x},${location.y}&key=${GoogleMap.API_KEY}`;
    
      try {
        const response = await axios.get<GoogleMapsGeocodingResponse>(url);
        
        if (response.data.status === 'OK') {
          const results = response.data.results;
          if (results.length > 0 && results[0]?.formatted_address) {
            return results[0].formatted_address;
          } else {
            console.log("CANT FIND GOOGLE MAP LOCATION");
          }
        } else {
          console.error('Geocoding error:', response.data.status);
        }
      } catch (error) {
        console.error('Error fetching geocoding data:', error);
      }
    
      return null;
    }
}