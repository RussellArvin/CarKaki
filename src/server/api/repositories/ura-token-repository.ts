import { PostgresJsDatabase } from "drizzle-orm/postgres-js";

import { TRPCError } from "@trpc/server";
import { and, eq, sql, desc } from "drizzle-orm";
import parkingHistorySchema from "~/server/db/schema/parking-history-schema";
import { ParkingHistory } from "../models/parking-history";
import handleError from "~/server/utils/handleError";
import carParkSchema from "~/server/db/schema/car-park-schema";
import userFavouriteSchema from "~/server/db/schema/user-favourite-schema";
import uraTokenSchema from "~/server/db/schema/ura-token-schema";

export class URATokenRepository {
    constructor(private readonly db: PostgresJsDatabase) {}

    public async findOne(){
        try{
            const results = await this.db
                .select()
                .from(uraTokenSchema)
                .limit(1)

            if(!results[0]) return null;
            return results[0]
        } catch(err){
            const e = err as Error;
            throw new TRPCError({
                code:"INTERNAL_SERVER_ERROR",
                message:e.message
            })
        }
    }

    public async save(token:string){
        try{
            await this.db
            .insert(uraTokenSchema)
            .values({
                token,
                createdAt: new Date()
            })

            return;
        } catch(err){
            const e = err as Error;
            throw new TRPCError({
                code:"INTERNAL_SERVER_ERROR",
                message:e.message
            })
        }
    }

    public async update(token: string){
        try{
            await this.db.update(uraTokenSchema)
            .set({
                token,
                createdAt: new Date()
            })
        } catch(err){
            const e = err as Error;
            throw new TRPCError({
                code:"INTERNAL_SERVER_ERROR",
                message:e.message
            })
        }
    }


}