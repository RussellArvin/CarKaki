import { decimal, integer, pgTable, text, time, timestamp, uuid } from "drizzle-orm/pg-core";
import { CURRENT_TIMESTAMP } from "./schema-constants";

import carParkSchema from "./car-park-schema";

const carParkRateSchema = pgTable(
    "car_park_rate",
    {
      id:uuid("id").primaryKey(),
      carParkId: uuid("car_park_id").notNull().references(() => carParkSchema.id),
      startTime: time('start_time').notNull(),
      endTime: time('end_time').notNull(),
      weekDayRate: decimal('weekday_rate', { precision: 5, scale: 2 }).notNull(),
      weekDayMin: integer('weekday_min').notNull(),
      satRate: decimal('sat_rate', { precision: 5, scale: 2 }).notNull(),
      satMin: integer('sat_min').notNull(),
      sunPHRate: decimal('sun_ph_rate', { precision: 5, scale: 2 }).notNull(),
      sunPHMin: integer('sun_ph_min').notNull(),
      createdAt: timestamp("created_at")
      .default(CURRENT_TIMESTAMP)
      .notNull(),
      updatedAt:timestamp("updated_at")
      .default(CURRENT_TIMESTAMP)
      .notNull()
    }
);

export default carParkRateSchema