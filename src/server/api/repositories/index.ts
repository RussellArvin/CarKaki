import { db } from "~/server/db";
import { UserRepository } from "./user-repository";
import { CarParkRepository } from "./car-park-repository";

export const userRepository = new UserRepository(db)
export const carParkRepository = new CarParkRepository(db);