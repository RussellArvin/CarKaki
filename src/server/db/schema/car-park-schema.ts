import { pgTable, text, uuid, geometry, integer, pgEnum, time, decimal } from "drizzle-orm/pg-core";
import { createdAt, updatedAt } from "./schema-constants";
import { vehicleCategory } from "~/server/api/types/vehicle-category";
import { carParkAgency } from "~/server/api/types/car-park-agency";
import { parkingSystem } from "~/server/api/types/parking-system";

const vehicleCategoryEnum = pgEnum('lot_type_enum', vehicleCategory);
const parkingSystemEnum = pgEnum('parking_system_enum',parkingSystem)

// const carParkSchema = pgTable(
//     "car_park",
//     {
//       id:uuid("id").primaryKey(),
//       code:text("code").notNull(),
//       name: text("name").notNull(),
//       area: text("area").notNull(),
//       development: text("development").notNull(), 
//       location: geometry('location', { type: 'point', mode: 'xy', srid: 4326 }).notNull(),
//       availableLots: integer("available_lots").notNull(),
//       lotType: lotTypeEnum("lot_type").notNull(),
//       agency :agencyEnum("agency").notNull(),
//       hourlyRate: integer("hourly_rate").notNull(),
//       dailyRate: integer("daily_rate").notNull(),
//       createdAt,
//       updatedAt,
//     }
// );

const carParkSchema = pgTable(
  "car_park",
  {
    id: uuid('id').primaryKey().defaultRandom(),
    code: text('code').notNull(),
    name: text('name').notNull(),
    vehicleCategory: vehicleCategoryEnum('vehicle_category').notNull(),
    startTime: time('start_time').notNull(),
    endTime: time('end_time').notNull(),
    weekDayRate: decimal('weekday_rate', { precision: 5, scale: 2 }).notNull(),
    weekDayMin: integer('weekday_min').notNull(),
    satRate: decimal('sat_rate', { precision: 5, scale: 2 }).notNull(),
    satMin: integer('sat_min').notNull(),
    sunPHRate: decimal('sun_ph_rate', { precision: 5, scale: 2 }).notNull(),
    sunPHMin: integer('sun_ph_min').notNull(),
    parkingSystem: parkingSystemEnum('parking_system').notNull(),
    capacity: integer('capacity').notNull(),
    availableLots: integer("available_lots").notNull(),
    location: geometry('location', { type: 'point', mode: 'xy', srid: 4326 }).notNull(),
    createdAt,
    updatedAt,
  }
)

export default carParkSchema