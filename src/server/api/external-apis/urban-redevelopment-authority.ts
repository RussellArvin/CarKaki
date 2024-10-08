import { TRPCError } from "@trpc/server";
import axios from 'axios';
import { AvailabilityCarPark, InformationCarPark, URAAuthenticationResponse, URAResponse, URAResult } from "../types/ura-types";
import { env } from "~/env";

export class UrbanRedevelopmentAuthority {
    private static readonly accessKey = env.URA_ACCESS_KEY;
    private token: string | null;
    private static readonly BASE_URL = 'https://www.ura.gov.sg/uraDataService'

    constructor(){
        this.token = null;
    }

    async initialize(): Promise<void> {
        //TODO: Store key somewhere?
        try{
            const response = await axios.get<URAAuthenticationResponse>(
                `${UrbanRedevelopmentAuthority.BASE_URL}/insertNewToken.action`,{
                    headers: {
                        'AccessKey': UrbanRedevelopmentAuthority.accessKey
                    }
                }
            )

            if(response.data.Status === 'Success') this.token = response.data.Result;
            else throw new TRPCError({
                code:"INTERNAL_SERVER_ERROR",
                message:"Request to URA failed"
            })
        } catch (err) {
            if(err instanceof TRPCError) throw err

            const e = err as Error;
            throw new TRPCError({
                code:"INTERNAL_SERVER_ERROR",
                message: e.message
            })
        }
    }

    private async makeRequest(service: string): Promise<URAResult> {
        if(!this.token) throw new TRPCError({
            code:"INTERNAL_SERVER_ERROR",
            message:"Missing URA Token"
        })

        try{
            const response = await axios.get<URAResponse>(`${UrbanRedevelopmentAuthority.BASE_URL}invokeUraDS`, {
                params: { service },
                headers: {
                    'AccessKey': UrbanRedevelopmentAuthority.accessKey,
                    'Token': this.token
                }
            });

            if(response.data.Status === 'Success') return response.data.Result;
            else throw new TRPCError({
                code:"INTERNAL_SERVER_ERROR",
                message:"Request to URA failed"
            })
        } catch (err) {
            if(err instanceof TRPCError) throw err

            const e = err as Error;
            throw new TRPCError({
                code:"INTERNAL_SERVER_ERROR",
                message: e.message
            })
        }
    }

    async getCarParkAvailability() {
        return await this.makeRequest('Car_Park_Availability') as AvailabilityCarPark[]
    }

    async getCarParkDetails() {
        return await this.makeRequest('Car_Park_Details') as InformationCarPark[];
    }

    // async getSeasonCarParkDetails() {
    //     return this.makeRequest('Season_Car_Park_Details');
    // }
}