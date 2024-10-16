import carParkRateSchema from "./car-park-rate-schema";
import carParkSchema, { vehicleCategoryEnum, parkingSystemEnum } from "./car-park-schema";
import parkingHistorySchema from "./parking-history-schema";
import requestLogSchema, { requestTypeEnum } from "./request-log-schema";
import uraTokenSchema from "./ura-token-schema";
import userFavouriteSchema from "./user-favourite-schema";
import userReviewSchema from "./user-review-schema";
import userSchema from "./user-schema";

export const carPark = carParkSchema;
export const parkingHistory = parkingHistorySchema;
export const requestLog = requestLogSchema;
export const uraToken = uraTokenSchema;
export const userFavourite = userFavouriteSchema;
export const userReview = userReviewSchema;
export const user = userSchema;
export const carParkRate = carParkRateSchema;

//ENUMS
export const vehicleCategory = vehicleCategoryEnum
export const parkingSystem = parkingSystemEnum;
export const requestType = requestTypeEnum;