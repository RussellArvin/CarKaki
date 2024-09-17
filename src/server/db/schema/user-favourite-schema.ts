import { pgTable, primaryKey, uuid } from "drizzle-orm/pg-core";
import { createdAt, deletedAt, carParkId, userId } from "./schema-constants";

const userFavouriteSchema = pgTable(
    "user_favourite",
    {
      carParkId,
      userId,
      createdAt,
      deletedAt
    } , (table) => {
      return {
          pk: primaryKey({
              columns: [table.carParkId, table.userId]
          })
      }
  }
);

export default userFavouriteSchema