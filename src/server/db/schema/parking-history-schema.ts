import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { createdAt, updatedAt } from "./schema-constants";
import userSchema from "./user-schema";

const parkingHistorySchema = pgTable(
    "parking_history",
    {
      id:text("id").primaryKey(),
      startDate: timestamp("start_date").notNull(),
      endDate: timestamp("end_date"),
      carParkId: uuid("car_park_id").notNull(),
      userId: uuid("user_id").notNull(),
      createdAt,
      updatedAt,
    }
);

export default parkingHistorySchema