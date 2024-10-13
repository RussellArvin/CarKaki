import { UrbanRedevelopmentAuthority } from "../external-apis/urban-redevelopment-authority";
import { CarPark } from "../models/car-park";
import { RequestLog } from "../models/request-log";
import { carParkRepository, requestLogRepository } from "../repositories"
import Location from "../types/location";
import { AvailabilityCarPark, InformationCarPark } from "../types/ura-types";
import { v4 as uuidv4 } from 'uuid';

export const checkAndMakeURARequests = async () => {
    return Promise.all([handleAvailabilityRequest, handleInformationRequest]);
};

const canMakeRequest = (request: RequestLog | null): boolean => {
    const hasRequestBefore = !!request; 
    return (request?.canMakeRequest() === true) || !hasRequestBefore;
}

const handleAvailabilityRequest = async () => {
    const latestRequest = await requestLogRepository.findLatestRequestOrNull("AVAIL");
    if(!canMakeRequest(latestRequest)) return;

    const ura = new UrbanRedevelopmentAuthority();
    await ura.initialize()
    const [uraData, carparks] = await Promise.all([
        await ura.getCarParkAvailability(),
        await carParkRepository.findAll()
    ])

    const updatedCarParks = mappingAvailabilityRequest(uraData,carparks);

    const promises = updatedCarParks.map((carpark) => {
        return carParkRepository.update(carpark)
    })

    await Promise.all(promises)
    return;
}

const handleInformationRequest = async () => {
    const latestRequest = await requestLogRepository.findLatestRequestOrNull("INFO");
    if(!canMakeRequest(latestRequest)) return;

    const ura = new UrbanRedevelopmentAuthority();
    await ura.initialize()
    const [uraData, carparks] = await Promise.all([
        await ura.getCarParkDetails(),
        await carParkRepository.findAll()
    ])
    const {
        updatedCarParks, newCarParks
    } = mappingInformationRequest(uraData,carparks);

    const promises = [carParkRepository.saveMany(newCarParks)];
    updatedCarParks.map((carpark)=>{
        promises.push(carParkRepository.update(carpark))
    })

    await Promise.all(promises)
    return;
}

const mappingAvailabilityRequest = (
    uraData: AvailabilityCarPark[],
    existingCarParks: CarPark[]
): CarPark[] => {
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

const mappingInformationRequest = (
    uraData: InformationCarPark[],
    existingCarParks: CarPark[]
): { updatedCarParks: CarPark[], newCarParks: CarPark[] } => {
    // Create a map for quick lookup of existing car parks by their unique code
    const existingCarParksMap = new Map(
        existingCarParks.map((carpark) => [carpark.getValue().code, carpark])
    );

    // Arrays to hold updated and new car parks
    const updatedCarParks: CarPark[] = [];
    const newCarParks: CarPark[] = [];

    // Process URA data to update existing car parks or add new ones
    uraData.forEach((uraCarpark) => {
        const existingCarpark = existingCarParksMap.get(uraCarpark.ppCode);

        if (existingCarpark) {
            // Check if the existing car park and URA car park are different
            if (!areCarParksIdentical(existingCarpark, uraCarpark)) {
                // Create an updated CarPark only if there are changes
                const updatedCarpark = createUpdatedCarparkFromUra(existingCarpark, uraCarpark);
                updatedCarParks.push(updatedCarpark);
            }
        } else {
            // If it's a new car park, create a new instance and add it to newCarParks
            const newCarpark = createNewCarparkFromUra(uraCarpark);
            newCarParks.push(newCarpark);
        }
    });

    // Return both updated and new car parks
    return { updatedCarParks, newCarParks };
};

const createUpdatedCarparkFromUra = (
    existingCarPark: CarPark,
    uraCarPark: InformationCarPark
): CarPark => {
    return new CarPark({
        ...existingCarPark.getValue(),
        vehicleCategory: uraCarPark.vehCat,
        startTime: uraCarPark.startTime,
        endTime: uraCarPark.endTime,
        weekDayRate: uraCarPark.weekdayRate,
        weekDayMin: uraCarPark.weekdayMin,
        satRate: uraCarPark.satdayRate,
        satMin: uraCarPark.satdayMin,
        sunPHRate: uraCarPark.sunPHRate,
        sunPHMin: uraCarPark.sunPHMin,
        parkingSystem: uraCarPark.parkingSystem,
        location: formatLocation(uraCarPark.geometries[0]?.coordinates!, existingCarPark.getValue().location),
    })
}

const createNewCarparkFromUra = (uraCarPark: InformationCarPark): CarPark  => {
    const currentDate = new Date();
    return new CarPark({
        id:uuidv4(),
        code: uraCarPark.ppCode,
        name: uraCarPark.ppName,
        vehicleCategory: uraCarPark.vehCat,
        startTime: uraCarPark.startTime,
        endTime: uraCarPark.endTime,
        weekDayRate: uraCarPark.weekdayRate,
        weekDayMin: uraCarPark.weekdayMin,
        satRate: uraCarPark.satdayRate,
        satMin: uraCarPark.satdayMin,
        sunPHRate: uraCarPark.sunPHRate,
        sunPHMin: uraCarPark.sunPHMin,
        parkingSystem: uraCarPark.parkingSystem,
        location: formatLocation(uraCarPark.geometries[0]?.coordinates!, null),
        address:null,
        createdAt: currentDate,
        updatedAt: currentDate,
        capacity:uraCarPark.parkCapacity,
        availableLots:0,
    })
}

const formatLocation = (coordinates: string, existingLocation: Location | null)=> {
    const segments = coordinates.split(',');
    return{
        x: parseFloat(segments[0]!),
        y: parseFloat(segments[1]!)
    }
}

const areCarParksIdentical = (existingCarPark: CarPark, uraCarPark: InformationCarPark): boolean => {
    const existing = existingCarPark.getValue();
    return (
        existing.vehicleCategory === uraCarPark.vehCat &&
        existing.startTime === uraCarPark.startTime &&
        existing.endTime === uraCarPark.endTime &&
        existing.weekDayRate === uraCarPark.weekdayRate &&
        existing.weekDayMin === uraCarPark.weekdayMin &&
        existing.satRate === uraCarPark.satdayRate &&
        existing.satMin === uraCarPark.satdayMin &&
        existing.sunPHRate === uraCarPark.sunPHRate &&
        existing.sunPHMin === uraCarPark.sunPHMin &&
        existing.parkingSystem === uraCarPark.parkingSystem &&
        existing.location.x === parseFloat(uraCarPark.geometries[0]?.coordinates.split(',')[0]!) &&
        existing.location.y === parseFloat(uraCarPark.geometries[0]?.coordinates.split(',')[1]!)
    );
};