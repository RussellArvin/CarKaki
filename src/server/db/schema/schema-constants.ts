import { sql } from "drizzle-orm";
import { text, timestamp, uuid } from "drizzle-orm/pg-core";
import userSchema from "./user-schema";
import carParkSchema from "./car-park-schema";

const CURRENT_TIMESTAMP = sql`CURRENT_TIMESTAMP`

export const createdAt = timestamp("created_at")
.default(CURRENT_TIMESTAMP)
.notNull()

export const updatedAt = timestamp("updated_at")
.default(CURRENT_TIMESTAMP)
.notNull()

export const userId =  text("user_id").notNull().references(() => userSchema.id)

export const carParkId = uuid("car_park_id").notNull().references(() => carParkSchema.id)

export const deletedAt = timestamp("deleted_at")