import { UrbanRedevelopmentAuthority } from '~/server/api/external-apis/urban-redevelopment-authority';
import { uraTokenRepository } from '~/server/api/repositories';
import { TRPCError } from '@trpc/server';
import axios from 'axios';
import { 
    AvailabilityCarPark, 
    InformationCarPark, 
    URAAuthenticationResponse 
} from '~/server/api/types/ura-types';

jest.mock('axios');
jest.mock('~/server/api/repositories', () => ({
    uraTokenRepository: {
        findOne: jest.fn(),
        update: jest.fn(),
        save: jest.fn(),
    }
}));

const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockToken = 'mock-token-123';

describe('UrbanRedevelopmentAuthority', () => {
    let uraService: UrbanRedevelopmentAuthority;

    beforeEach(() => {
        jest.clearAllMocks();
        uraService = new UrbanRedevelopmentAuthority();
    });

    describe('initialize', () => {
        it('should use existing valid token', async () => {
            const mockExistingToken = {
                token: mockToken,
                createdAt: new Date(),
            };

            (uraTokenRepository.findOne as jest.Mock).mockResolvedValue(mockExistingToken);

            await uraService.initialize();

            expect(uraTokenRepository.findOne).toHaveBeenCalled();
            expect(mockedAxios.get).not.toHaveBeenCalled();
            expect(uraTokenRepository.update).not.toHaveBeenCalled();
            expect(uraTokenRepository.save).not.toHaveBeenCalled();
        });

        it('should generate new token if existing token is expired', async () => {
            const expiredToken = {
                token: 'expired-token',
                createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours old
            };

            (uraTokenRepository.findOne as jest.Mock).mockResolvedValue(expiredToken);
            mockedAxios.get.mockResolvedValue({
                data: {
                    Status: 'Success',
                    Result: mockToken
                } as URAAuthenticationResponse
            });

            await uraService.initialize();

            expect(uraTokenRepository.findOne).toHaveBeenCalled();
            expect(mockedAxios.get).toHaveBeenCalled();
            expect(uraTokenRepository.update).toHaveBeenCalledWith(mockToken);
        });

        it('should generate new token if no token exists', async () => {
            (uraTokenRepository.findOne as jest.Mock).mockResolvedValue(null);
            mockedAxios.get.mockResolvedValue({
                data: {
                    Status: 'Success',
                    Result: mockToken
                } as URAAuthenticationResponse
            });

            await uraService.initialize();

            expect(uraTokenRepository.findOne).toHaveBeenCalled();
            expect(mockedAxios.get).toHaveBeenCalled();
            expect(uraTokenRepository.save).toHaveBeenCalledWith(mockToken);
        });

        it('should handle failed token generation', async () => {
            (uraTokenRepository.findOne as jest.Mock).mockResolvedValue(null);
            mockedAxios.get.mockResolvedValue({
                data: {
                    Status: 'Failed',
                    Result: ''
                }
            });

            await expect(uraService.initialize()).rejects.toThrow(TRPCError);
        });

        it('should handle network errors during token generation', async () => {
            (uraTokenRepository.findOne as jest.Mock).mockResolvedValue(null);
            mockedAxios.get.mockRejectedValue(new Error('Network error'));

            await expect(uraService.initialize()).rejects.toThrow(TRPCError);
        });
    });

    describe('getCarParkAvailability', () => {
        beforeEach(async () => {
            (uraTokenRepository.findOne as jest.Mock).mockResolvedValue({
                token: mockToken,
                createdAt: new Date()
            });
            await uraService.initialize();
        });

        it('should return car park availability data', async () => {
            const mockAvailabilityData = {
                Status: 'Success',
                Message: 'OK',
                Result: [{
                    carparkNo: 'CP1',
                    lotsAvailable: '50',
                    lotType: 'C',
                    geometries: [{ coordinates: '1.23,103.45' }]
                }]
            };

            mockedAxios.get.mockResolvedValue({
                data: mockAvailabilityData
            });

            const result = await uraService.getCarParkAvailability();

            expect(result[0]).toEqual(expect.objectContaining({
                carparkNo: 'CP1',
                lotsAvailable: 50, // Number after transformation
                lotType: 'C'
            }));
            expect(mockedAxios.get).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    headers: expect.objectContaining({
                        Token: mockToken
                    })
                })
            );
        });

        it('should throw error when request fails', async () => {
            mockedAxios.get.mockRejectedValue(new Error('Network error'));

            await expect(uraService.getCarParkAvailability()).rejects.toThrow(TRPCError);
        });

        it('should throw error when token is missing', async () => {
            uraService = new UrbanRedevelopmentAuthority();

            await expect(uraService.getCarParkAvailability()).rejects.toThrow(
                new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Missing URA Token'
                })
            );
        });

        it('should handle invalid lots available format', async () => {
            const invalidResponse = {
                Status: 'Success',
                Message: 'OK',
                Result: [{
                    carparkNo: 'CP1',
                    lotsAvailable: 'invalid',
                    lotType: 'C',
                    geometries: [{ coordinates: '1.23,103.45' }]
                }]
            };

            mockedAxios.get.mockResolvedValue({
                data: invalidResponse
            });

            await expect(uraService.getCarParkAvailability()).rejects.toThrow();
        });
    });

    describe('getCarParkDetails', () => {
        beforeEach(async () => {
            (uraTokenRepository.findOne as jest.Mock).mockResolvedValue({
                token: mockToken,
                createdAt: new Date()
            });
            await uraService.initialize();
        });

        it('should return car park details data', async () => {
            const mockDetailsResponse = {
                Status: 'Success',
                Message: 'OK',
                Result: [{
                    ppCode: 'CP1',
                    ppName: 'Test Carpark',
                    geometries: [{ coordinates: '1.23,103.45' }],
                    parkingSystem: 'B',
                    parkCapacity: 100,
                    vehCat: 'Car',
                    startTime: '07:00',
                    endTime: '23:00',
                    weekdayRate: '$1.20',
                    weekdayMin: '30 mins',
                    satdayRate: '$1.40',
                    satdayMin: '30 mins',
                    sunPHRate: '$1.50',
                    sunPHMin: '30 mins'
                }]
            };

            mockedAxios.get.mockResolvedValue({
                data: mockDetailsResponse
            });

            const result = await uraService.getCarParkDetails();

            expect(result[0]).toEqual(expect.objectContaining({
                ppCode: 'CP1',
                weekdayRate: 1.20,
                weekdayMin: 30,
                satdayRate: 1.40,
                satdayMin: 30,
                sunPHRate: 1.50,
                sunPHMin: 30
            }));
        });

        it('should throw error when response status is not Success', async () => {
            mockedAxios.get.mockResolvedValue({
                data: {
                    Status: 'Failed',
                    Message: 'Error',
                    Result: []
                }
            });

            await expect(uraService.getCarParkDetails()).rejects.toThrow(
                new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: 'Request to URA failed'
                })
            );
        });

        it('should handle invalid rate format', async () => {
            const invalidResponse = {
                Status: 'Success',
                Message: 'OK',
                Result: [{
                    ppCode: 'CP1',
                    ppName: 'Test Carpark',
                    geometries: [{ coordinates: '1.23,103.45' }],
                    parkingSystem: 'B',
                    parkCapacity: '100',
                    vehCat: 'Car',
                    startTime: '07:00',
                    endTime: '23:00',
                    weekdayRate: 'invalid',
                    weekdayMin: '30 mins',
                    satdayRate: '$1.40',
                    satdayMin: '30 mins',
                    sunPHRate: '$1.50',
                    sunPHMin: '30 mins'
                }]
            };

            mockedAxios.get.mockResolvedValue({
                data: invalidResponse
            });

            await expect(uraService.getCarParkDetails()).rejects.toThrow();
        });

        it('should handle invalid minutes format', async () => {
            const invalidResponse = {
                Status: 'Success',
                Message: 'OK',
                Result: [{
                    ppCode: 'CP1',
                    ppName: 'Test Carpark',
                    geometries: [{ coordinates: '1.23,103.45' }],
                    parkingSystem: 'B',
                    parkCapacity: '100',
                    vehCat: 'Car',
                    startTime: '07:00',
                    endTime: '23:00',
                    weekdayRate: '$1.20',
                    weekdayMin: 'invalid',
                    satdayRate: '$1.40',
                    satdayMin: '30 mins',
                    sunPHRate: '$1.50',
                    sunPHMin: '30 mins'
                }]
            };

            mockedAxios.get.mockResolvedValue({
                data: invalidResponse
            });

            await expect(uraService.getCarParkDetails()).rejects.toThrow();
        });

        it('should handle network errors', async () => {
            mockedAxios.get.mockRejectedValue(new Error('Network error'));

            await expect(uraService.getCarParkDetails()).rejects.toThrow(TRPCError);
        });
    });
});