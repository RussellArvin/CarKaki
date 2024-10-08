import { z } from "zod";
import { carParkRepository } from "../repositories";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { getAppropriateRate, mapManyCarParkWithAddress, mapOneCarParkWithAddress } from "../services/car-park-service";
import { checkAndMakeURARequests } from "../services/ura-request-service";

export const carParkRouter = createTRPCRouter({
    getDetails: protectedProcedure
    .input(z.object({
        id: z.string()
    }))
    .query(async ({ctx,input}) => {
        const [carpark] = await Promise.all([
            await mapOneCarParkWithAddress(
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
            rate: getAppropriateRate(carpark),
        }

    }),
    getFullDetails: protectedProcedure
    .input(z.object({
        id: z.string()
    }))
    .query(async ({ctx,input}) => {

        const [carpark] = await Promise.all([
            await mapOneCarParkWithAddress(
                await carParkRepository.findOneById(input.id)
            ),
            await checkAndMakeURARequests() //Reload URA Data
        ])

        const nearByCarParks = await mapManyCarParkWithAddress(
            await carParkRepository.findNearByCarParks(carpark.getValue().location,5)
        );

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
            rate: getAppropriateRate(carpark),
            //TODO: DB call to check for this
            isFavourited: false,
            nearByCarParks: nearByCarParks.map((item) => {
                const {name,address,capacity,availableLots} = item.getValue();
                return {
                    name,address,capacity,availableLots
                }
            })
        }
    })
})