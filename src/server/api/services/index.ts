import { carParkRateRepository, carParkRepository, requestLogRepository } from "../repositories";
import { CarParkService } from "./car-park-service";
import { URARequestService } from "./ura-request-service";

export const carParkService = new CarParkService(carParkRateRepository,carParkRepository)
export const uraRequestService = new URARequestService(carParkRepository,carParkRateRepository,requestLogRepository)