import { pgTable, uuid } from "drizzle-orm/pg-core";
import { createdAt, deletedAt } from "./schema-constants";

const schema = pgTable(
    "user_favourite",
    {
      carParkId: uuid("car_park_id").notNull(),
      userId: uuid("user_id").notNull(),
      createdAt,
      deletedAt
    }
);

export default schema