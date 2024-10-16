import { NeonHttpDatabase } from "drizzle-orm/neon-http";
import { CarParkRate } from "../models/car-park-rate";
import { TRPCError } from "@trpc/server";
import { eq, getTableColumns, between, sql } from "drizzle-orm";
import carParkRateSchema from "~/server/db/schema/car-park-rate-schema";
import { convertToDrizzleTime, formatFromDrizzleTime } from "~/server/utils/handleTime";
import carParkSchema from "~/server/db/schema/car-park-schema";

type SelectCarParkRate = typeof carParkRateSchema.$inferSelect

export class CarParkRateRepository {
    constructor(private readonly db: NeonHttpDatabase) {}

    private formatToDb(entity: CarParkRate){
        return {
            ...entity.getValue(),
            weekDayRate: entity.getValue().weekDayRate.toString(),
            satRate: entity.getValue().satRate.toString(),
            sunPHRate: entity.getValue().sunPHRate.toString(),
            startTime: convertToDrizzleTime(entity.getValue().startTime),
            endTime: convertToDrizzleTime(entity.getValue().endTime)
        }
    }

    private formatFromDb(data: SelectCarParkRate): CarParkRate{
        return new CarParkRate({
            ...data,
            weekDayRate: parseFloat(data.weekDayRate),
            satRate: parseFloat(data.satRate),
            sunPHRate: parseFloat(data.sunPHRate),
            startTime: formatFromDrizzleTime(data.startTime),
            endTime: formatFromDrizzleTime(data.endTime)
        })
    }

    public async saveMany(entities: CarParkRate[]){
        try{
            await this.db.insert(carParkRateSchema).values(entities.map((entity)=>this.formatToDb(entity)))
        }catch(err){
            if(err instanceof TRPCError) throw err;

            const e = err as Error;
            throw new TRPCError({
                code:"INTERNAL_SERVER_ERROR",
                message:e.message
            })
        
        }
    }

    public async update(entity: CarParkRate) {
        try{
            await this.db.update(carParkRateSchema).set({...this.formatToDb(entity)})
        } catch(err){
            if(err instanceof TRPCError) throw err;

            const e = err as Error;
            throw new TRPCError({
                code:"INTERNAL_SERVER_ERROR",
                message:e.message
            })
        
        }
    }

    public async findOneByCarParkId(carParkId: string): Promise<CarParkRate | null>{
        try{
            const result = await this.db.select({
                ...getTableColumns(carParkRateSchema)
            })
            .from(carParkRateSchema)
            .where(
                between(sql`NOW()`, carParkRateSchema.startTime, carParkRateSchema.endTime)
            )
            .limit(1)

            return result[0] ? this.formatFromDb(result[0]) : null
        } catch(err){
            const e  = err as Error;
            throw new TRPCError({
                code:"INTERNAL_SERVER_ERROR",
                message:e.message
            })
        }
    }

    public async findAll(): Promise<CarParkRate[]> {
        try{
            const results = await this.db.select({
                ...getTableColumns(carParkRateSchema)
            })
            .from(carParkRateSchema)

            return results.map((result) => this.formatFromDb(result))

        } catch(err){
            if(err instanceof TRPCError) throw err;

            const e = err as Error;
            throw new TRPCError({
                code:"INTERNAL_SERVER_ERROR",
                message:e.message
            })
        
        }
    }

    public async findAllByCarParkId(carParkId: string): Promise<CarParkRate[]>{
        try{
            const results = await this.db.select({
                ...getTableColumns(carParkRateSchema)
            })
            .from(carParkRateSchema)
            .where(eq(carParkRateSchema.carParkId,carParkId))

            return results.map((result) => this.formatFromDb(result))
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