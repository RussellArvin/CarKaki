import { jest } from '@jest/globals';

// Mock all repositories
jest.mock('~/server/api/repositories', () => ({
    carParkRepository: {
        findAll: jest.fn(),
        save: jest.fn(),
        saveMany: jest.fn(),
        updateMany: jest.fn(),
        update: jest.fn(),
        isFavouritedByUser: jest.fn(),
        findNearByCarParks: jest.fn(),
        findOneByLocation: jest.fn(),
        findOneById: jest.fn(),
        findSavedCarParks: jest.fn(),
        findCurrentParkingOrNull: jest.fn(),
        findUserParkingHistory: jest.fn(),
        findUserFavourites: jest.fn(),
    },
    carParkRateRepository: {
        save: jest.fn(),
        saveMany: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
        findOneByCarParkId: jest.fn(),
        findAll: jest.fn(),
        findAllByCarParkId: jest.fn(),
    },
    parkingHistoryRepository: {
        save: jest.fn(),
        update: jest.fn(),
        deleteByUserId: jest.fn(),
        findFrequentlyVisited: jest.fn(),
        findManyByUserId: jest.fn(),
        findExistingByUserIdOrNull: jest.fn(),
        findExistingByUserIdAndCarParkId: jest.fn(),
        findManyByUserIdAndCarParkId: jest.fn(),
    },
    requestLogRepository: {
        save: jest.fn(),
        findLatestRequestOrNull: jest.fn(),
    },
    uraTokenRepository: {
        findOne: jest.fn(),
        update: jest.fn(),
        save: jest.fn(),
    },
    userRepository: {
        save: jest.fn(),
        update: jest.fn(),
        findOneByUserIdOrNull: jest.fn(),
        findOneByUserId: jest.fn(),
    },
    userFavouriteRepository: {
        save: jest.fn(),
        deleteByUserId: jest.fn(),
        findOneByCarParkAndUserIdOrNull: jest.fn(),
        findManyByUserId: jest.fn(),
        update: jest.fn(),
    },
    userReviewRepository: {
        save: jest.fn(),
        update: jest.fn(),
        deleteByUserId: jest.fn(),
        findManyByCarParkId: jest.fn(),
        findOneByUserIdAndCarParkIdOrNull: jest.fn(),
    }
}));

// Mock database
jest.mock('drizzle-orm/neon-http', () => ({
    NeonHttpDatabase: jest.fn()
}));

// Mock axios for API calls
jest.mock('axios');

// Reset all mocks before each test
beforeEach(() => {
    jest.clearAllMocks();
});

// Mock environment variables
process.env = {
    ...process.env,
    DATABASE_URL: process.env.TESTING_DATABASE_URL,
    URA_ACCESS_KEY: 'mock-access-key',
};