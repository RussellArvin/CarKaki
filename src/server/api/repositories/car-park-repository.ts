import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { CarParkProfile } from "../models/car-park-profile";
import carParkSchema from "~/server/db/schema/car-park-schema";
import CarParkAgency from "../types/car-park-agency";
import LotType, { lotType } from "../types/lot-type";
import userFavouriteSchema from "~/server/db/schema/user-favourite-schema";
import { updatedAt } from "~/server/db/schema/schema-constants";
import parkingHistorySchema from "~/server/db/schema/parking-history-schema";

export class CarParkRepository {
    constructor(private readonly db: PostgresJsDatabase) {}

    public async save(entity: CarParkProfile){
        try{
            await this.db
            .insert(carParkSchema)
            .values(entity.getValue())

            return;
        } catch(err){
            const e = err as Error;
            throw new TRPCError({
                code:"INTERNAL_SERVER_ERROR",
                message:e.message
            })
        }
    }

    public async update(entity: CarParkProfile){
        try{
            await this.db.update(carParkSchema)
            .set({
                ...entity.getValue(),
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

    public async findOneByUserId(userId: string): Promise<CarParkProfile> {
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

            return new CarParkProfile({
                ...userData[0]
            })
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
                area: carParkSchema.area,
                location: carParkSchema.location,
                availableLots: carParkSchema.availableLots,
                lotType: carParkSchema.lotType,
                agency: carParkSchema.agency,
                development: carParkSchema.development,
                hourlyRate: carParkSchema.hourlyRate,
                dailyRate: carParkSchema.dailyRate,
                createdAt: carParkSchema.createdAt,
                updatedAt: carParkSchema.updatedAt
            })
                .from(parkingHistorySchema)
                .innerJoin(carParkSchema,eq(carParkSchema.id,parkingHistorySchema.carParkId))
                .where(eq(parkingHistorySchema.userId,userId))

                return results.map((carpark) => new CarParkProfile({...carpark}))
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
                area: carParkSchema.area,
                location: carParkSchema.location,
                availableLots: carParkSchema.availableLots,
                lotType: carParkSchema.lotType,
                agency: carParkSchema.agency,
                development: carParkSchema.development,
                hourlyRate: carParkSchema.hourlyRate,
                dailyRate: carParkSchema.dailyRate,
                createdAt: carParkSchema.createdAt,
                updatedAt: carParkSchema.updatedAt
            })
                .from(userFavouriteSchema)
                .innerJoin(carParkSchema,eq(carParkSchema.id,userFavouriteSchema.carParkId))
                .where(eq(userFavouriteSchema.userId,userId))

                return results.map((carpark) => new CarParkProfile({...carpark}))
        } catch(err){
            const e = err as Error;
            return new TRPCError({
                code:"INTERNAL_SERVER_ERROR",
                message:e.message
            })
        }
    }
}