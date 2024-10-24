import Location from "./location"

interface CurrentParking {
    id: string
    carParkId: string
    address: string | null
    name: string
    location: Location
    startDate: Date
}

export default CurrentParking