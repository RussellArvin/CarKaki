import { TRPCError } from "@trpc/server";
import { and, eq, desc } from "drizzle-orm";
import userReviewSchema from "~/server/db/schema/user-review-schema";
import { UserReview } from "../models/user-review";
import { NeonHttpDatabase } from "drizzle-orm/neon-http";
import userSchema from "~/server/db/schema/user-schema";

export class UserReviewRepository {
    constructor(private readonly db: NeonHttpDatabase) {}

    public async save(entity: UserReview){
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

    public async update(entity: UserReview){
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
    ) {
        try{
            const results = await this.db.select({
                userFirstName: userSchema.firstName,
                userLastName: userSchema.lastName,
                rating: userReviewSchema.rating,
                description: userReviewSchema.description
            })
                .from(userReviewSchema)
                .where(eq(userReviewSchema.carParkId,carParkId))
                .innerJoin(userSchema,eq(userSchema.id,userReviewSchema.userId))
                .orderBy(desc(userReviewSchema.createdAt))
                .limit(3)

            return results;
            
        } catch(err) {
            if(err instanceof TRPCError) throw err;

            const e = err as Error;
            throw new TRPCError({
                code:"INTERNAL_SERVER_ERROR",
                message:e.message
            })
        }
    }

    public async findOneByUserIdAndCarParkIdOrNull(
        userId: string, 
        carParkId: string
    ): Promise<UserReview | null> {
        try{
            const userData = await this.db
                .select()
                .from(userReviewSchema)
                .where(and(
                    eq(userReviewSchema.carParkId,carParkId),
                    eq(userReviewSchema.userId,userId)
                ))
                .limit(1)

            if(!userData[0]) return null;

            return new UserReview({
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