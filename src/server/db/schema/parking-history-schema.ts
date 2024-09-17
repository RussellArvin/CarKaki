import { pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { createdAt, updatedAt, userId, carParkId } from "./schema-constants";

const parkingHistorySchema = pgTable(
    "parking_history",
    {
      id:uuid("id").primaryKey(),
      startDate: timestamp("start_date").notNull(),
      endDate: timestamp("end_date"),
      carParkId,
      userId,
      createdAt,
      updatedAt,
    }
);

export default parkingHistorySchema