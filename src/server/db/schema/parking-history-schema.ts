import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { CURRENT_TIMESTAMP } from "./schema-constants";
import userSchema from "./user-schema";
import carParkSchema from "./car-park-schema";

const parkingHistorySchema = pgTable(
    "parking_history",
    {
      id:uuid("id").primaryKey(),
      startDate: timestamp("start_date").notNull(),
      endDate: timestamp("end_date"),
      carParkId: uuid("car_park_id").notNull().references(() => carParkSchema.id),
      userId: text("user_id").notNull().references(() => userSchema.id),
      createdA: timestamp("created_at")
      .default(CURRENT_TIMESTAMP)
      .notNull(),
      updatedAt:timestamp("updated_at")
      .default(CURRENT_TIMESTAMP)
      .notNull()
    }
);

export default parkingHistorySchema