import { User } from "../models/user";
import userSchema from "~/server/db/schema/user-schema";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { NeonHttpDatabase } from "drizzle-orm/neon-http";

export class UserRepository {
    constructor(private readonly db: NeonHttpDatabase) {}

    public async save(entity: User){
        try{
            await this.db
            .insert(userSchema)
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

    public async update(entity: User){
        try{
            await this.db.update(userSchema)
            .set({
                ...entity.getValue(),
                updatedAt: new Date()
            })
            .where(eq(userSchema.id,entity.getValue().id))
        } catch(err){
            const e = err as Error;
            throw new TRPCError({
                code:"INTERNAL_SERVER_ERROR",
                message:e.message
            })
        }
    }

    public async findOneByUserIdOrNull(userId: string): Promise<User | null> {
        try{
            const userData = await this.db
                .select()
                .from(userSchema)
                .where(eq(userSchema.id,userId))
                .limit(1)

            if(!userData[0]) return null

            return new User({
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

    public async findOneByUserId(userId: string): Promise<User> {
        try{
            const userData = await this.db
                .select()
                .from(userSchema)
                .where(eq(userSchema.id,userId))
                .limit(1)

            if(!userData[0]) throw new TRPCError({
                code:"NOT_FOUND",
                message:"Unable to find user"
            })

            return new User({
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