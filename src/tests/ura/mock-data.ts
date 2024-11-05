import { CarPark } from "~/server/api/models/car-park";
import { CarParkRate } from "~/server/api/models/car-park-rate";
import { AvailabilityCarPark, InformationCarPark } from "~/server/api/types/ura-types";
import Location from "~/server/api/types/location";
import VehicleCategory from "~/server/api/types/vehicle-category";
import ParkingSystem from "~/server/api/types/parking-system";

export const mockLocation: Location = {
    x: 25,
    y: 25,
};

export const mockUraCarPark: InformationCarPark = {
    ppCode: 'TEST1',
    ppName: 'Test Carpark',
    weekdayRate: 1.20,
    weekdayMin: 30,
    satdayRate: 1.40,
    satdayMin: 30,
    sunPHRate: 1.50,
    sunPHMin: 30,
    startTime: '07:00',
    endTime: '22:00',
    parkingSystem: 'C',  // Match your ParkingSystem enum/type
    parkCapacity: 100,
    vehCat: 'Car',  // Match your VehicleCategory enum/type
    geometries: [{
        coordinates: '1.3,103.8'
    }]
};

export const mockExistingCarPark = new CarPark({
    id: 'existing-id',
    code: 'TEST1',
    name: 'Test Carpark',
    address: null,
    vehicleCategory: 'Car',  // Match your VehicleCategory enum/type
    parkingSystem: 'C',  // Match your ParkingSystem enum/type
    capacity: 100,
    availableLots: 0,
    location: mockLocation,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
});

export const mockExistingRate = new CarParkRate({
    id: 'existing-rate-id',
    carParkId: 'existing-id',
    startTime: '07:00',
    endTime: '22:00',
    weekDayRate: 1.20,
    weekDayMin: 30,
    satRate: 1.40,
    satMin: 30,
    sunPHRate: 1.50,
    sunPHMin: 30,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
});


export const mockAvailabilityData: AvailabilityCarPark[] = [
    {
        lotsAvailable: 50,
        lotType: "C",
        carparkNo: "TEST1",
        geometries: [{
            coordinates: "1.3,103.8"
        }]
    }
];