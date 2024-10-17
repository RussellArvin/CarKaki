import { UrbanRedevelopmentAuthority } from "../external-apis/urban-redevelopment-authority";
import { CarPark } from "../models/car-park";
import { CarParkRate } from "../models/car-park-rate";
import { RequestLog } from "../models/request-log";
import { carParkRateRepository, carParkRepository, requestLogRepository } from "../repositories"
import Location from "../types/location";
import { AvailabilityCarPark, InformationCarPark } from "../types/ura-types";
import { v4 as uuidv4 } from 'uuid';

export const checkAndMakeURARequests = async () => {
    await handleInformationRequest();
    //return Promise.all([handleAvailabilityRequest, handleInformationRequest]);
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

const chunkArray = <T>(array: T[], size: number): T[][] => {
    const result: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      result.push(array.slice(i, i + size));
    }
    return result;
  };

const handleInformationRequest = async () => {
    const latestRequest = await requestLogRepository.findLatestRequestOrNull("INFO");
    if(!canMakeRequest(latestRequest)) return;

    console.log("A Request was made")

    const ura = new UrbanRedevelopmentAuthority();
    await ura.initialize()
    const [uraData, carparks, carParkRates] = await Promise.all([
        await ura.getCarParkDetails(),
        await carParkRepository.findAll(),
        await carParkRateRepository.findAll()
    ])
    const {
        updatedCarParks, newCarParks, updatedCarParkRates, newCarParkRates
    } = mappingInformationRequest(uraData,carparks,carParkRates);

    console.log("Length of updated CarParks, ",updatedCarParks.length);
    console.log("Length of new Carparks", newCarParks.length);
    console.log("Length of updated Car Park Rates ", updatedCarParkRates.length);
    console.log("Length of new car park rates ", newCarParkRates.length)

    
    const newCarParksChunks = chunkArray(newCarParks, 500);
    const newCarParkRatesChunks = chunkArray(newCarParkRates, 500);
    
    // Create functions that will generate the promises when called
    const generateCarParkPromises = () => [
        ...newCarParksChunks.map(chunk => () => carParkRepository.saveMany(chunk)),
        ...updatedCarParks.map(carpark => () => carParkRepository.update(carpark))
    ];
    
    const generateRatePromises = () => [
        ...newCarParkRatesChunks.map(chunk => () => carParkRateRepository.saveMany(chunk)),
        ...updatedCarParkRates.map(rate => () => carParkRateRepository.update(rate))
    ];
    
    const newRequest = new RequestLog({
        id:uuidv4(),
        type:"INFO",
        createdAt: new Date(),
    });
    
    const saveRequestLog = () => requestLogRepository.save(newRequest);

    // Execute the promises only when you're ready
     await Promise.all(generateCarParkPromises().map(fn => fn()));
     await Promise.all([...generateRatePromises().map(fn => fn()), saveRequestLog()]);

    
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
    existingCarParks: CarPark[],
    existingCarParkRates: CarParkRate[],
): { updatedCarParks: CarPark[], newCarParks: CarPark[], updatedCarParkRates: CarParkRate[], newCarParkRates: CarParkRate[] } => {
    console.log(`Processing ${uraData.length} URA car parks`);
    console.log(`Existing car parks: ${existingCarParks.length}`);
    console.log(`Existing car park rates: ${existingCarParkRates.length}`);

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

    uraData.forEach((uraCarPark, index) => {
        console.log(`Processing URA car park ${index + 1}/${uraData.length}: ${uraCarPark.ppCode}`);
        
        const existingCarpark = existingCarParksMap.get(uraCarPark.ppCode);
        
        if (existingCarpark) {
            console.log(`Existing car park found for ${uraCarPark.ppCode}`);
            if (!areCarParksIdentical(existingCarpark, uraCarPark)) {
                const updatedCarPark = createUpdatedCarparkFromUra(existingCarpark, uraCarPark);
                if (updatedCarPark) {
                    updatedCarParks.push(updatedCarPark);
                    console.log(`Updated car park: ${updatedCarPark.getValue().code}`);
                    
                    const existingRate = existingCarParkRatesMap.get({
                        id:updatedCarPark.getValue().id,
                        min:uraCarPark.satdayMin
                    });
                    if (existingRate) {
                        console.log(`Existing rate found for car park ${updatedCarPark.getValue().code}`);
                        console.log('Existing rate:', JSON.stringify(existingRate.getValue()));
                        console.log('URA car park data:', JSON.stringify(uraCarPark));
                        
                        if (!areRatesIdentical(existingRate, uraCarPark)) {
                            console.log('Rates are not identical. Creating updated rate.');
                            const updatedRate = createUpdatedRateFromUra(existingRate, uraCarPark);
                            updatedCarParkRates.push(updatedRate);
                            console.log(`Updated rate for car park ${updatedCarPark.getValue().code}: ${updatedRate.getValue().id}`);
                        } else {
                            console.log('Rates are identical. No update needed.');
                        }
                    } else {
                        console.log(`No existing rate found for car park ${updatedCarPark.getValue().code}. Creating new rate.`);
                        const newRate = createNewRateFromUra(updatedCarPark.getValue().id, uraCarPark);
                        newCarParkRates.push(newRate);
                        console.log(`Created new rate for existing car park ${updatedCarPark.getValue().code}: ${newRate.getValue().id}`);
                    }
                }
            } else {
                console.log(`Car park ${uraCarPark.ppCode} is identical. No update needed.`);
            }
        } else {
            console.log(`New car park found: ${uraCarPark.ppCode}`);
            const newCarPark = createNewCarparkFromUra(uraCarPark);
            if (newCarPark) {
                newCarParks.push(newCarPark);
                console.log(`Created new car park: ${newCarPark.getValue().code}`);
                const newRate = createNewRateFromUra(newCarPark.getValue().id, uraCarPark);
                newCarParkRates.push(newRate);
                console.log(`Created new rate for new car park ${newCarPark.getValue().code}: ${newRate.getValue().id}`);
            }
        }
    });

    console.log(`Processing complete. Results:`);
    console.log(`Updated car parks: ${updatedCarParks.length}`);
    console.log(`New car parks: ${newCarParks.length}`);
    console.log(`Updated car park rates: ${updatedCarParkRates.length}`);
    console.log(`New car park rates: ${newCarParkRates.length}`);

    return { updatedCarParks, newCarParks, updatedCarParkRates, newCarParkRates };
};


//DONT ADD THIS INTO THE CLASS DIAGRAM
const areRatesIdentical = (existingRate: CarParkRate, uraCarPark: InformationCarPark): boolean => {
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
    
    console.log(`Rates identical: ${isIdentical}`);
    if (!isIdentical) {
        console.log('Differences:');
        if (existing.startTime !== uraCarPark.startTime) console.log(`startTime: ${existing.startTime} vs ${uraCarPark.startTime}`);
        if (existing.endTime !== uraCarPark.endTime) console.log(`endTime: ${existing.endTime} vs ${uraCarPark.endTime}`);
        if (existing.weekDayRate !== uraCarPark.weekdayRate) console.log(`weekDayRate: ${existing.weekDayRate} vs ${uraCarPark.weekdayRate}`);
        if (existing.weekDayMin !== uraCarPark.weekdayMin) console.log(`weekDayMin: ${existing.weekDayMin} vs ${uraCarPark.weekdayMin}`);
        if (existing.satRate !== uraCarPark.satdayRate) console.log(`satRate: ${existing.satRate} vs ${uraCarPark.satdayRate}`);
        if (existing.satMin !== uraCarPark.satdayMin) console.log(`satMin: ${existing.satMin} vs ${uraCarPark.satdayMin}`);
        if (existing.sunPHRate !== uraCarPark.sunPHRate) console.log(`sunPHRate: ${existing.sunPHRate} vs ${uraCarPark.sunPHRate}`);
        if (existing.sunPHMin !== uraCarPark.sunPHMin) console.log(`sunPHMin: ${existing.sunPHMin} vs ${uraCarPark.sunPHMin}`);
    }
    
    return isIdentical;
};

const createUpdatedRateFromUra = (existingRate: CarParkRate, uraCarPark: InformationCarPark): CarParkRate => {
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
};

const createNewRateFromUra = (carParkId: string, uraCarPark: InformationCarPark): CarParkRate => {
    return new CarParkRate({
        id: uuidv4(), // Ensure this is a new, unique ID
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
};


const createUpdatedCarparkFromUra = (
    existingCarPark: CarPark,
    uraCarPark: InformationCarPark
): CarPark | null => {
    const coordinates = uraCarPark.geometries[0]?.coordinates;
    const updatedLocation = coordinates ? formatLocation(coordinates, existingCarPark.getValue().location) : existingCarPark.getValue().location;

    if (!updatedLocation) return null;

    return new CarPark({
        ...existingCarPark.getValue(),
        vehicleCategory: uraCarPark.vehCat,
        parkingSystem: uraCarPark.parkingSystem,
        location: updatedLocation,
    });
};

const createNewCarparkFromUra = (uraCarPark: InformationCarPark): CarPark | null  => {
    const currentDate = new Date();
    const coordinates = uraCarPark.geometries[0]?.coordinates;
    const location = coordinates ? formatLocation(coordinates, null) : null;
    if(!location) return null;

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
};

const formatLocation = (coordinates: string, existingLocation: Location | null) => {
    if (!coordinates) {
        // Fallback if coordinates are not defined
        return existingLocation;
    }

    const segments = coordinates.split(',');
    if (segments.length < 2) {
        // Fallback if split doesn't return enough data
        return existingLocation;
    }

    return {
        x: parseFloat(segments[0]!),
        y: parseFloat(segments[1]!)
    };
};

const areCarParksIdentical = (existingCarPark: CarPark, uraCarPark: InformationCarPark): boolean => {
    const coordinates = uraCarPark.geometries[0]?.coordinates;
    if (!coordinates) return false;

    const existing = existingCarPark.getValue();
    const coordSegments = coordinates.split(',');

    return (
        existing.vehicleCategory === uraCarPark.vehCat &&
        existing.parkingSystem === uraCarPark.parkingSystem &&
        existing.location.x === parseFloat(coordSegments[0]!) &&
        existing.location.y === parseFloat(coordSegments[1]!)
    );
};
