import { TRPCError } from "@trpc/server";
import { CarParkRepository } from "../repositories/car-park-repository";
import { ParkingHistoryRepository } from "../repositories/parking-history-repository";
import { UserRepository } from "../repositories/user-repository";
import { User } from "../models/user";
import UserDetails from "../types/user-details";
import clerk from "@clerk/clerk-sdk-node";
import FavouriteCarPark from "../types/favourite-carpark";
import CarParkHistory from "../types/car-park-history";
import { UserReviewRepository } from "../repositories/user-review-repository";
import { UserFavouriteRepository } from "../repositories/user-favourite-repository";

export class UserService {
    private carParkRepository: CarParkRepository
    private parkingHistoryRepostiory: ParkingHistoryRepository
    private userRepository: UserRepository
    private userReviewRepository: UserReviewRepository
    private userFavouriteRepository: UserFavouriteRepository

    constructor(
        carParkRepository: CarParkRepository,
        parkingHistoryRepository: ParkingHistoryRepository,
        userRepository: UserRepository,
        userReviewRepository: UserReviewRepository,
        userFavouriteRepository: UserFavouriteRepository,
    ){
        this.carParkRepository = carParkRepository;
        this.parkingHistoryRepostiory = parkingHistoryRepository;
        this.userRepository = userRepository;
        this.userReviewRepository = userReviewRepository;
        this.userFavouriteRepository = userFavouriteRepository;
    }

    public async getFrequentlyVisitedCarParks(userId: string){
        return await this.parkingHistoryRepostiory.findFrequentlyVisited(userId)
    }

    public async getFavouriteCarParks(userId: string): Promise<FavouriteCarPark[]>{
        return (await this.carParkRepository.findUserFavourites(userId)).map((carPark) => {
            return {
                ...carPark,
                isFavourited: true
            }
        })
    }

    public async getCarParkHistory(userId: string): Promise<CarParkHistory[]>{
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

    public async register(
        userId: string,
        firstName: string | null,
        lastName: string | null,
        email: string,
    ){
        try{
            const existingUser = await this.userRepository.findOneByUserIdOrNull(userId);
  
            if (existingUser) return { status: 200 };
        
            const currentDate = new Date();
            const newUser = new User({
            id: userId,
            email,
            firstName: firstName ?? "NOT SET",
            lastName: lastName ?? "NOT SET",
            hasSetName: firstName !== null && lastName !== null,
            isDarkMode: false,
            isNotificationsEnabled: false,
            homeCarParkId: null,
            workCarParkId: null,
            createdAt: currentDate,
            deletedAt: null, 
            updatedAt: currentDate
            });

            await this.userRepository.save(newUser);
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

            await Promise.all([
                clerk.users.deleteUser(userId),
                this.userRepository.update(deletedUser),
                this.userReviewRepository.deleteByUserId(userId),
                this.parkingHistoryRepostiory.deleteByUserId(userId),
                this.userFavouriteRepository.deleteByUserId(userId)
            ])

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