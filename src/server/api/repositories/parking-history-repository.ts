import { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import parkingHistorySchema from "~/server/db/schema/parking-history-schema";
import { ParkingHistory } from "../models/parking-history-profile";

export class ParkingHistoryRepository {
    constructor(private readonly db: PostgresJsDatabase) {}

    public async save(entity: ParkingHistory){
        try{
            await this.db
            .insert(parkingHistorySchema)
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

    public async update(entity: ParkingHistory){
        try{
            await this.db.update(parkingHistorySchema)
            .set({
                ...entity.getValue(),
                updatedAt: new Date()
            })
            .where(eq(parkingHistorySchema.id,entity.getValue().id))
        } catch(err){
            const e = err as Error;
            throw new TRPCError({
                code:"INTERNAL_SERVER_ERROR",
                message:e.message
            })
        }
    }

    public async findManyByUserId(userId: string): Promise<ParkingHistory[]> {
        try{
            const results = await this.db.select()
                .from(parkingHistorySchema)
                .where(eq(parkingHistorySchema.userId,userId))

            return results.map((result) => {
                return new ParkingHistory({
                    ...result
                })
            })
        } catch(err){
            if(err instanceof TRPCError) throw err;

            const e = err as Error;
            throw new TRPCError({
                code:"INTERNAL_SERVER_ERROR",
                message:e.message
            })
        }
    }

    public async findManyByUserIdAndCarParkId(
        userId: string,
        carParkId: string
    ): Promise<ParkingHistory[]> {
        try{
            const results = await this.db.select()
                .from(parkingHistorySchema)
                .where(and(
                    eq(parkingHistorySchema.userId,userId),
                    eq(parkingHistorySchema.carParkId,carParkId)
                ))

            return results.map((result) => {
                return new ParkingHistory({
                    ...result
                })
            })
        } catch(err){
            if(err instanceof TRPCError) throw err;

            const e = err as Error;
            throw new TRPCError({
                code:"INTERNAL_SERVER_ERROR",
                message:e.message
            })
        }
    }

}