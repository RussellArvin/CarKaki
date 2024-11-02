import { carParkRateRepository, carParkRepository, parkingHistoryRepository, requestLogRepository, userFavouriteRepository, userRepository, userReviewRepository } from "../repositories";
import { CarParkRateService } from "./car-park-rate-service";
import { CarParkService } from "./car-park-service";
import { URARequestService } from "./ura-request-service";
import { UserService } from "./user-service";

export const carParkService = new CarParkService(carParkRepository,parkingHistoryRepository,userFavouriteRepository,userReviewRepository);
export const uraRequestService = new URARequestService(carParkRepository,carParkRateRepository,requestLogRepository)
export const userService = new UserService(carParkRepository,parkingHistoryRepository,userRepository,userReviewRepository,userFavouriteRepository);
export const carParkRateService = new CarParkRateService(carParkRateRepository)