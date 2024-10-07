import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { CarPark } from "../models/car-park";
import carParkSchema from "~/server/db/schema/car-park-schema";
import CarParkAgency from "../types/car-park-agency";
import userFavouriteSchema from "~/server/db/schema/user-favourite-schema";
import { updatedAt } from "~/server/db/schema/schema-constants";
import parkingHistorySchema from "~/server/db/schema/parking-history-schema";
import { convertDrizzleTimeToISO } from "~/server/utils/convertDrizzleTimeToISO";
import { vehicleCategory } from "../types/vehicle-category";

type SelectCarPark = typeof carParkSchema.$inferSelect

export class CarParkRepository {
    constructor(private readonly db: PostgresJsDatabase) {}

    private formatToDb(entity: CarPark){
        return {
            ...entity.getValue(),
            weekDayRate: entity.getValue().weekDayRate.toString(),
            satRate: entity.getValue().satRate.toString(),
            sunPHRate: entity.getValue().sunPHRate.toString()
        }
    }

    private formatFromDb(data: SelectCarPark): CarPark{
        return new CarPark({
            ...data,
            weekDayRate: parseFloat(data.weekDayRate),
            satRate: parseFloat(data.satRate),
            sunPHRate: parseFloat(data.sunPHRate),
            //TODO: Check if we need this?
            // startTime: convertDrizzleTimeToISO(data.startTime),
            // endTime: convertDrizzleTimeToISO(data.endTime),
        })
    }

    public async save(entity: CarPark){
        try{
            await this.db
            .insert(carParkSchema)
            .values(this.formatToDb(entity))

            return;
        } catch(err){
            const e = err as Error;
            throw new TRPCError({
                code:"INTERNAL_SERVER_ERROR",
                message:e.message
            })
        }
    }

    public async update(entity: CarPark){
        try{
            await this.db.update(carParkSchema)
            .set({
                ...this.formatToDb(entity),
                updatedAt: new Date()
            })
            .where(eq(carParkSchema.id,entity.getValue().id))
        } catch(err){
            const e = err as Error;
            throw new TRPCError({
                code:"INTERNAL_SERVER_ERROR",
                message:e.message
            })
        }
    }

    public async findOneByUserId(userId: string): Promise<CarPark> {
        try{
            const userData = await this.db
                .select()
                .from(carParkSchema)
                .where(eq(carParkSchema.id,userId))
                .limit(1)

            if(!userData[0]) throw new TRPCError({
                code:"NOT_FOUND",
                message:"Unable to find user"
            })

            return this.formatFromDb(userData[0])
        } catch(err) {
            if(err instanceof TRPCError) throw err;

            const e = err as Error;
            throw new TRPCError({
                code:"INTERNAL_SERVER_ERROR",
                message:e.message
            })
        }
    }

    public async findUserParkingHistory(
        userId: string
    ) {
        try{
            const results = await this.db.select({
                id: carParkSchema.id,
                code: carParkSchema.code,
                name: carParkSchema.name,
                vehicleCategory: carParkSchema.vehicleCategory,
                startTime: carParkSchema.startTime,
                endTime: carParkSchema.endTime,
                weekDayRate: carParkSchema.weekDayRate,
                weekDayMin: carParkSchema.weekDayMin,
                satRate: carParkSchema.satRate,
                satMin: carParkSchema.satMin,
                sunPHRate: carParkSchema.sunPHRate,
                sunPHMin: carParkSchema.sunPHMin,
                parkingSystem: carParkSchema.parkingSystem,
                capacity: carParkSchema.capacity,
                availableLots: carParkSchema.availableLots,
                location: carParkSchema.location,
                createdAt: carParkSchema.createdAt,
                updatedAt: carParkSchema.updatedAt
            })
                .from(parkingHistorySchema)
                .innerJoin(carParkSchema,eq(carParkSchema.id,parkingHistorySchema.carParkId))
                .where(eq(parkingHistorySchema.userId,userId))

                return results.map((carpark) => this.formatFromDb(carpark))
        } catch(err){
            const e = err as Error;
            return new TRPCError({
                code:"INTERNAL_SERVER_ERROR",
                message:e.message
            })
        }
    }

    public async findUserFavourites(
        userId: string
    ) {
        try{
            const results = await this.db.select({
                id: carParkSchema.id,
                code: carParkSchema.code,
                name: carParkSchema.name,
                vehicleCategory: carParkSchema.vehicleCategory,
                startTime: carParkSchema.startTime,
                endTime: carParkSchema.endTime,
                weekDayRate: carParkSchema.weekDayRate,
                weekDayMin: carParkSchema.weekDayMin,
                satRate: carParkSchema.satRate,
                satMin: carParkSchema.satMin,
                sunPHRate: carParkSchema.sunPHRate,
                sunPHMin: carParkSchema.sunPHMin,
                parkingSystem: carParkSchema.parkingSystem,
                capacity: carParkSchema.capacity,
                availableLots: carParkSchema.availableLots,
                location: carParkSchema.location,
                createdAt: carParkSchema.createdAt,
                updatedAt: carParkSchema.updatedAt
            })
                .from(userFavouriteSchema)
                .innerJoin(carParkSchema,eq(carParkSchema.id,userFavouriteSchema.carParkId))
                .where(eq(userFavouriteSchema.userId,userId))

                return results.map((carpark) => this.formatFromDb(carpark))
        } catch(err){
            const e = err as Error;
            return new TRPCError({
                code:"INTERNAL_SERVER_ERROR",
                message:e.message
            })
        }
    }
}