import { pgTable, text, uuid } from "drizzle-orm/pg-core";
import { createdAt, updatedAt, deletedAt } from "./schema-constants";
import carParkSchema from "./car-park-schema";

const userSchema = pgTable(
    "user",
    {
      id:text("id").primaryKey(),
      firstName: text("first_name").notNull(),
      lastName: text("last_name").notNull(),
      email:text("email").unique().notNull(),
      homeCarParkId: uuid("home_car_park_id").references(() => carParkSchema.id),
      workCarParkId: uuid("work_car_park_id").references(() => carParkSchema.id),
      createdAt,
      updatedAt,
      deletedAt
    }
);

export default userSchema