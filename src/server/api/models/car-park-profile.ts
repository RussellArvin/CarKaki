import CarParkAgency from "../types/car-park-agency"
import Location from "../types/location"
import LotType from "../types/lot-type"

interface CarParkProps {
    id: string
    area: string
    development: string
    location: Location
    availableLots: number
    lotType: LotType
    agency: CarParkAgency
    hourlyRate: number
    dailyRate: number
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

    public updateDailyRate(dailyRate: number): CarPark{
        return new CarPark({
            ...this.props,
            dailyRate
        })
    }

    public updateHourlyRate(hourlyRate: number): CarPark{
        return new CarPark({
            ...this.props,
            hourlyRate
        })
    }
}
