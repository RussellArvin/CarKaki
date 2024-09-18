import { pgTable, text, uuid, geometry, integer, pgEnum } from "drizzle-orm/pg-core";
import { createdAt, updatedAt } from "./schema-constants";
import { lotType } from "~/server/api/types/lot-type";
import { carParkAgency } from "~/server/api/types/car-park-agency";

const lotTypeEnum = pgEnum('lot_type_enum', lotType);
const agencyEnum = pgEnum("agency_enum", carParkAgency)

const carParkSchema = pgTable(
    "car_park",
    {
      id:uuid("id").primaryKey(),
      area: text("area").notNull(),
      development: text("development").notNull(), 
      location: geometry('location', { type: 'point', mode: 'xy', srid: 4326 }).notNull(),
      availableLots: integer("available_lots").notNull(),
      lotType: lotTypeEnum("lot_type").notNull(),
      agency :agencyEnum("agency").notNull(),
      hourlyRate: integer("hourly_rate").notNull(),
      dailyRate: integer("daily_rate").notNull(),
      createdAt,
      updatedAt,
    }
);

export default carParkSchema