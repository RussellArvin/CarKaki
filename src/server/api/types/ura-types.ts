import VehicleCategory from "./vehicle-category"

const uraApiRequestType = ["INFO","AVAIL"] as const
export type UraAPIRequestType = typeof uraApiRequestType[number]

type Geometry = {
    coordinates: string
}

export type AvailabilityCarPark = {
    carparkNo: string
    lotsAvailable: string
    lotType: VehicleCategory
    geometries: Geometry[]
}

export type InformationCarPark = {
    weekdayMin: string
    ppName: string
    endTime: string
    weekdayRate: string
    startTime: string
    ppCode: string
    sunPHRate: string
    satdayMin: string
    parkingSystem: VehicleCategory
    parkCapacity: number
    vehCat: string
    satdatRate: string
    geometries: Geometry[]
}

export type URAResult = InformationCarPark[] | AvailabilityCarPark[];

export type URAResponse = {
    Status: string,
    Message: string,
    Result: URAResult
}
