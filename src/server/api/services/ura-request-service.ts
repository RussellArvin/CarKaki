import { env } from "~/env";
import { UrbanRedevelopmentAuthority } from "../external-apis/urban-redevelopment-authority";
import { CarPark } from "../models/car-park";
import { CarParkRate } from "../models/car-park-rate";
import { RequestLog } from "../models/request-log";

import { CarParkRateRepository } from "../repositories/car-park-rate-repository";
import { CarParkRepository } from "../repositories/car-park-repository";
import { RequestLogRepository } from "../repositories/request-log-repository";
import Location from "../types/location";
import { AvailabilityCarPark, InformationCarPark } from "../types/ura-types";
import { v4 as uuidv4 } from 'uuid';

interface MappedInformationRequest {
 updatedCarParks: CarPark[]
 newCarParks: CarPark[]
 updatedCarParkRates: CarParkRate[]
 newCarParkRates: CarParkRate[]       
}

export class URARequestService {
    private carParkRepository: CarParkRepository
    private carParkRateRepository: CarParkRateRepository
    private requestLogRepository: RequestLogRepository

    constructor(
        carParkRepository: CarParkRepository,
        carParkRateRepository: CarParkRateRepository,
        requestLogRepository: RequestLogRepository
    ) {
        this.carParkRepository = carParkRepository;
        this.carParkRateRepository = carParkRateRepository;
        this.requestLogRepository = requestLogRepository;
    }

    public async checkAndMakeRequests(){
        if(env.IS_DEVELOPMENT == true) return;
        return Promise.all([this.handleAvailabilityRequest(), this.handleInformationRequest()]);
    }

    private canMakeRequest(request: RequestLog | null){
        const hasRequestBefore = !!request; 
        return (request?.canMakeRequest() === true) || !hasRequestBefore;
    }

    private chunkArray<T>(array: T[], size: number): T[][] {
        const result: T[][] = [];
        for (let i = 0; i < array.length; i += size) {
          result.push(array.slice(i, i + size));
        }
        return result;
      };

    private async handleAvailabilityRequest(){
        const latestRequest = await this.requestLogRepository.findLatestRequestOrNull("AVAIL");
        console.log(latestRequest?.getValue())
        if(!this.canMakeRequest(latestRequest)) return;

        console.log("A Availability Request was made")
    
        const ura = new UrbanRedevelopmentAuthority();
        await ura.initialize()
        const [uraData, carparks] = await Promise.all([
            await ura.getCarParkAvailability(),
            await this.carParkRepository.findAll()
        ])
    
        const updatedCarParks = this.mappingAvailabilityRequest(uraData,carparks);
        console.log("Number of updatd carparks: ", updatedCarParks.length)

        await this.carParkRepository.updateMany(updatedCarParks);
        await this.requestLogRepository.save(new RequestLog({
            id: uuidv4(),
            type:"AVAIL",
            createdAt: new Date()
        }))
        return;
    }

    private async handleInformationRequest(){
        const latestRequest = await this.requestLogRepository.findLatestRequestOrNull("INFO");
        if(!this.canMakeRequest(latestRequest)) return;
    
        console.log("A Information Request was made")
    
        const ura = new UrbanRedevelopmentAuthority();
        await ura.initialize()
        const [uraData, carparks, carParkRates] = await Promise.all([
            await ura.getCarParkDetails(),
            await this.carParkRepository.findAll(),
            await this.carParkRateRepository.findAll()
        ])
        const {
            updatedCarParks, newCarParks, updatedCarParkRates, newCarParkRates
        } = this.mappingInformationRequest(uraData,carparks,carParkRates);
    
        console.log("Length of updated CarParks, ",updatedCarParks.length);
        console.log("Length of new Carparks", newCarParks.length);
        console.log("Length of updated Car Park Rates ", updatedCarParkRates.length);
        console.log("Length of new car park rates ", newCarParkRates.length)
    
        
        const newCarParksChunks = this.chunkArray(newCarParks, 500);
        const newCarParkRatesChunks = this.chunkArray(newCarParkRates, 500);
        
        // Create all promises upfront
        const carParkPromises = newCarParksChunks.map(chunk => 
            this.carParkRepository.saveMany(chunk)
        );

        if (updatedCarParkRates.length > 0) {
            carParkPromises.push(this.carParkRepository.updateMany(updatedCarParks));
        }

        await Promise.all(carParkPromises);

        const remainingPromises = [
            // Rate operations
            ...newCarParkRatesChunks.map(chunk => this.carParkRateRepository.saveMany(chunk)),
            this.carParkRateRepository.updateMany(updatedCarParkRates),
            // Request log
            this.requestLogRepository.save(new RequestLog({
                id: uuidv4(),
                type: "INFO",
                createdAt: new Date(),
            }))
        ];

        // Execute remaining operations
        await Promise.all(remainingPromises);
    }

    public mappingAvailabilityRequest (
        uraData: AvailabilityCarPark[],
        existingCarParks: CarPark[]
    ): CarPark[]  {
        // Create a map for quick lookup of existing car parks by their unique code
        const existingCarParksMap = new Map(
            existingCarParks.map((carpark) => [carpark.getValue().code, carpark])
        );
    
        const updatedCarParks: CarPark[] = [];
    
        uraData.forEach((uraCarPark)=>{
            const existingCarPark = existingCarParksMap.get(uraCarPark.carparkNo)
            if(
                existingCarPark &&
                uraCarPark.lotsAvailable !== existingCarPark.getValue().availableLots
            ){
                updatedCarParks.push(existingCarPark.updateAvailableLots(uraCarPark.lotsAvailable));
            }
        })
    
        return updatedCarParks;
    }

    public mappingInformationRequest(
        uraData: InformationCarPark[],
        existingCarParks: CarPark[],
        existingCarParkRates: CarParkRate[],
    ): MappedInformationRequest {
        console.log(`Processing ${uraData.length} URA car parks`);
        
        // Create efficient lookup maps
        const existingCarParksMap = new Map(
            existingCarParks.map((carpark) => [carpark.getValue().code, carpark])
        );
        const existingCarParkRatesMap = new Map(
            existingCarParkRates.map((rate) => [{
                id: rate.getValue().carParkId,
                min: rate.getValue().satMin
            }, rate])
        );
    
        const updatedCarParks: CarPark[] = [];
        const newCarParks: CarPark[] = [];
        const updatedCarParkRates: CarParkRate[] = [];
        const newCarParkRates: CarParkRate[] = [];
    
        for (const uraCarPark of uraData) {
            const existingCarpark = existingCarParksMap.get(uraCarPark.ppCode);
            
            if (existingCarpark) {
                if (!this.areCarParksIdentical(existingCarpark, uraCarPark)) {
                    const updatedCarPark = this.createUpdatedCarparkFromUra(existingCarpark, uraCarPark);
                    if (updatedCarPark) {
                        updatedCarParks.push(updatedCarPark);
                        
                        const existingRate = existingCarParkRatesMap.get({
                            id: updatedCarPark.getValue().id,
                            min: uraCarPark.satdayMin
                        });
    
                        if (existingRate) {
                            if (!this.areRatesIdentical(existingRate, uraCarPark)) {
                                const updatedRate = this.createUpdatedRateFromUra(existingRate, uraCarPark);
                                updatedCarParkRates.push(updatedRate);
                            }
                        } else {
                            const newRate = this.createNewRateFromUra(updatedCarPark.getValue().id, uraCarPark);
                            newCarParkRates.push(newRate);
                        }
                    }
                }
            } else {
                const newCarPark = this.createNewCarparkFromUra(uraCarPark);
                if (newCarPark) {
                    newCarParks.push(newCarPark);
                    const newRate = this.createNewRateFromUra(newCarPark.getValue().id, uraCarPark);
                    newCarParkRates.push(newRate);
                }
            }
        }
    
        console.log(`Processing complete. Results:`);
        console.log(`Updated car parks: ${updatedCarParks.length}`);
        console.log(`New car parks: ${newCarParks.length}`);
        console.log(`Updated car park rates: ${updatedCarParkRates.length}`);
        console.log(`New car park rates: ${newCarParkRates.length}`);
    
        return { updatedCarParks, newCarParks, updatedCarParkRates, newCarParkRates };
    }
    
    public areCarParksIdentical(existingCarPark: CarPark, uraCarPark: InformationCarPark): boolean {
        const existing = existingCarPark.getValue();
        return (
            existing.vehicleCategory === uraCarPark.vehCat &&
            existing.parkingSystem === uraCarPark.parkingSystem &&
            existing.capacity === uraCarPark.parkCapacity
        );
    }
    
    public areRatesIdentical(existingRate: CarParkRate, uraCarPark: InformationCarPark): boolean {
        const existing = existingRate.getValue();
        const isIdentical = (
            existing.startTime === uraCarPark.startTime &&
            existing.endTime === uraCarPark.endTime &&
            existing.weekDayRate === uraCarPark.weekdayRate &&
            existing.weekDayMin === uraCarPark.weekdayMin &&
            existing.satRate === uraCarPark.satdayRate &&
            existing.satMin === uraCarPark.satdayMin &&
            existing.sunPHRate === uraCarPark.sunPHRate &&
            existing.sunPHMin === uraCarPark.sunPHMin
        );
        
        return isIdentical;
    }
    
    private createUpdatedRateFromUra(existingRate: CarParkRate, uraCarPark: InformationCarPark): CarParkRate {
        const existingValues = existingRate.getValue();
        return new CarParkRate({
            ...existingValues,
            startTime: uraCarPark.startTime,
            endTime: uraCarPark.endTime,
            weekDayRate: uraCarPark.weekdayRate,
            weekDayMin: uraCarPark.weekdayMin,
            satRate: uraCarPark.satdayRate,
            satMin: uraCarPark.satdayMin,
            sunPHRate: uraCarPark.sunPHRate,
            sunPHMin: uraCarPark.sunPHMin,
            updatedAt: new Date()
        });
    }
    
    private createNewRateFromUra(carParkId: string, uraCarPark: InformationCarPark): CarParkRate {
        return new CarParkRate({
            id: uuidv4(),
            carParkId: carParkId,
            startTime: uraCarPark.startTime,
            endTime: uraCarPark.endTime,
            weekDayRate: uraCarPark.weekdayRate,
            weekDayMin: uraCarPark.weekdayMin,
            satRate: uraCarPark.satdayRate,
            satMin: uraCarPark.satdayMin,
            sunPHRate: uraCarPark.sunPHRate,
            sunPHMin: uraCarPark.sunPHMin,
            createdAt: new Date(),
            updatedAt: new Date()
        });
    }
    
    private createUpdatedCarparkFromUra(existingCarPark: CarPark, uraCarPark: InformationCarPark): CarPark | null {
        const coordinates = uraCarPark.geometries[0]?.coordinates;
        const updatedLocation = coordinates ? this.formatLocation(coordinates, existingCarPark.getValue().location) : existingCarPark.getValue().location;
    
        if (!updatedLocation) return null;
    
        return new CarPark({
            ...existingCarPark.getValue(),
            vehicleCategory: uraCarPark.vehCat,
            parkingSystem: uraCarPark.parkingSystem,
            capacity: uraCarPark.parkCapacity,
            location: updatedLocation,
            updatedAt: new Date()
        });
    }
    
    private createNewCarparkFromUra(uraCarPark: InformationCarPark): CarPark | null {
        const coordinates = uraCarPark.geometries[0]?.coordinates;
        const location = coordinates ? this.formatLocation(coordinates, null) : null;
        if (!location) return null;
    
        const currentDate = new Date();
        return new CarPark({
            id: uuidv4(),
            code: uraCarPark.ppCode,
            name: uraCarPark.ppName,
            vehicleCategory: uraCarPark.vehCat,
            parkingSystem: uraCarPark.parkingSystem,
            location: location,
            address: null,
            createdAt: currentDate,
            updatedAt: currentDate,
            capacity: uraCarPark.parkCapacity,
            availableLots: 0,
        });
    }
    
    private formatLocation(coordinates: string, existingLocation: Location | null): Location | null {
        if (!coordinates) {
            return existingLocation;
        }
    
        const segments = coordinates.split(',');
        if (segments.length < 2) {
            return existingLocation;
        }
    
        return {
            x: parseFloat(segments[0]!),
            y: parseFloat(segments[1]!)
        };
    }
    
}







