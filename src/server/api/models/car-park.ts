import Location from "../types/location"
import ParkingSystem from "../types/parking-system"
import VehicleCategory from "../types/vehicle-category"

interface CarParkProps {
    id: string
    code: string
    name: string
    address: string | null
    vehicleCategory: VehicleCategory
    parkingSystem: ParkingSystem
    capacity: number
    availableLots: number
    location: Location
    createdAt: Date
    updatedAt: Date
}

export class CarPark {
    constructor(private readonly props: Readonly<CarParkProps>) {}

    public getValue(): CarParkProps {
        return { ...this.props };
    }

    public updateAvailableLots(availableLots: number): CarPark {
        return new CarPark({
            ...this.props,
            availableLots
        })
    }
}
