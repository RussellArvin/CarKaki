import { z } from "zod";
import { parkingSystem } from "../types/parking-system";
import { vehicleCategory } from "../types/vehicle-category";

const parkingSystemEnum = z.enum(parkingSystem); 
const vehicleCategoryEnum = z.enum(vehicleCategory)

const rateTransformer = z.string().transform((val) => parseFloat(val.replace('$', '')));

// Helper function to parse "30 mins" to 30
const minTransformer = z.string().transform((val) => {
  const numberMatch = val.match(/\d+/);
  return numberMatch ? parseInt(numberMatch[0], 10) : 0;
});

// Define Zod schema with transformations
export const informationValidator = z.object({
  Status: z.string(),
  Message: z.string(),
  Result: z.array(
    z.object({
      weekdayMin: minTransformer,         // Transforms "30 mins" into 30
      ppName: z.string(),
      endTime: z.string(),
      weekdayRate: rateTransformer,       // Transforms "$0.50" into 0.50
      startTime: z.string(),
      ppCode: z.string(),
      sunPHRate: rateTransformer,         // Transforms "$0.50" into 0.50
      satdayMin: minTransformer,          // Transforms "30 mins" into 30
      sunPHMin: minTransformer,           // Transforms "30 mins" into 30
      parkingSystem: parkingSystemEnum,
      parkCapacity: z.number(),
      vehCat: vehicleCategoryEnum,
      satdayRate: rateTransformer,        // Transforms "$0.50" into 0.50
      geometries: z.array(
        z.object({
          coordinates: z.string(),
        })
      ),
    })
  ),
});

export const availabilityValidator = z.object({
    Status: z.string(),
    Message: z.string(),
    Result: z.array(
      z.object({
        lotsAvailable: z.string().transform((val) => {
          const parsed = parseInt(val, 10);
          if (isNaN(parsed)) {
            throw new Error("Invalid number");
          }
          return parsed;
        }),
        lotType: z.string(),
        carparkNo: z.string(),
        geometries: z.array(
          z.object({
            coordinates: z.string(),
          })
        ),
      })
    ),
});