import { URARequestService } from '~/server/api/services/ura-request-service';
import { mockUraCarPark, mockExistingCarPark } from './mock-data'
import { 
    carParkRateRepository, 
    carParkRepository, 
    requestLogRepository 
} from '~/server/api/repositories';
import VehicleCategory from '~/server/api/types/vehicle-category';
import { InformationCarPark } from '~/server/api/types/ura-types';


describe('CarPark Comparison', () => {
    let uraRequestService: URARequestService;

    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();
        
        uraRequestService = new URARequestService(
            carParkRepository,
            carParkRateRepository,
            requestLogRepository
        );
    });

    describe('areCarParksIdentical', () => {
        it('should return true when carparks are identical', () => {
            const result = uraRequestService.areCarParksIdentical(
                mockExistingCarPark, 
                mockUraCarPark
            );
            expect(result).toBe(true);
        });

        it('should return false when capacity differs', () => {
            const differentCapacity = {
                ...mockUraCarPark,
                parkCapacity: 200
            };
            const result = uraRequestService.areCarParksIdentical(
                mockExistingCarPark, 
                differentCapacity
            );
            expect(result).toBe(false);
        });

        it('should return false when vehicle category differs', () => {
            const differentCategory: InformationCarPark = {
                ...mockUraCarPark,
                vehCat: 'Motorcycle'
            };
            const result = uraRequestService.areCarParksIdentical(
                mockExistingCarPark, 
                differentCategory
            );
            expect(result).toBe(false);
        });
    });
});