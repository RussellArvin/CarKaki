import { pgTable, text } from "drizzle-orm/pg-core";
import { createdAt } from "./schema-constants";

const uraTokenSchema = pgTable(
    "ura_token",
    {
      token: text("token").notNull(),
      createdAt
    }
);

export default uraTokenSchema