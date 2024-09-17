import { pgTable, text, uuid, geometry, integer } from "drizzle-orm/pg-core";
import { createdAt, updatedAt, deletedAt } from "./schema-constants";

const schema = pgTable(
    "car_park",
    {
      id:uuid("id").primaryKey(),
      area: text("area").notNull(),
      development: text("development").notNull(), 
      location: geometry('location', { type: 'point', mode: 'xy', srid: 4326 }).notNull(),
      availableLots: integer("available_lots").notNull(),
      lotType: text("lot_type").notNull(),
      agency:text("text").notNull(),
      hourlyRate: integer("hourly_rate").notNull(),
      dailyRate: integer("daily_rate").notNull(),
      createdAt,
      updatedAt,
    }
);

export default schema