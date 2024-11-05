import { URARequestService } from '~/server/api/services/ura-request-service';
import { 
    mockUraCarPark, 
    mockExistingCarPark, 
    mockExistingRate 
} from './mock-data'
import { carParkRateRepository, carParkRepository, requestLogRepository } from '~/server/api/repositories';

describe('mappingInformationRequest', () => {
    let uraRequestService : URARequestService;

    beforeEach(() => {
        jest.clearAllMocks();
        uraRequestService = new URARequestService(
            carParkRepository,
            carParkRateRepository,
            requestLogRepository
        );
    });

    it('should process empty URA data without changes', () => {
        const result = uraRequestService.mappingInformationRequest([], [], []);
        
        expect(result).toEqual({
            updatedCarParks: [],
            newCarParks: [],
            updatedCarParkRates: [],
            newCarParkRates: []
        });
    });

    it('should create new carpark and rate when processing new URA data', () => {
        const result = uraRequestService.mappingInformationRequest(
            [mockUraCarPark],
            [],
            []
        );

        expect(result.newCarParks).toHaveLength(1);
        expect(result.newCarParkRates).toHaveLength(1);
        expect(result.updatedCarParks).toHaveLength(0);
        expect(result.updatedCarParkRates).toHaveLength(0);
    });

});