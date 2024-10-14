import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { CURRENT_TIMESTAMP } from "./schema-constants";

const uraTokenSchema = pgTable(
    "ura_token",
    {
      token: text("token").notNull(),
      createdAt:timestamp("created_at")
      .default(CURRENT_TIMESTAMP)
      .notNull()
    }
);

export default uraTokenSchema