import { URARequestService } from '~/server/api/services/ura-request-service';
import { 
    mockUraCarPark, 
    mockExistingRate 
} from './mock-data';
import { carParkRateRepository, carParkRepository, requestLogRepository } from '~/server/api/repositories';

describe('Rate Comparison', () => {
    let uraRequestService : URARequestService;

    beforeEach(() => {
        jest.clearAllMocks();
        uraRequestService = new URARequestService(
            carParkRepository,
            carParkRateRepository,
            requestLogRepository
        );
    });


    describe('areRatesIdentical', () => {
        it('should return true when rates are identical', () => {
            const result = uraRequestService.areRatesIdentical(
                mockExistingRate, 
                mockUraCarPark
            );
            expect(result).toBe(true);
        });

        it('should return false when weekday rate differs', () => {
            const differentRate = {
                ...mockUraCarPark,
                weekdayRate: 2.00
            };
            const result = uraRequestService.areRatesIdentical(
                mockExistingRate, 
                differentRate
            );
            expect(result).toBe(false);
        });

    });
});