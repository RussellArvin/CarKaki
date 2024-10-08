export interface GoogleMapsGeocodingResponse {
    status: 'OK' | 'ZERO_RESULTS' | 'OVER_QUERY_LIMIT' | 'REQUEST_DENIED' | 'INVALID_REQUEST' | 'UNKNOWN_ERROR';
    results: GoogleMapsGeocodingResult[];
    error_message?: string;
  }
  
  interface GoogleMapsGeocodingResult {
    formatted_address: string;
    place_id: string;
    geometry: {
      location: {
        lat: number;
        lng: number;
      };
      location_type: string;
      viewport: {
        northeast: {
          lat: number;
          lng: number;
        };
        southwest: {
          lat: number;
          lng: number;
        };
      };
    };
    address_components: {
      long_name: string;
      short_name: string;
      types: string[];
    }[];
    types: string[];
  }