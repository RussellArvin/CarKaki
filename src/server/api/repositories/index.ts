import { db } from "~/server/db";
import { UserRepository } from "./user-repository";
import { CarParkRepository } from "./car-park-repository";
import { RequestLogRepository } from "./request-log-repository";
import { ParkingHistoryRepository } from "./parking-history-repository";

export const userRepository = new UserRepository(db)
export const carParkRepository = new CarParkRepository(db);
export const requestLogRepository = new RequestLogRepository(db);
export const parkingHistoryRepository = new ParkingHistoryRepository(db);