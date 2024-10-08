import { GoogleMap } from "../external-apis/google-maps";
import { CarPark } from "../models/car-park";

export const mapOneCarParkWithAddress = async (carPark: CarPark): Promise<CarPark> => {
    const { address, location } = carPark.getValue()
    if(address) return carPark;
    
    return new CarPark({
        ...carPark.getValue(),
        address: await GoogleMap.getAddressFromCoordinates(location)
    })
}

export const mapManyCarParkWithAddress = async (carParks: CarPark[]): Promise<CarPark[]> => {
    return Promise.all(carParks.map(carPark => mapOneCarParkWithAddress(carPark)))
}