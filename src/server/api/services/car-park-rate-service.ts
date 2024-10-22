import { TRPCError } from "@trpc/server";
import { CarParkRate } from "../models/car-park-rate";
import { CarParkRateRepository } from "../repositories/car-park-rate-repository";

interface DayRate {
    min: number,
    rate: number
}

export class CarParkRateService {
    private carParkRateRepository: CarParkRateRepository

    constructor(
        carParkRateRepository: CarParkRateRepository
    ){
        this.carParkRateRepository = carParkRateRepository;
    }

    private getDayRate(carParkRate: CarParkRate | null): DayRate {
        if(!carParkRate) return {
            min: 0,
            rate:0
        }

        const dayOfTheWeek = new Date().getDay();
        //TODO: handle public holiday

        if(dayOfTheWeek === 0){
            return {
                min: carParkRate.getValue().sunPHMin,
                rate: carParkRate.getValue().sunPHRate
            }
        }
        else if(dayOfTheWeek === 6) {
            return {
                min: carParkRate.getValue().satMin,
                rate: carParkRate.getValue().satRate
            }
        }
        return {
            min: carParkRate.getValue().weekDayMin,
            rate: carParkRate.getValue().weekDayRate
        }
    }

    public async getRateValues(
        carParkId: string
    ) {
        try{
            const rate = await this.carParkRateRepository.findOneByCarParkId(carParkId)
            return this.getDayRate(rate)
        }catch(err){
            if(err instanceof TRPCError) throw err;

            const e = err as Error;
            throw new TRPCError({
                code:"INTERNAL_SERVER_ERROR",
                message:e.message
            })
        }
    }

    public async getAppropriateRate(
        carParkId: string,
        hours: number
    ): Promise<number> {
        console.log(carParkId,hours)
        try{
            return await this.carParkRateRepository.getRate(carParkId,hours)
        }catch(err){
            if(err instanceof TRPCError) throw err;

            const e = err as Error;
            throw new TRPCError({
                code:"INTERNAL_SERVER_ERROR",
                message:e.message
            })
        }
    }
}