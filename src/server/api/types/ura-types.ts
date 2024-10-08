import { z } from "zod"
import { availabilityValidator, informationValidator } from "../validators/ura-validators"

export const uraApiRequestType = ["INFO","AVAIL"] as const
export type UraAPIRequestType = typeof uraApiRequestType[number]

export type AvailabilityCarPark = z.infer<typeof availabilityValidator>["Result"][number]

export type InformationCarPark = z.infer<typeof informationValidator>["Result"][number];

export type URAResult = InformationCarPark[] | AvailabilityCarPark[];

export type URAResponse = {
    Status: string,
    Message: string,
    Result: URAResult
}

export type URAAuthenticationResponse = {
    Status: string,
    Message: string,
    Result: string
}
