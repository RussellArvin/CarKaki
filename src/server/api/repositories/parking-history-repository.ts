import { TRPCError } from "@trpc/server";
import { and, eq, sql, desc, getTableColumns, lte, gte, or, isNull } from "drizzle-orm";
import parkingHistorySchema from "~/server/db/schema/parking-history-schema";
import { ParkingHistory } from "../models/parking-history";
import handleError from "~/server/utils/handleError";
import carParkSchema from "~/server/db/schema/car-park-schema";
import userFavouriteSchema from "~/server/db/schema/user-favourite-schema";
import { NeonHttpDatabase } from "drizzle-orm/neon-http";

interface FrequentlyVisitedCarParks {
    id: string,
    name: string,
    visits: number,
    isFavourited: boolean
}

export class ParkingHistoryRepository {
    constructor(private readonly db: NeonHttpDatabase) {}

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

    public async findFrequentlyVisited(userId: string): Promise<FrequentlyVisitedCarParks[]>{
        try{
            const results = await this.db.select({
                id: carParkSchema.id,
                name: carParkSchema.name,
                address: carParkSchema.address,
                visits: sql<number>`COUNT(*)`.as('visits'),
                isFavourited: sql<boolean>`BOOL_OR(${userFavouriteSchema.carParkId} IS NOT NULL)`.as('isFavourited')
            })
            .from(parkingHistorySchema)
            .innerJoin(carParkSchema,eq(carParkSchema.id, parkingHistorySchema.carParkId))
            .leftJoin(userFavouriteSchema, and(
                eq(userFavouriteSchema.carParkId, parkingHistorySchema.carParkId),
                eq(userFavouriteSchema.userId,parkingHistorySchema.userId),
                isNull(userFavouriteSchema.deletedAt)
            ))
            .groupBy(carParkSchema.id, carParkSchema.name)
            .where(eq(parkingHistorySchema.userId,userId))
            .orderBy(desc(sql`visits`))
            .limit(5)

            return results;
        } catch(err){
            if(err instanceof TRPCError) throw err;

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

    public async findExistingByUserIdOrNull(
        userId: string,
    ): Promise<ParkingHistory | null> {
        try{
            const results = await this.db
            .select({
                ...getTableColumns(parkingHistorySchema)
            })
            .from(parkingHistorySchema)
            .where(and(
                eq(parkingHistorySchema.userId,userId),
                lte(parkingHistorySchema.startDate,sql`NOW()`),
                or(
                    isNull(parkingHistorySchema.endDate),  // Handle case where parking hasn't ended yet
                    gte(parkingHistorySchema.endDate, sql`NOW()`)  // Or end date is in future
                )
            ))
            .limit(1);

            if(!results[0]) return null;
            return new ParkingHistory({...results[0]})
        }catch(err){
            if(err instanceof TRPCError) throw err;

            const e = err as Error;
            throw new TRPCError({
                code:"INTERNAL_SERVER_ERROR",
                message:e.message
            })
        }
    }

    public async findExistingByUserIdAndCarParkId(
        userId: string,
        carParkId: string
    ): Promise<ParkingHistory> {
        try{
            const results = await this.db
            .select({
                ...getTableColumns(parkingHistorySchema)
            })
            .from(parkingHistorySchema)
            .where(and(
                eq(parkingHistorySchema.userId,userId),
                eq(parkingHistorySchema.carParkId,carParkId),
                lte(parkingHistorySchema.startDate,sql`NOW()`),
                or(
                    isNull(parkingHistorySchema.endDate),  // Handle case where parking hasn't ended yet
                    gte(parkingHistorySchema.endDate, sql`NOW()`)  // Or end date is in future
                )
            ))
            .limit(1);

            if(!results[0]) throw new TRPCError({
                code:"NOT_FOUND",
                message:"Unable to find corresponding parking record"
            })
            return new ParkingHistory({...results[0]})
        }catch(err){
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