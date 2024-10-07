import CarParkAgency from "../types/car-park-agency"
import Location from "../types/location"
import ParkingSystem from "../types/parking-system"
import VehicleCategory from "../types/vehicle-category"

interface CarParkProps {
    id: string
    code: string
    name: string
    vehicleCategory: VehicleCategory
    startTime: string
    endTime: string
    weekDayRate: number
    weekDayMin: number
    satRate: number
    satMin: number
    sunPHRate: number
    sunPHMin: number
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
