import { TRPCError } from "@trpc/server";
import { and, or, eq, getTableColumns, sql, lte, gte } from "drizzle-orm";
import { CarPark } from "../models/car-park";
import carParkSchema from "~/server/db/schema/car-park-schema";
import userFavouriteSchema from "~/server/db/schema/user-favourite-schema";
import parkingHistorySchema from "~/server/db/schema/parking-history-schema";
import Location from "../types/location";
import { NeonHttpDatabase } from "drizzle-orm/neon-http";
import CurrentParking from "../types/current-parking";
import userSchema from "~/server/db/schema/user-schema";

export class CarParkRepository {
    constructor(private readonly db: NeonHttpDatabase) {}

    public async findAll(){
        try{
            const results = await this.db
                .select()
                .from(carParkSchema)

            return results.map((result)=> new CarPark({...result}))
        } catch(err) {
            if(err instanceof TRPCError) throw err;

            const e = err as Error;
            throw new TRPCError({
                code:"INTERNAL_SERVER_ERROR",
                message:e.message
            })
        }
    }

    public async save(entity: CarPark){
        try{
            await this.db
            .insert(carParkSchema)
            .values({...entity.getValue()})

            return;
        } catch(err){
            const e = err as Error;
            throw new TRPCError({
                code:"INTERNAL_SERVER_ERROR",
                message:e.message
            })
        }
    }

    public async saveMany(entitites: CarPark[]){
        try{
            const values = entitites.map((entity)=> entity.getValue())
            await this.db
            .insert(carParkSchema)
            .values(entitites.map((entity)=> entity.getValue()))
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

    public async isFavouritedByUser(
        carParkId: string,
        userId: string
    ): Promise<boolean>{
        try{
            const results = await this.db
                .select({
                    carParkId: userFavouriteSchema.carParkId
                })
                .from(userFavouriteSchema)
                .where(and(
                    eq(userFavouriteSchema.carParkId,carParkId),
                    eq(userFavouriteSchema.userId,userId)
                ))
                .limit(1);

            return !!results.length
        } catch(err){
            const e = err as Error;
            throw new TRPCError({
                code:"INTERNAL_SERVER_ERROR",
                message:e.message
            })
        }
    }

    public async findNearByCarParks(
        location: Location, amount: number
    ): Promise<CarPark[]>{
        try{
            
            const sqlPoint = sql`ST_SetSRID(ST_MakePoint(${location.x}, ${location.y}), 3414)`;

            const results = await this.db
                .select({
                ...getTableColumns(carParkSchema),
                distance: sql`ST_Distance(
                    ${carParkSchema.location}::geometry,
                    ${sqlPoint}
                )`
                })
                .from(carParkSchema)
                .orderBy(sql`${carParkSchema.location}::geometry <-> ${sqlPoint}`)
                .limit(amount)
                .offset(1)


            
            return results.map((carpark) => new CarPark({...carpark}))
        }  catch(err){
            const e = err as Error;
            throw new TRPCError({
                code:"INTERNAL_SERVER_ERROR",
                message:e.message
            })
        }
    }

    public async findOneByLocation(location: Location): Promise<CarPark>{
        try{
            const sqlPoint = sql`ST_SetSRID(ST_MakePoint(${location.x}, ${location.y}), 3414)`;

            const results = await this.db
                .select({
                ...getTableColumns(carParkSchema),
                distance: sql`ST_Distance(
                    ${carParkSchema.location}::geometry,
                    ${sqlPoint}
                )`
                })
                .from(carParkSchema)
                .orderBy(sql`${carParkSchema.location}::geometry <-> ${sqlPoint}`)
                .limit(1)

            if(!results[0]) throw Error("Unable to find a carpark")

            return new CarPark({...results[0]})

        }catch(err) {
            if(err instanceof TRPCError) throw err;

            const e = err as Error;
            throw new TRPCError({
                code:"INTERNAL_SERVER_ERROR",
                message:e.message
            })
        }
    }

    public async findOneById(id: string): Promise<CarPark> {
        try{
            const userData = await this.db
                .select()
                .from(carParkSchema)
                .where(eq(carParkSchema.id,id))
                .limit(1)

            if(!userData[0]) throw new TRPCError({
                code:"NOT_FOUND",
                message:"Unable to find CarPark"
            })

            return new CarPark({...userData[0]})
        } catch(err) {
            if(err instanceof TRPCError) throw err;

            const e = err as Error;
            throw new TRPCError({
                code:"INTERNAL_SERVER_ERROR",
                message:e.message
            })
        }
    }

    public async findSavedCarParks(
        userId: string
    ): Promise<CarPark[]> {
        try{
            const userData = this.db.select().from(userSchema).where(eq(userSchema.id,userId)).as('userData')

            const results = await this.db
                .select({...getTableColumns(carParkSchema)})
                .from(carParkSchema)
                .where(or(
                    eq(carParkSchema.id, userData.homeCarParkId),
                    eq(carParkSchema.id,userData.workCarParkId)
                ))
            
                return results.map((result) => new CarPark({...result}))
        }catch(err){
            if(err instanceof TRPCError) throw err;

            const e = err as Error;
            throw new TRPCError({
                code:"INTERNAL_SERVER_ERROR",
                message:e.message
            })
        }
    }

    public async findCurrentParkingOrNull(
        userId: string,
    ): Promise<CurrentParking | null> {
        try{
            const results = await this.db
            .select({
                id: parkingHistorySchema.id,
                carParkId: carParkSchema.id,
                name: carParkSchema.name,
                address: carParkSchema.address,
                startDate: parkingHistorySchema.startDate,
            })
            .from(parkingHistorySchema)
            .innerJoin(carParkSchema, eq(carParkSchema.id, parkingHistorySchema.carParkId))
            .where(and(
                eq(parkingHistorySchema.userId,userId),
                lte(parkingHistorySchema.startDate,sql`NOW()`),
                gte(parkingHistorySchema.endDate, sql`NOW()`)
            ))
            .limit(1);

            if(!results[0]) return null;
            return results[0]
        }catch(err){
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
                ...getTableColumns(carParkSchema)
            })
                .from(parkingHistorySchema)
                .innerJoin(carParkSchema,eq(carParkSchema.id,parkingHistorySchema.carParkId))
                .where(eq(parkingHistorySchema.userId,userId))

                return results.map((carpark) => new CarPark({...carpark}))
        } catch(err){
            const e = err as Error;
            throw new TRPCError({
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
                ...getTableColumns(carParkSchema)
            })
                .from(userFavouriteSchema)
                .innerJoin(carParkSchema,eq(carParkSchema.id,userFavouriteSchema.carParkId))
                .where(eq(userFavouriteSchema.userId,userId))

                return results.map((carpark) => new CarPark({...carpark}))
        } catch(err){
            const e = err as Error;
            throw new TRPCError({
                code:"INTERNAL_SERVER_ERROR",
                message:e.message
            })
        }
    }
}