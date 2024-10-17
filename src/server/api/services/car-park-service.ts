import { GoogleMap } from "../external-apis/google-maps";
import { CarPark } from "../models/car-park";
import { CarParkRate } from "../models/car-park-rate";
import { CarParkRateRepository } from "../repositories/car-park-rate-repository";
import { CarParkRepository } from "../repositories/car-park-repository";

interface DayRate {
    min: number,
    rate: number
}

export class CarParkService{
    private carParkRateRepository: CarParkRateRepository
    private carParkRepository: CarParkRepository

    constructor(
        carParkRateRepository: CarParkRateRepository,
        carParkRepository: CarParkRepository
    ){
        this.carParkRateRepository = carParkRateRepository
        this.carParkRepository = carParkRepository
    }

    public async mapOneCarParkWithAddress(carPark:CarPark): Promise<CarPark> {
        const { address, location } = carPark.getValue()
        if(address) return carPark;
        
        const updatedCarPark =  new CarPark({
            ...carPark.getValue(),
            address: await GoogleMap.getAddressFromCoordinates(location)
        })
        await this.carParkRepository.update(updatedCarPark);
        return updatedCarPark;
    }

    public async mapManyCarParkWithAddress(carParks: CarPark[]): Promise<CarPark[]>{
        return Promise.all(carParks.map(carPark => this.mapOneCarParkWithAddress(carPark)))
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
        minutes: number
    ): Promise<number> {
        const carParkRate = await this.carParkRateRepository.findOneByCarParkId(carParkId);
        if(!carParkRate) return 0;

        const { min, rate } = this.getDayRate(carParkRate);

        return Math.ceil(minutes / min) * rate;
    }
}
