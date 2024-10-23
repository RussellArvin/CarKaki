
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import UserDetails from "../types/user-details";
import { userService } from "../services";

export const userRouter = createTRPCRouter({
    getFrequentlyVisitedCarParks: protectedProcedure
    .query(async ({ctx})=> await userService.getFrequentlyVisitedCarParks(ctx.auth.userId)),
    getFavouriteCarParks: protectedProcedure
    .query(async ({ctx}) => await userService.getFavouriteCarParks(ctx.auth.userId)),
    getCarParkHistory: protectedProcedure
    .query(async ({ctx}) => await userService.getCarParkHistory(ctx.auth.userId)),
    getSavedCarParks: protectedProcedure
    .query(async ({ctx})=> await userService.getSavedCarParks(ctx.auth.userId)),
    updateNames: protectedProcedure
    .input(z.object({
        firstName: z.string(),
        lastName: z.string()
    }))
    .mutation(async ({ctx,input}) => await userService.updateNames(
        ctx.auth.userId,
        input.firstName,
        input.lastName
    )),
    updateMainSettings: protectedProcedure
    .input(z.object({
        isNotificationsEnabled:z.boolean(),
        isDarkMode: z.boolean()
    }))
    .mutation(async ({ctx,input}) => await userService.updateMainSettings(
        ctx.auth.userId,
        input.isNotificationsEnabled,
        input.isDarkMode
    )),
    setHomeCarPark: protectedProcedure
    .input(z.object({
        id: z.string()
    }))
    .mutation( async ({ctx,input}) => await userService.setHomeCarPark(ctx.auth.userId, input.id)),
    setWorkCarPark: protectedProcedure
    .input(z.object({
        id: z.string()
    }))
    .mutation( async ({ctx,input}) => await userService.setWorkCarPark(ctx.auth.userId, input.id)),
    register: protectedProcedure
    .mutation(async ({ctx})=> await userService.register(ctx.auth.userId)),
    delete: protectedProcedure
    .mutation(async ({ctx}) => await userService.deleteUser(ctx.auth.userId)),
    get: protectedProcedure
    .query(async ({ctx}): Promise<UserDetails> => await userService.getUser(ctx.auth.userId)),
    updatePassword: protectedProcedure
    .input(z.object({
        password: z.string(),
    }))
    .mutation(async ({ctx,input}) => await userService.updatePassword(
        ctx.auth.userId,
        input.password
    ))
});
