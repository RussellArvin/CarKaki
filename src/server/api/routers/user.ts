
import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";
import { carParkRepository, parkingHistoryRepository, userRepository } from "../repositories";
import handleError from "~/server/utils/handleError"
import { getUserInformation } from "~/server/utils/clerk";
import { User } from "../models/user";
import clerk from "@clerk/clerk-sdk-node";

export const userRouter = createTRPCRouter({
    getFrequentlyVisitedCarParks: protectedProcedure
    .query(async ({ctx})=> {
        return await parkingHistoryRepository.findFrequentlyVisited(ctx.auth.userId)
    }),
    getFavouriteCarParks: protectedProcedure
    .query(async ({ctx}) => {
        return await carParkRepository.findUserFavourites(ctx.auth.userId)
    }),
    getCarParkHistory: protectedProcedure
    .query(async ({ctx}) => {
        return await carParkRepository.findUserParkingHistory(ctx.auth.userId)
    }),
    updateNames: protectedProcedure
    .input(z.object({
        firstName: z.string(),
        lastName: z.string()
    }))
    .mutation(async ({ctx,input}) => {
       try{
            const user = await userRepository.findOneByUserId(ctx.auth.userId);
            const updatedUser = user.setNames(input.firstName,input.lastName);

            await userRepository.update(updatedUser);
            return;
       } catch(e) {handleError(e)}
    }),
    updateMainSettings: protectedProcedure
    .input(z.object({
        isNotificationsEnabled:z.boolean(),
        isDarkMode: z.boolean()
    }))
    .mutation(async ({ctx,input})=>{
        try{
             const user = await userRepository.findOneByUserId(ctx.auth.userId)
             const updatedUser = user.setMainSettings(
                input.isNotificationsEnabled,
                input.isDarkMode
             )

             await userRepository.update(updatedUser);
             return;
        } catch(e){handleError(e)}
    }),
    getMainSettings: protectedProcedure
    .query(async ({ctx}) => {
        try{
            const user = await userRepository.findOneByUserId(ctx.auth.userId);
            const { isDarkMode, isNotificationsEnabled } = user.getValue();

            return{
                isDarkMode,
                isNotificationsEnabled
            }
        } catch(e) {handleError(e)}
    }),
    register: protectedProcedure
    .mutation(async ({ctx})=> {
        try{
            const userDetails = await getUserInformation(ctx.auth.userId);
            const currentDate = new Date();

            const user = new User({
                ...userDetails,
                id: ctx.auth.userId,
                isDarkMode:false,
                isNotificationsEnabled: false,
                createdAt: currentDate,
                updatedAt: currentDate,
                deletedAt: null,
                homeCarParkId: null,
                workCarParkId: null
            })

            await userRepository.save(user);
            return;
        } catch(e){handleError(e)}
    }),
    get: protectedProcedure
    .query(async ({ctx}) => {
        const user = await userRepository.findOneByUserId(ctx.auth.userId)
        return user.getValue()
    }),
    updatePassword: protectedProcedure
    .input(z.object({
        password: z.string(),
    }))
    .mutation(async ({ctx,input}) => {
        try{
            await clerk.users.updateUser(ctx.auth.userId,{
                password: input.password
            })
            return;
        } catch(e) {handleError(e)}
    })
});
