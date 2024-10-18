import { z } from "zod";
import { carParkRepository } from "../repositories";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { carParkService, uraRequestService  } from "../services";


interface CarParkDetails {
    id: string
    name: string
    address: string | null
    capacity: number
    availableLots: number
}

interface FullCarParkDetails extends CarParkDetails{
    isFavourited: boolean
    nearByCarParks: CarParkDetails[]
}

export const carParkRouter = createTRPCRouter({
    getDetails: protectedProcedure
    .input(z.object({
        x:z.number(),
        y:z.number()
    }))
    .query(async ({ctx,input}): Promise<CarParkDetails> => {
        const {x,y} = input;

        const [carpark] = await Promise.all([
            await carParkService.mapOneCarParkWithAddress(
                await carParkRepository.findOneByLocation({x,y})
            ),
            await uraRequestService.checkAndMakeRequests() //Reload URA Data
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
        }

    }),
    getFullDetails: protectedProcedure
    .input(z.object({
        id: z.string()
    }))
    .query(async ({ctx,input}): Promise<FullCarParkDetails> => {

         const [carpark] = await Promise.all([
            await carParkService.mapOneCarParkWithAddress(
                await carParkRepository.findOneById(input.id)
            ),
            await uraRequestService.checkAndMakeRequests() //Reload URA Data
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