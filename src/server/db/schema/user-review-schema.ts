import { integer, pgTable, primaryKey, text } from "drizzle-orm/pg-core";
import { createdAt, updatedAt, userId, carParkId, deletedAt } from "./schema-constants";

const userReviewSchema = pgTable(
    "user_review",
    {
      carParkId,
      userId,
      rating: integer("rating").notNull(),
      description: text("description").notNull(),
      createdAt,
      updatedAt,
      deletedAt,
    } , (table) => {
        return {
            pk: primaryKey({
                columns: [table.carParkId, table.userId]
            })
        }
    }
);

export default userReviewSchema