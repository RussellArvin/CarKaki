import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import userReviewSchema from "~/server/db/schema/user-review-schema";
import { UserReviewProfile } from "../models/user-review-profile";

export class UserReviewRepository {
    constructor(private readonly db: PostgresJsDatabase) {}

    public async save(entity: UserReviewProfile){
        try{
            await this.db
            .insert(userReviewSchema)
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

    public async update(entity: UserReviewProfile){
        try{
            await this.db.update(userReviewSchema)
            .set({
                ...entity.getValue(),
                updatedAt: new Date()
            })
            .where(and(
                eq(userReviewSchema.carParkId,entity.getValue().carParkId),
                eq(userReviewSchema.userId,entity.getValue().userId)
            ))
        } catch(err){
            const e = err as Error;
            throw new TRPCError({
                code:"INTERNAL_SERVER_ERROR",
                message:e.message
            })
        }
    }

    public async findManyByCarParkId(
        carParkId: string
    ): Promise<UserReviewProfile[]> {
        try{
            const results = await this.db.select()
                .from(userReviewSchema)
                .where(eq(userReviewSchema.carParkId,carParkId))

            return results.map((result)=>{
                return new UserReviewProfile({
                   ...result 
                })
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

    public async findOneByUserIdAndCarParkId(
        userId: string, 
        carParkId: string
    ): Promise<UserReviewProfile> {
        try{
            const userData = await this.db
                .select()
                .from(userReviewSchema)
                .where(and(
                    eq(userReviewSchema.carParkId,carParkId),
                    eq(userReviewSchema.userId,userId)
                ))
                .limit(1)

            if(!userData[0]) throw new TRPCError({
                code:"NOT_FOUND",
                message:"Unable to find user"
            })

            return new UserReviewProfile({
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
}