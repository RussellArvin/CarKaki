import { pgTable, primaryKey, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { CURRENT_TIMESTAMP } from "./schema-constants";
import userSchema from "./user-schema";
import carParkSchema from "./car-park-schema";

const userFavouriteSchema = pgTable(
    "user_favourite",
    {
      carParkId: uuid("car_park_id").notNull().references(() => carParkSchema.id),
      userId: text("user_id").notNull().references(() => userSchema.id),
      createdAt: timestamp("created_at")
      .default(CURRENT_TIMESTAMP)
      .notNull(),
      deletedAt: timestamp("deleted_at")
    } , (table) => {
      return {
          pk: primaryKey({
              columns: [table.carParkId, table.userId]
          })
      }
  }
);

export default userFavouriteSchema