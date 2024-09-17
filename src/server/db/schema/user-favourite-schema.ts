import { pgTable, uuid } from "drizzle-orm/pg-core";
import { createdAt, deletedAt, carParkId, userId } from "./schema-constants";

const userFavouriteSchema = pgTable(
    "user_favourite",
    {
      carParkId,
      userId,
      createdAt,
      deletedAt
    }
);

export default userFavouriteSchema