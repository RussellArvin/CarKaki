import { date, text, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { CURRENT_TIMESTAMP } from "./schema-constants";


const publicHolidaySchema = pgTable(
    "public_holiday",
    {
      id:uuid("id").notNull().primaryKey(),
      name:text("name").notNull(),
      day: date("day").notNull(),
      createdAt: timestamp("createdAt").notNull().default(CURRENT_TIMESTAMP)
    }
);

export default publicHolidaySchema