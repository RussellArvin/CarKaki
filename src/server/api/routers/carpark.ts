import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { carParkRateService, carParkService  } from "../services";



export const carParkRouter = createTRPCRouter({
    getDetails: protectedProcedure
    .input(z.object({
        x:z.number(),
        y:z.number()
    }))
    .query(async ({ctx,input}) => await carParkService.getDetails({...input})),
    getFullDetails: protectedProcedure
    .input(z.object({
        id: z.string()
    }))
    .query(async ({ctx,input}) => await carParkService.getFullDetails(
        ctx.auth.userId,
        input.id
    )),
    getRate: protectedProcedure
    .input(z.object({
        hours: z.number().min(1),
        id: z.string()
    }))
    .mutation(async ({input}) => await carParkRateService.getAppropriateRate(
        input.id,
        input.hours
    )),
    startParking: protectedProcedure
    .input(z.object({
        id: z.string(),
    }))
    .mutation(async ({input,ctx}) =>await carParkService.startParking(
        ctx.auth.userId,
        input.id
    )),
    endParking: protectedProcedure
    .input(z.object({
        id: z.string()
    }))
    .mutation(async ({input,ctx}) => await carParkService.endParking(
        ctx.auth.userId,
        input.id
    )),
    setFavourite: protectedProcedure
    .input(z.object({
        id: z.string(),
        isFavourited: z.boolean()
    }))
    .mutation(async ({input,ctx}) => await carParkService.setFavourite(
        ctx.auth.userId,
        input.id,
        input.isFavourited
    )),
    review: protectedProcedure
    .input(z.object({
        id: z.string(),
        rating: z.number().min(1).max(5),
        description: z.string()
    }))
    .mutation(async ({input,ctx}) => await carParkService.createReview(
        ctx.auth.userId,
        input.id,
        input.rating,
        input.description
    ))
})