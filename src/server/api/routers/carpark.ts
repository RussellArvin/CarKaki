import { z } from "zod";
import { carParkRepository, parkingHistoryRepository, userFavouriteRepository, userReviewRepository } from "../repositories";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { carParkService, uraRequestService  } from "../services";
import { TRPCError } from "@trpc/server";
import { ParkingHistory } from "../models/parking-history";
import { v4 as uuidv4 } from 'uuid';
import { UserFavourite } from "../models/user-favourite";
import { UserReview } from "../models/user-review";


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
    }),
    startParking: protectedProcedure
    .input(z.object({
        id: z.string(),
    }))
    .mutation(async ({input,ctx}) =>{
        const carpark = await carParkRepository.findOneById(input.id);
        const existingParkingHistory = await parkingHistoryRepository.findExistingByUserIdOrNull(
            ctx.auth.userId,
        )

        if(existingParkingHistory) throw new TRPCError({
            code:"BAD_REQUEST",
            message:"You have an ongoing parking record"
        })

        const currentDate = new Date();

        const newParkingHistory = new ParkingHistory({
            id:uuidv4(),
            carParkId: input.id,
            userId: ctx.auth.userId,
            startDate: currentDate,
            endDate: null,
            createdAt: currentDate,
            updatedAt: currentDate
        })
        await parkingHistoryRepository.save(newParkingHistory)
    }),
    endParking: protectedProcedure
    .input(z.object({
        id: z.string()
    }))
    .mutation(async ({input,ctx}) => {
        const existingParkingRecord = await parkingHistoryRepository.findExistingByUserIdAndCarParkId(
            ctx.auth.userId,
            input.id
        )

        const updatedParkingRecord = existingParkingRecord.endParking()
        await parkingHistoryRepository.update(updatedParkingRecord);
    }),
    setFavourite: protectedProcedure
    .input(z.object({
        id: z.string(),
        isFavourited: z.boolean()
    }))
    .mutation(async ({input,ctx}) => {
        const {
            id: carParkId,
            isFavourited
        } = input

        const existingFavourite = await userFavouriteRepository.findOneByCarParkAndUserIdOrNull(
            carParkId,
            ctx.auth.userId
        )

        //User wants to set to favourite but it already favourited
        if(isFavourited && existingFavourite){
            throw new TRPCError({
                code:"BAD_REQUEST",
                message:"Car park already favourited by user"
            })
        }
        //User wants to set to not favourited but already favourited
        else if(!isFavourited && existingFavourite){
            await userFavouriteRepository.update(existingFavourite.delete())
        }
        // User wants to set to favourite but is not favourited
        else if(isFavourited && !existingFavourite){
            await userFavouriteRepository.save(new UserFavourite({
                carParkId,
                userId: ctx.auth.userId,
                createdAt: new Date(),
                deletedAt: null
            }))
        }
        // User wants to set to not favourite but not favourited
        else {
            throw new TRPCError({
                code:"BAD_REQUEST",
                message:"Car park not favourited by user"
            })
        }
    }),
    review: protectedProcedure
    .input(z.object({
        id: z.string(),
        rating: z.number().min(1).max(5),
        description: z.string()
    }))
    .mutation(async ({input,ctx}) => {
        const {
            id: carParkId,
            rating,
            description
        } = input;

        const [carPark, existingReview] = await Promise.all([
            await carParkRepository.findOneById(carParkId),
            await userReviewRepository.findOneByUserIdAndCarParkId(
                ctx.auth.userId,
                carParkId
            )
        ]);

        if(existingReview) throw new TRPCError({
            code:"BAD_REQUEST",
            message:"You have already written a review for this car park"
        })

        const currentDate = new Date();
        const userReview = new UserReview({
            carParkId,
            userId: ctx.auth.userId,
            rating,
            description,
            createdAt: currentDate,
            updatedAt: currentDate,
            deletedAt: null
        })
        await userReviewRepository.save(userReview)
    })

})