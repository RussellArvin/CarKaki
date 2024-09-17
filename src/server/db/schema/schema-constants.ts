import { sql } from "drizzle-orm";
import { timestamp } from "drizzle-orm/pg-core";

const CURRENT_TIMESTAMP = sql`CURRENT_TIMESTAMP`

export const createdAt = timestamp("created_at")
.default(CURRENT_TIMESTAMP)
.notNull()

export const updatedAt = timestamp("updated_at")
.default(CURRENT_TIMESTAMP)
.notNull()

export const deletedAt = timestamp("deleted_at")