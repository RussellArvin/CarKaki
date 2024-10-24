import { TRPCError } from "@trpc/server";
import uraTokenSchema from "~/server/db/schema/ura-token-schema";
import { NeonHttpDatabase } from "drizzle-orm/neon-http";

interface URAToken {
    token: string
    createdAt: Date
}

export class URATokenRepository {
    constructor(private readonly db: NeonHttpDatabase) {}

    public async findOne(): Promise<URAToken | null>{
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