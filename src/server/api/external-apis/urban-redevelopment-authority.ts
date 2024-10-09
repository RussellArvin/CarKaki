import { TRPCError } from "@trpc/server";
import axios from 'axios';
import { AvailabilityCarPark, InformationCarPark, URAAuthenticationResponse, URAResponse, URAResult } from "../types/ura-types";
import { env } from "~/env";
import { availabilityValidator, informationValidator } from "../validators/ura-validators";
import { uraTokenRepository } from "../repositories";

export class UrbanRedevelopmentAuthority {
    private static readonly accessKey = env.URA_ACCESS_KEY;
    private token: string | null;
    private static readonly BASE_URL = 'https://www.ura.gov.sg/uraDataService'

    constructor(){
        this.token = null;
    }

    async initialize(): Promise<void> {
        const existingToken = await uraTokenRepository.findOne();
        const tokenExpired = existingToken && existingToken.createdAt < new Date(Date.now() - 23 * 60 * 60 * 1000);
    
        if (!existingToken || tokenExpired) {
            const newToken = await this.generateAccessToken();
            await (existingToken ? uraTokenRepository.update(newToken) : uraTokenRepository.save(newToken));
            this.token = newToken;
            return;
        } 
        this.token = existingToken.token;
        return;
    }


    private async generateAccessToken(): Promise<string> {
        try{
            const response = await axios.get<URAAuthenticationResponse>(
                `${UrbanRedevelopmentAuthority.BASE_URL}/insertNewToken.action`,{
                    headers: {
                        'AccessKey': UrbanRedevelopmentAuthority.accessKey
                    }
                }
            )

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
        if(!this.token) throw new TRPCError({
            code:"INTERNAL_SERVER_ERROR",
            message:"Missing URA Token"
        })

        try{
            const rawResponse = await axios.get(`${UrbanRedevelopmentAuthority.BASE_URL}invokeUraDS`, {
                params: { service: 'Car_Park_Availability' },
                headers: {
                    'AccessKey': UrbanRedevelopmentAuthority.accessKey,
                    'Token': this.token
                }
            });

            const response = availabilityValidator.parse(rawResponse.data);

            if(response.Status === 'Success') return response.Result
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
    

    async getCarParkDetails() {
        if(!this.token) throw new TRPCError({
            code:"INTERNAL_SERVER_ERROR",
            message:"Missing URA Token"
        })

        try{
            const rawResponse = await axios.get(`${UrbanRedevelopmentAuthority.BASE_URL}invokeUraDS`, {
                params: { service: 'Car_Park_Details' },
                headers: {
                    'AccessKey': UrbanRedevelopmentAuthority.accessKey,
                    'Token': this.token
                }
            });

            const response = informationValidator.parse(rawResponse.data);

            if(response.Status === 'Success') return response.Result
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

    // async getSeasonCarParkDetails() {
    //     return this.makeRequest('Season_Car_Park_Details');
    // }
}