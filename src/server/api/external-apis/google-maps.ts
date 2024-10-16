import { env } from "~/env";
import Location from "../types/location";
import axios from "axios";
import { GoogleMapsGeocodingResponse } from "../types/google-maps-types";
import {Client, GeocodeResult, LatLng} from "@googlemaps/google-maps-services-js";
import { TRPCError } from "@trpc/server";
import proj4 from 'proj4';

export class GoogleMap {
    private static readonly API_KEY = env.GOOGLE_MAPS_API_KEY
    private static readonly fromProjection = '+proj=tmerc +lat_0=1.366666667 +lon_0=103.8333333333333 +k=1 +x_0=28001.642 +y_0=38744.572 +ellps=WGS84 +units=m +no_defs';
    private static readonly toProjection = '+proj=longlat +datum=WGS84 +no_defs';

  private static transformCoordinates(location: Location): Location {
    const [lon, lat] = proj4(this.fromProjection, this.toProjection, [location.x, location.y]);
    return { x: lat, y: lon };
  }

    public static async getAddressFromCoordinates(location: Location): Promise<string | null> {
      const client = new Client({});
  
      try {
        const transformedLocation = this.transformCoordinates(location);
        const response = await client.reverseGeocode({
          params: {
            latlng: [transformedLocation.x, transformedLocation.y],
            key: this.API_KEY
          }
        });

        const results: GeocodeResult[] = response.data.results;
  
        if (results && results.length > 0 && results[0] && results[0].formatted_address) {
          return results[0].formatted_address;
        } else {
          return null
        }
      } catch (error) {
        //console.log(error)
        throw new TRPCError({
          code:"INTERNAL_SERVER_ERROR",
          message:"Error with google maps geocoding"
        })
      }
    }

//     public static async getAddressFromCoordinates(location: Location): Promise<string | null> {
//       console.log("Location: ", location)
//       const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${location.x},${location.y}&key=${GoogleMap.API_KEY}`;
    
//       try {
//         const response = await axios.get<GoogleMapsGeocodingResponse>(url);
        
//         if (response.data.status === 'OK') {
//           const results = response.data.results;
//           if (results.length > 0 && results[0]?.formatted_address) {
//             return results[0].formatted_address;
//           } else {
//             console.log("CANT FIND GOOGLE MAP LOCATION");
//           }
//         } else {
//           console.error('Geocoding error:', response.data.status);
//         }
//       } catch (error) {
//         console.error('Error fetching geocoding data:', error);
//       }
    
//       return null;
//     }
 }