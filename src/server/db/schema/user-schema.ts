import { boolean, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { CURRENT_TIMESTAMP } from "./schema-constants";
import carParkSchema from "./car-park-schema";

const userSchema = pgTable(
    "user",
    {
      id:text("id").primaryKey(),
      firstName: text("first_name").notNull(),
      lastName: text("last_name").notNull(),
      hasSetName: boolean("has_set_name").notNull().default(true),
      email:text("email").notNull(),
      isDarkMode: boolean("is_dark_mode").notNull().default(false),
      isNotificationsEnabled: boolean("is_notifications_enabled").notNull().default(false),
      homeCarParkId: uuid("home_car_park_id").references(() => carParkSchema.id),
      workCarParkId: uuid("work_car_park_id").references(() => carParkSchema.id),
      createdAt:timestamp("created_at")
      .default(CURRENT_TIMESTAMP)
      .notNull(),
      updatedAt: timestamp("updated_at")
      .default(CURRENT_TIMESTAMP)
      .notNull(),
      deletedAt:timestamp("deleted_at")
    }
);

export default userSchema