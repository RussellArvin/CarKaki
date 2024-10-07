import { carParkRepository } from "../repositories";
import { createTRPCRouter, protectedProcedure } from "../trpc";


//TODO possible change for this?
export const carParkRouter = createTRPCRouter({
    getUserFavourites: protectedProcedure
    .query(async ({ctx}) => {
        return await carParkRepository.findUserFavourites(ctx.auth.userId)
    }),
    getUserHistory: protectedProcedure
    .query(async ({ctx}) => {
        return await carParkRepository.findUserParkingHistory(ctx.auth.userId)
    })
})