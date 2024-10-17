import { db } from "~/server/db";
import { UserRepository } from "./user-repository";
import { CarParkRepository } from "./car-park-repository";
import { RequestLogRepository } from "./request-log-repository";
import { ParkingHistoryRepository } from "./parking-history-repository";
import { URATokenRepository } from "./ura-token-repository";
import { CarParkRateRepository } from "./car-park-rate-repository";

export const userRepository = new UserRepository(db)
export const carParkRepository = new CarParkRepository(db);
export const requestLogRepository = new RequestLogRepository(db);
export const parkingHistoryRepository = new ParkingHistoryRepository(db);
export const uraTokenRepository = new URATokenRepository(db)
export const carParkRateRepository = new CarParkRateRepository(db)