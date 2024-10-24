import { TRPCError } from "@trpc/server";
import { CarParkRepository } from "../repositories/car-park-repository";
import { ParkingHistoryRepository } from "../repositories/parking-history-repository";
import { UserRepository } from "../repositories/user-repository";
import { getUserInformation } from "~/server/utils/clerk";
import { User } from "../models/user";
import UserDetails from "../types/user-details";
import clerk from "@clerk/clerk-sdk-node";

export class UserService {
    private carParkRepository: CarParkRepository
    private parkingHistoryRepostiory: ParkingHistoryRepository
    private userRepository: UserRepository

    constructor(
        carParkRepository: CarParkRepository,
        parkingHistoryRepository: ParkingHistoryRepository,
        userRepository: UserRepository
    ){
        this.carParkRepository = carParkRepository;
        this.parkingHistoryRepostiory = parkingHistoryRepository;
        this.userRepository = userRepository;
    }

    public async getFrequentlyVisitedCarParks(userId: string){
        return await this.parkingHistoryRepostiory.findFrequentlyVisited(userId)
    }

    public async getFavouriteCarParks(userId: string){
        return (await this.carParkRepository.findUserFavourites(userId)).map((carPark) => {
            return {
                ...carPark,
                isFavourited: true
            }
        })
    }

    public async getCarParkHistory(userId: string){
        return await this.carParkRepository.findUserParkingHistory(userId)
    }

    public async getSavedCarParks(userId: string){
        return (await this.carParkRepository.findSavedCarParks(userId)).map(
            (carpark) => carpark.getValue()
        )
    }

    public async updateNames(
        userId: string,
        firstName: string,
        lastName: string
    ){
        try{
            const user = await this.userRepository.findOneByUserId(userId);
            const updatedUser = user.setNames(firstName,lastName);

            await this.userRepository.update(updatedUser);
            return;
        } catch(err){
            if(err instanceof TRPCError) throw err;

            const e = err as Error;
            throw new TRPCError({
                code:"INTERNAL_SERVER_ERROR",
                message:e.message
            })
        }
    }

    public async updateMainSettings(
        userId: string,
        isNotificationsEnabled: boolean,
        isDarkMode: boolean
    )  {
        try{
            const user = await this.userRepository.findOneByUserId(userId)
            const updatedUser = user.setMainSettings(
               isNotificationsEnabled,
               isDarkMode
            )

            await this.userRepository.update(updatedUser);
            return;
        } catch(err){
            if(err instanceof TRPCError) throw err;

            const e = err as Error;
            throw new TRPCError({
                code:"INTERNAL_SERVER_ERROR",
                message:e.message
            })
        }
    }

    public async register(userId: string){
        try{
            const userDetails = await getUserInformation(userId);
            const currentDate = new Date();

            const user = new User({
                ...userDetails,
                id: userId,
                isDarkMode:false,
                isNotificationsEnabled: false,
                createdAt: currentDate,
                updatedAt: currentDate,
                deletedAt: null,
                homeCarParkId: null,
                workCarParkId: null
            })

            await this.userRepository.save(user);
            return;
        } catch(err){
            if(err instanceof TRPCError) throw err;

            const e = err as Error;
            throw new TRPCError({
                code:"INTERNAL_SERVER_ERROR",
                message:e.message
            })
        }
    }

    public async deleteUser(userId: string){
        try{
            const user = await this.userRepository.findOneByUserId(userId);
            const deletedUser = user.delete()
            await this.userRepository.update(deletedUser);

            return;
        } catch(err){
            if(err instanceof TRPCError) throw err;

            const e = err as Error;
            throw new TRPCError({
                code:"INTERNAL_SERVER_ERROR",
                message:e.message
            })
        }
    }

    public async setWorkCarPark(userId: string, carParkId: string): Promise<void> {
        try{
            const [carPark, user] = await Promise.all([
                this.carParkRepository.findOneById(carParkId),
                this.userRepository.findOneByUserId(userId)
            ])

            if(user.getValue().homeCarParkId === carParkId) throw new TRPCError({
                code:"BAD_REQUEST",
                message:"Home and work carpark must be different!"
            })
            
            const updatedUser = user.setWorkCarPark(carParkId);
            return await this.userRepository.update(updatedUser);
        } catch(err){
            if(err instanceof TRPCError) throw err;

            const e = err as Error;
            throw new TRPCError({
                code:"INTERNAL_SERVER_ERROR",
                message:e.message
            })
        }
    }

    public async setHomeCarPark(userId: string, carParkId: string): Promise<void> {
        try{
            const [carPark, user] = await Promise.all([
                this.carParkRepository.findOneById(carParkId),
                this.userRepository.findOneByUserId(userId)
            ])

            if(user.getValue().workCarParkId === carParkId) throw new TRPCError({
                code:"BAD_REQUEST",
                message:"Home and work carpark must be different!"
            })
            
            const updatedUser = user.setHomeCarPark(carParkId);
            return await this.userRepository.update(updatedUser);
        } catch(err){
            if(err instanceof TRPCError) throw err;

            const e = err as Error;
            throw new TRPCError({
                code:"INTERNAL_SERVER_ERROR",
                message:e.message
            })
        }
    }

    public async deleteHomeCarPark(userId: string): Promise<void>{
        const user = await this.userRepository.findOneByUserId(userId);
        const updatedUser = user.setHomeCarPark(null);

        await this.userRepository.update(updatedUser);
        return;
    }

    public async deleteWorkCarPark(userId: string): Promise<void>{
        const user = await this.userRepository.findOneByUserId(userId);
        const updatedUser = user.setWorkCarPark(null);

        await this.userRepository.update(updatedUser);
        return;
    }

    public async getUser(userId: string) : Promise<UserDetails>{
        try{
            const [user,currentParking] = await Promise.all([
                await this.userRepository.findOneByUserId(userId),
                await this.carParkRepository.findCurrentParkingOrNull(userId)
            ])
    
            return {
                ...user.getValue(),
                currentParking
            }
        } catch(err){
            if(err instanceof TRPCError) throw err;

            const e = err as Error;
            throw new TRPCError({
                code:"INTERNAL_SERVER_ERROR",
                message:e.message
            })
        }
    }

    public async updatePassword(
        userId: string,
        password: string
    ) {
        try{
            await clerk.users.updateUser(userId,{
                password: password
            })
            return;
        } catch(err){
            if (typeof err === 'object' && err !== null && 'errors' in err) {
              // This is likely a Clerk API error
              const clerkError = err as { errors: { message: string }[] };
              throw new TRPCError({
                code: "BAD_REQUEST",
                message: clerkError.errors[0]?.message
              });
            }
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "An unexpected error occurred"
            });
        }
    }
}