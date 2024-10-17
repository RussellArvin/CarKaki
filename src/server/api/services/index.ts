import { carParkRateRepository, carParkRepository } from "../repositories";
import { CarParkService } from "./car-park-service";

export const carParkService = new CarParkService(carParkRateRepository,carParkRepository)