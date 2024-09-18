import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { CarParkProfile } from "../models/car-park-profile";
import carParkSchema from "~/server/db/schema/car-park-schema";
import CarParkAgency from "../types/car-park-agency";
import LotType from "../types/lot-type";

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
                ...userData[0],
                //TODO: Do enum for database
                lotType: userData[0].lotType as LotType,
                agency: userData[0].agency as CarParkAgency
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
}