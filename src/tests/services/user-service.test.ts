// @ts-nocheck

import { TRPCError } from "@trpc/server";
import { UserService } from "~/server/api/services/user-service";
import { User } from "~/server/api/models/user";
import { 
    carParkRepository, 
    parkingHistoryRepository, 
    userRepository,
    userReviewRepository,
    userFavouriteRepository 
} from "~/server/api/repositories";
import clerk from "@clerk/clerk-sdk-node";

// Mock Clerk
jest.mock("@clerk/clerk-sdk-node", () => ({
    users: {
        deleteUser: jest.fn(),
        updateUser: jest.fn()
    }
}));

describe("UserService", () => {
    let userService: UserService;
    const mockUserId = "user-123";
    
    beforeEach(() => {
        jest.clearAllMocks();
        userService = new UserService(
            carParkRepository,
            parkingHistoryRepository,
            userRepository,
            userReviewRepository,
            userFavouriteRepository
        );
    });

    describe("register", () => {
        it("should create a new user if one doesn't exist", async () => {
            const mockEmail = "test@example.com";
            const mockFirstName = "John";
            const mockLastName = "Doe";

            (userRepository.findOneByUserIdOrNull as jest.Mock).mockResolvedValue(null);
            (userRepository.save as jest.Mock).mockResolvedValue(undefined);

            await userService.register(mockUserId, mockFirstName, mockLastName, mockEmail);

            expect(userRepository.save).toHaveBeenCalledWith(
                expect.objectContaining({
                    props: expect.objectContaining({
                        id: mockUserId,
                        email: mockEmail,
                        firstName: mockFirstName,
                        lastName: mockLastName,
                        hasSetName: true,
                        isDarkMode: false,
                        isNotificationsEnabled: true,
                        homeCarParkId: null,
                        workCarParkId: null,
                        deletedAt: null
                    })
                })
            );
        });

        it("should return status 200 if user already exists", async () => {
            const existingUser = new User({ 
                id: mockUserId,
                email: "existing@example.com",
                firstName: "Existing",
                lastName: "User",
                hasSetName: true,
                isDarkMode: false,
                isNotificationsEnabled: true,
                homeCarParkId: null,
                workCarParkId: null,
                createdAt: new Date(),
                updatedAt: new Date(),
                deletedAt: null
            });

            (userRepository.findOneByUserIdOrNull as jest.Mock).mockResolvedValue(existingUser);

            const result = await userService.register(mockUserId, "John", "Doe", "test@example.com");

            expect(result).toEqual({ status: 200 });
            expect(userRepository.save).not.toHaveBeenCalled();
        });
    });

    describe("updateNames", () => {
        it("should update user's first and last names", async () => {
            const mockUser = new User({
                id: mockUserId,
                email: "test@example.com",
                firstName: "Old",
                lastName: "Name",
                hasSetName: true,
                isDarkMode: false,
                isNotificationsEnabled: true,
                homeCarParkId: null,
                workCarParkId: null,
                createdAt: new Date(),
                updatedAt: new Date(),
                deletedAt: null
            });

            (userRepository.findOneByUserId as jest.Mock).mockResolvedValue(mockUser);

            await userService.updateNames(mockUserId, "New", "Name");

            expect(userRepository.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    props: expect.objectContaining({
                        firstName: "New",
                        lastName: "Name"
                    })
                })
            );
        });
    });

    describe("deleteUser", () => {
        it("should delete user and related data", async () => {
            const mockUser = new User({
                id: mockUserId,
                email: "test@example.com",
                firstName: "Test",
                lastName: "User",
                hasSetName: true,
                isDarkMode: false,
                isNotificationsEnabled: true,
                homeCarParkId: null,
                workCarParkId: null,
                createdAt: new Date(),
                updatedAt: new Date(),
                deletedAt: null
            });

            (userRepository.findOneByUserId as jest.Mock).mockResolvedValue(mockUser);
            (clerk.users.deleteUser as jest.Mock).mockResolvedValue(undefined);

            await userService.deleteUser(mockUserId);

            expect(clerk.users.deleteUser).toHaveBeenCalledWith(mockUserId);
            expect(userRepository.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    props: expect.objectContaining({
                        id: mockUserId,
                        deletedAt: expect.any(Date)
                    })
                })
            );
            expect(userReviewRepository.deleteByUserId).toHaveBeenCalledWith(mockUserId);
            expect(parkingHistoryRepository.deleteByUserId).toHaveBeenCalledWith(mockUserId);
            expect(userFavouriteRepository.deleteByUserId).toHaveBeenCalledWith(mockUserId);
        });
    });

    describe("setHomeCarPark", () => {
        it("should set home car park if different from work car park", async () => {
            const mockCarParkId = "carpark-123";
            const mockUser = new User({
                id: mockUserId,
                email: "test@example.com",
                firstName: "Test",
                lastName: "User",
                hasSetName: true,
                isDarkMode: false,
                isNotificationsEnabled: true,
                homeCarParkId: null,
                workCarParkId: "different-carpark",
                createdAt: new Date(),
                updatedAt: new Date(),
                deletedAt: null
            });

            (carParkRepository.findOneById as jest.Mock).mockResolvedValue({});
            (userRepository.findOneByUserId as jest.Mock).mockResolvedValue(mockUser);

            await userService.setHomeCarPark(mockUserId, mockCarParkId);

            expect(userRepository.update).toHaveBeenCalledWith(
                expect.objectContaining({
                    props: expect.objectContaining({
                        homeCarParkId: mockCarParkId
                    })
                })
            );
        });

        it("should throw error if home car park is same as work car park", async () => {
            const mockCarParkId = "carpark-123";
            const mockUser = new User({
                id: mockUserId,
                email: "test@example.com",
                firstName: "Test",
                lastName: "User",
                hasSetName: true,
                isDarkMode: false,
                isNotificationsEnabled: true,
                homeCarParkId: null,
                workCarParkId: mockCarParkId,
                createdAt: new Date(),
                updatedAt: new Date(),
                deletedAt: null
            });

            (carParkRepository.findOneById as jest.Mock).mockResolvedValue({});
            (userRepository.findOneByUserId as jest.Mock).mockResolvedValue(mockUser);

            await expect(userService.setHomeCarPark(mockUserId, mockCarParkId))
                .rejects
                .toThrow(new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Home and work carpark must be different!"
                }));
        });
    });

    describe("getUser", () => {
        it("should return user details with current parking", async () => {
            const mockUser = new User({
                id: mockUserId,
                email: "test@example.com",
                firstName: "Test",
                lastName: "User",
                hasSetName: true,
                isDarkMode: false,
                isNotificationsEnabled: true,
                homeCarParkId: null,
                workCarParkId: null,
                createdAt: new Date(),
                updatedAt: new Date(),
                deletedAt: null
            });

            const mockCurrentParking = { id: "parking-123" };

            (userRepository.findOneByUserId as jest.Mock).mockResolvedValue(mockUser);
            (carParkRepository.findCurrentParkingOrNull as jest.Mock).mockResolvedValue(mockCurrentParking);

            const result = await userService.getUser(mockUserId);

            expect(result).toEqual({
                ...mockUser.getValue(),
                currentParking: mockCurrentParking
            });
        });
    });

    describe("updatePassword", () => {
        it("should update user password through Clerk", async () => {
            const mockPassword = "newPassword123";
            (clerk.users.updateUser as jest.Mock).mockResolvedValue(undefined);

            await userService.updatePassword(mockUserId, mockPassword);

            expect(clerk.users.updateUser).toHaveBeenCalledWith(mockUserId, {
                password: mockPassword
            });
        });

        it("should handle Clerk API errors", async () => {
            const mockError = {
                errors: [{ message: "Invalid password format" }]
            };
            (clerk.users.updateUser as jest.Mock).mockRejectedValue(mockError);

            await expect(userService.updatePassword(mockUserId, "weak"))
                .rejects
                .toThrow(new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Invalid password format"
                }));
        });
    });
});