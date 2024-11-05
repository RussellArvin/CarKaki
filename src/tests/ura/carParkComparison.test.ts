import { URARequestService } from '~/server/api/services/ura-request-service';
import { mockExistingCarPark } from './mock-data';
import { 
    carParkRateRepository, 
    carParkRepository, 
    requestLogRepository 
} from '~/server/api/repositories';
import { AvailabilityCarPark } from '~/server/api/types/ura-types';
import { CarPark } from '~/server/api/models/car-park';

describe('Availability Mapping', () => {
    let uraRequestService: URARequestService;
    
    const mockAvailabilityData: AvailabilityCarPark[] = [
        {
            lotsAvailable: 50,
            lotType: "C",
            carparkNo: "TEST1",
            geometries: [{
                coordinates: "1.3,103.8"
            }]
        },
        {
            lotsAvailable: 30,
            lotType: "C",
            carparkNo: "TEST2",
            geometries: [{
                coordinates: "1.4,103.9"
            }]
        }
    ];

    const mockExistingCarPark2 = new CarPark({
        ...mockExistingCarPark.getValue(),
        id: 'existing-id-2',
        code: 'TEST2',
        availableLots: 40
    });

    beforeEach(() => {
        jest.clearAllMocks();
        uraRequestService = new URARequestService(
            carParkRepository,
            carParkRateRepository,
            requestLogRepository
        );
    });

    describe('mappingAvailabilityRequest', () => {
        it('should update carparks when available lots differ', () => {
            const existingCarParks = [
                mockExistingCarPark,
                mockExistingCarPark2
            ];

            const result = uraRequestService.mappingAvailabilityRequest(
                mockAvailabilityData,
                existingCarParks
            );

            // Verify we got updates
            expect(result).toHaveLength(2);
            
            // Find the updated carparks
            const updatedCarPark1 = result.find(cp => cp.getValue().code === 'TEST1');
            const updatedCarPark2 = result.find(cp => cp.getValue().code === 'TEST2');

            // Assert with type safety
            expect(updatedCarPark1).toBeDefined();
            expect(updatedCarPark2).toBeDefined();

            if (updatedCarPark1 && updatedCarPark2) {
                expect(updatedCarPark1.getValue().availableLots).toBe(50);
                expect(updatedCarPark2.getValue().availableLots).toBe(30);
            }
        });

        it('should not update carparks when available lots are the same', () => {
            const sameLotsCarPark1 = new CarPark({
                ...mockExistingCarPark.getValue(),
                availableLots: 50
            });
            const sameLotsCarPark2 = new CarPark({
                ...mockExistingCarPark2.getValue(),
                availableLots: 30
            });

            const result = uraRequestService.mappingAvailabilityRequest(
                mockAvailabilityData,
                [sameLotsCarPark1, sameLotsCarPark2]
            );

            expect(result).toHaveLength(0);
        });

        it('should handle carparks not found in existing data', () => {
            const result = uraRequestService.mappingAvailabilityRequest(
                mockAvailabilityData,
                [mockExistingCarPark] // only TEST1
            );

            expect(result).toHaveLength(1);
            
            const updatedCarPark = result[0];
            expect(updatedCarPark).toBeDefined();
            
            if (updatedCarPark) {
                const carParkData = updatedCarPark.getValue();
                expect(carParkData.code).toBe('TEST1');
                expect(carParkData.availableLots).toBe(50);
            }
        });

        it('should handle empty URA data', () => {
            const result = uraRequestService.mappingAvailabilityRequest(
                [],
                [mockExistingCarPark, mockExistingCarPark2]
            );

            expect(result).toHaveLength(0);
        });

        it('should handle empty existing carparks', () => {
            const result = uraRequestService.mappingAvailabilityRequest(
                mockAvailabilityData,
                []
            );

            expect(result).toHaveLength(0);
        });
    });
});