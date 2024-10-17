import { z } from "zod";
import { carParkRepository } from "../repositories";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { carParkService } from "../services";
import { checkAndMakeURARequests } from "../services/ura-request-service";

export const carParkRouter = createTRPCRouter({
    getDetails: protectedProcedure
    .input(z.object({
        id: z.string()
    }))
    .query(async ({ctx,input}) => {
        const [carpark] = await Promise.all([
            await carParkService.mapOneCarParkWithAddress(
                await carParkRepository.findOneById(input.id)
            ),
            await checkAndMakeURARequests() //Reload URA Data
        ])

        const {
            name,
            address,
            capacity,
            availableLots,
        } = carpark.getValue()

        return{
            name,
            address,
            capacity,
            availableLots,
        }

    }),
    getFullDetails: protectedProcedure
    .input(z.object({
        id: z.string()
    }))
    .query(async ({ctx,input}) => {

         const [carpark] = await Promise.all([
            await carParkService.mapOneCarParkWithAddress(
                await carParkRepository.findOneById(input.id)
            ),
            await checkAndMakeURARequests() //Reload URA Data
        ])

        const [nearByCarParks, isFavourited] = await Promise.all([
            carParkService.mapManyCarParkWithAddress(
                await carParkRepository.findNearByCarParks(carpark.getValue().location,10)
            ),
            carParkRepository.isFavouritedByUser(input.id,ctx.auth.userId)
        ])


        const {
            id,
            name,
            address,
            capacity,
            availableLots,
        } = carpark.getValue()

        return{
            id,
            name,
            address,
            capacity,
            availableLots,
            isFavourited,
            nearByCarParks: nearByCarParks.map((item) => {
                const {id,name,address,capacity,availableLots} = item.getValue();
                return {
                    id,name,address,capacity,availableLots
                }
            })
        }
    }),
    getRate: protectedProcedure
    .input(z.object({
        hours: z.number().min(1),
        id: z.string()
    }))
    .mutation(async ({input}) => {
        const { hours, id } = input;

        return {
            rate: await carParkService.getAppropriateRate(id, hours* 60)
        }
    })
})