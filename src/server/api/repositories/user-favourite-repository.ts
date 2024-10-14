import userSchema from "~/server/db/schema/user-schema";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import userFavouriteSchema from "~/server/db/schema/user-favourite-schema";
import { UserFavourite } from "../models/user-favourite";
import { NeonHttpDatabase } from "drizzle-orm/neon-http";

export class UserFavouriteRepository {
    constructor(private readonly db: NeonHttpDatabase) {}

    public async save(entity: UserFavourite){
        try{
            await this.db
            .insert(userFavouriteSchema)
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

    public async findManyByUserId(
        userId:string
    ): Promise<UserFavourite[]> {
        try{
            const results = await this.db.select()
                .from(userFavouriteSchema)
                .where(eq(userFavouriteSchema.userId,userId))

            return results.map((result) => {
                return new UserFavourite({
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

    public async update(entity: UserFavourite){
        try{
            await this.db.update(userSchema)
            .set({
                ...entity.getValue(),
                updatedAt: new Date()
            })
            .where(and(
                eq(userFavouriteSchema.userId,entity.getValue().userId),
                eq(userFavouriteSchema.carParkId,entity.getValue().carParkId)
            ))
        } catch(err){
            const e = err as Error;
            throw new TRPCError({
                code:"INTERNAL_SERVER_ERROR",
                message:e.message
            })
        }
    }

}