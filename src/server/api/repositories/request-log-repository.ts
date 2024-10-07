import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { TRPCError } from "@trpc/server";
import { desc, eq } from "drizzle-orm";
import { RequestLog } from "../models/request-log";
import requestLogSchema from "~/server/db/schema/request-log-schema";
import UraAPIRequestType from "../types/ura-api-request-type";

export class RequestLogRepository {
    constructor(private readonly db: PostgresJsDatabase) {}

    public async save(entity: RequestLog){
        try{
            await this.db
            .insert(requestLogSchema)
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

    public async findLatestRequestOrNull(
        type: UraAPIRequestType
    ): Promise<RequestLog | null> {
        try{
            const results = await this.db
                .select()
                .from(requestLogSchema)
                .where(eq(requestLogSchema.type, type))
                .orderBy(desc(requestLogSchema.createdAt))
                .limit(1)

            if(!results[0]) return null

            return new RequestLog({...results[0]})
        } catch(err) {
            const e = err as Error;
            throw new TRPCError({
                code:"INTERNAL_SERVER_ERROR",
                message:e.message
            })
        }
    }
}