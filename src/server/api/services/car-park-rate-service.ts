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

    private getDayRate(carParkRate: CarParkRate): DayRate {
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

    public async getAppropriateRate(
        carParkId: string,
        hours: number
    ): Promise<number> {
        try{
            const carParkRate = await this.carParkRateRepository.findOneByCarParkId(carParkId);
            if(!carParkRate) return 0;

            const { min, rate } = this.getDayRate(carParkRate);

            return Math.ceil((hours*60) / min) * rate;
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