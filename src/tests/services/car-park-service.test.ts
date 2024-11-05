import { TRPCError } from "@trpc/server";
import { CarParkService } from "~/server/api/services/car-park-service";
import { 
    carParkRepository,
    parkingHistoryRepository,
    userFavouriteRepository,
    userReviewRepository
} from "~/server/api/repositories";
import { CarPark } from "~/server/api/models/car-park";
import { ParkingHistory } from "~/server/api/models/parking-history";
import { UserReview } from "~/server/api/models/user-review";
import { UserFavourite } from "~/server/api/models/user-favourite";
import { GoogleMap } from "~/server/api/external-apis/google-maps";
import { uraRequestService } from "~/server/api/services";

// Mock external services
jest.mock("~/server/api/external-apis/google-maps", () => ({
    GoogleMap: {
        getAddressFromCoordinates: jest.fn()
    }
}));

jest.mock("~/server/api/services", () => ({
    uraRequestService: {
        checkAndMakeRequests: jest.fn()
    }
}));

describe("CarParkService", () => {
    let carParkService: CarParkService;
    const mockUserId = "user-123";
    const mockCarParkId = "carpark-123";

    beforeEach(() => {
        jest.clearAllMocks();
        carParkService = new CarParkService(
            carParkRepository,
            parkingHistoryRepository,
            userFavouriteRepository,
            userReviewRepository
        );
        (GoogleMap.getAddressFromCoordinates as jest.Mock).mockResolvedValue("123 Test St");
        (uraRequestService.checkAndMakeRequests as jest.Mock).mockResolvedValue(undefined);
    });

    describe("getDetails", () => {
        it("should return car park details with address", async () => {
            const mockLocation = { x: 1, y: 1 };
            const mockCarPark = new CarPark({
                id: mockCarParkId,
                name: "Test CarPark",
                address: null,
                capacity: 100,
                availableLots: 50,
                location: mockLocation,
                vehicleCategory: "Car",
                parkingSystem: "B",
                createdAt: new Date(),
                updatedAt: new Date(),
                code:"123123"
            });

            (carParkRepository.findOneByLocation as jest.Mock).mockResolvedValue(mockCarPark);

            const result = await carParkService.getDetails(mockLocation, 0);

            expect(result).toEqual({
                id: mockCarParkId,
                name: "Test CarPark",
                address: "123 Test St",
                capacity: 100,
                availableLots: 50,
                location: mockLocation
            });
            expect(carParkRepository.update).toHaveBeenCalled();
            expect(uraRequestService.checkAndMakeRequests).toHaveBeenCalled();
        });
    });

    describe("getFullDetails", () => {
        it("should return full car park details with nearby parks and reviews", async () => {
            const mockLocation = { x: 1, y: 1 };
            const mockCarPark = new CarPark({
                id: mockCarParkId,
                name: "Test CarPark",
                address: null,
                capacity: 100,
                availableLots: 50,
                location: mockLocation,
                vehicleCategory: "Car",
                parkingSystem: "B",
                createdAt: new Date(),
                updatedAt: new Date(),
                code:"123123"
            });

            const mockNearbyCarPark = new CarPark({
                id: "nearby-123",
                name: "Nearby CarPark",
                address: "456 Near St",
                capacity: 80,
                availableLots: 30,
                location: { x: 1.1, y: 1.1 },
                vehicleCategory: "Car",
                parkingSystem: "B",
                createdAt: new Date(),
                updatedAt: new Date(),
                code:"123123"
            });

            const mockReviews = [{
                userId: "user-1",
                rating: 4,
                description: "Great"
            }];

            (carParkRepository.findOneById as jest.Mock).mockResolvedValue(mockCarPark);
            (carParkRepository.findNearByCarParks as jest.Mock).mockResolvedValue([mockNearbyCarPark]);
            (carParkRepository.isFavouritedByUser as jest.Mock).mockResolvedValue(true);
            (userReviewRepository.findManyByCarParkId as jest.Mock).mockResolvedValue(mockReviews);

            const result = await carParkService.getFullDetails(mockUserId, mockCarParkId);

            expect(result).toEqual({
                id: mockCarParkId,
                name: "Test CarPark",
                address: "123 Test St",
                capacity: 100,
                availableLots: 50,
                location: mockLocation,
                isFavourited: true,
                nearByCarParks: [{
                    id: "nearby-123",
                    name: "Nearby CarPark",
                    address: "456 Near St",
                    capacity: 80,
                    availableLots: 30,
                    location: { x: 1.1, y: 1.1 }
                }],
                reviews: mockReviews
            });
        });
    });

    describe("startParking", () => {
        it("should create new parking record", async () => {
            const mockCarPark = new CarPark({
                id: mockCarParkId,
                name: "Test CarPark",
                address: "123 Test St",
                capacity: 100,
                availableLots: 50,
                location: { x: 1, y: 1 },
                vehicleCategory: "Car",
                parkingSystem: "B",
                createdAt: new Date(),
                updatedAt: new Date(),
                code:"123123"
            });

            (carParkRepository.findOneById as jest.Mock).mockResolvedValue(mockCarPark);
            (parkingHistoryRepository.findExistingByUserIdOrNull as jest.Mock).mockResolvedValue(null);

            await carParkService.startParking(mockUserId, mockCarParkId);

            expect(parkingHistoryRepository.save).toHaveBeenCalledWith(
                expect.objectContaining({
                    props: expect.objectContaining({
                        userId: mockUserId,
                        carParkId: mockCarParkId,
                        endDate: null
                    })
                })
            );
        });

        it("should throw error if user has ongoing parking", async () => {
            const existingParking = new ParkingHistory({
                id: "parking-123",
                userId: mockUserId,
                carParkId: mockCarParkId,
                startDate: new Date(),
                endDate: null,
                createdAt: new Date(),
                updatedAt: new Date(),
                deletedAt: null
            });

            (parkingHistoryRepository.findExistingByUserIdOrNull as jest.Mock).mockResolvedValue(existingParking);

            await expect(carParkService.startParking(mockUserId, mockCarParkId))
                .rejects
                .toThrow(new TRPCError({
                    code: "BAD_REQUEST",
                    message: "You have an ongoing parking record"
                }));
        });
    });

    describe("setFavourite", () => {
        it("should create new favourite record", async () => {
            (userFavouriteRepository.findOneByCarParkAndUserIdOrNull as jest.Mock).mockResolvedValue(null);

            await carParkService.setFavourite(mockUserId, mockCarParkId, true);

            expect(userFavouriteRepository.save).toHaveBeenCalledWith(
                expect.objectContaining({
                    props: expect.objectContaining({
                        userId: mockUserId,
                        carParkId: mockCarParkId,
                        deletedAt: null
                    })
                })
            );
        });

        it("should delete existing favourite record", async () => {
            const existingFavourite = new UserFavourite({
                id: "fav-123",
                userId: mockUserId,
                carParkId: mockCarParkId,
                createdAt: new Date(),
                deletedAt: null
            });

            (userFavouriteRepository.findOneByCarParkAndUserIdOrNull as jest.Mock).mockResolvedValue(existingFavourite);

            await carParkService.setFavourite(mockUserId, mockCarParkId, false);

            expect(userFavouriteRepository.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    props: expect.objectContaining({
                        deletedAt: expect.any(Date)
                    })
                })
            );
        });

        it("should throw error when trying to favourite already favourited car park", async () => {
            const existingFavourite = new UserFavourite({
                id: "fav-123",
                userId: mockUserId,
                carParkId: mockCarParkId,
                createdAt: new Date(),
                deletedAt: null
            });

            (userFavouriteRepository.findOneByCarParkAndUserIdOrNull as jest.Mock).mockResolvedValue(existingFavourite);

            await expect(carParkService.setFavourite(mockUserId, mockCarParkId, true))
                .rejects
                .toThrow(new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Car park already favourited by user"
                }));
        });
    });

    describe("createReview", () => {
        it("should create new review", async () => {
            const mockCarPark = new CarPark({
                id: mockCarParkId,
                name: "Test CarPark",
                address: "123 Test St",
                capacity: 100,
                availableLots: 50,
                location: { x: 1, y: 1 },
                vehicleCategory: "Car",
                parkingSystem: "B",
                createdAt: new Date(),
                updatedAt: new Date(),
                code:"123123"
            });

            (carParkRepository.findOneById as jest.Mock).mockResolvedValue(mockCarPark);
            (userReviewRepository.findOneByUserIdAndCarParkIdOrNull as jest.Mock).mockResolvedValue(null);

            await carParkService.createReview(mockUserId, mockCarParkId, 5, "Great parking!");

            expect(userReviewRepository.save).toHaveBeenCalledWith(
                expect.objectContaining({
                    props: expect.objectContaining({
                        userId: mockUserId,
                        carParkId: mockCarParkId,
                        rating: 5,
                        description: "Great parking!",
                        deletedAt: null
                    })
                })
            );
        });

        it("should throw error if user already reviewed the car park", async () => {
            const existingReview = new UserReview({
                userId: mockUserId,
                carParkId: mockCarParkId,
                rating: 4,
                description: "Nice",
                createdAt: new Date(),
                updatedAt: new Date(),
                deletedAt: null
            });

            (userReviewRepository.findOneByUserIdAndCarParkIdOrNull as jest.Mock).mockResolvedValue(existingReview);

            await expect(carParkService.createReview(mockUserId, mockCarParkId, 5, "Great!"))
                .rejects
                .toThrow(new TRPCError({
                    code: "BAD_REQUEST",
                    message: "You have already written a review for this car park"
                }));
        });
    });
});