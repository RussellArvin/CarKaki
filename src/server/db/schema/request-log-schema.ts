import { pgEnum, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";
import { CURRENT_TIMESTAMP } from "./schema-constants";
import { uraApiRequestType } from "~/server/api/types/ura-types";

const requestTypeEnum = pgEnum('parking_system_enum',uraApiRequestType)

const requestLogSchema = pgTable(
    "request_log",
    {
      id:uuid("id").notNull().primaryKey(),
      type: requestTypeEnum("type").notNull(),
      createdAt:timestamp("created_at")
      .default(CURRENT_TIMESTAMP)
      .notNull(),
    }
);

export default requestLogSchema