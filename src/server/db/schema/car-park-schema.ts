import { pgTable, text, uuid, geometry, integer, pgEnum, time, decimal, timestamp } from "drizzle-orm/pg-core";
import { CURRENT_TIMESTAMP } from "./schema-constants";
import { vehicleCategory } from "~/server/api/types/vehicle-category";
import { parkingSystem } from "~/server/api/types/parking-system";

export const vehicleCategoryEnum = pgEnum('lot_type_enum', vehicleCategory);
export const parkingSystemEnum = pgEnum('parking_system_enum',parkingSystem)

const carParkSchema = pgTable(
  "car_park",
  {
    id: uuid('id').primaryKey().defaultRandom(),
    code: text('code').notNull(),
    name: text('name').notNull(),
    address: text('address'),
    vehicleCategory: vehicleCategoryEnum('vehicle_category').notNull(),
    parkingSystem: parkingSystemEnum('parking_system').notNull(),
    capacity: integer('capacity').notNull(),
    availableLots: integer("available_lots").notNull(),
    location: geometry('location', { type: 'point', mode: 'xy', srid: 4326 }).notNull(),
    createdAt: timestamp("created_at")
    .default(CURRENT_TIMESTAMP)
    .notNull(),
    updatedAt:timestamp("updated_at")
    .default(CURRENT_TIMESTAMP)
    .notNull()
  }
)

export default carParkSchema