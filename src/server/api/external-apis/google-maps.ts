import { env } from "~/env";
import Location from "../types/location";
import axios from "axios";

export class GoogleMap {
    private static readonly API_KEY = env.GOOGLE_MAPS_API_KEY

    constructor (){}

    public async getAddressFromCoordinates(location: Location){
        const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${location.x},${location.y}&key=${GoogleMap.API_KEY}`;

        const response = await axios.get(url);
        if (response.data.status === 'OK') {
            const results = response.data.results;
            if (results.length > 0) {
              return results[0].formatted_address as string // Returns the first address
            } else {
                console.log("CANT FIND GOOGLE MAP LOCATION")
            }
          } else {
            console.error('Geocoding error:', response.data.status);
          }
        return null
    }
}