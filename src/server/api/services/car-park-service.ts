import { TRPCError } from "@trpc/server";
import { uraRequestService } from ".";
import { GoogleMap } from "../external-apis/google-maps";
import { CarPark } from "../models/car-park";
import { CarParkRepository } from "../repositories/car-park-repository";
import Location from "../types/location";
import { ParkingHistoryRepository } from "../repositories/parking-history-repository";
import { ParkingHistory } from "../models/parking-history";
import { v4 as uuidv4 } from 'uuid';
import { UserFavourite } from "../models/user-favourite";
import { UserFavouriteRepository } from "../repositories/user-favourite-repository";
import { UserReview } from "../models/user-review";
import { UserReviewRepository } from "../repositories/user-review-repository";
import CarParkReviewItems from "../types/car-park-review";
interface CarParkDetails {
    id: string
    name: string
    address: string | null
    capacity: number
    availableLots: number
}

interface FullCarParkDetails extends CarParkDetails{
    isFavourited: boolean
    location: Location
    nearByCarParks: CarParkDetails[]
    reviews: CarParkReviewItems[]
}

export class CarParkService{
    private carParkRepository: CarParkRepository
    private parkingHistoryRepository: ParkingHistoryRepository
    private userFavouriteRepository: UserFavouriteRepository
    private userReviewRepository: UserReviewRepository

    constructor(
        carParkRepository: CarParkRepository,
        parkingHistoryRepository: ParkingHistoryRepository,
        userFavouriteRepository: UserFavouriteRepository,
        userReviewRepository: UserReviewRepository
    ){
        this.carParkRepository = carParkRepository
        this.parkingHistoryRepository = parkingHistoryRepository
        this.userFavouriteRepository = userFavouriteRepository
        this.userReviewRepository = userReviewRepository
    }

    private async mapOneCarParkWithAddress(carPark:CarPark): Promise<CarPark> {
        const { address, location } = carPark.getValue()
        if(address) return carPark;
        
        const updatedCarPark =  new CarPark({
            ...carPark.getValue(),
            address: await GoogleMap.getAddressFromCoordinates(location)
        })
        await this.carParkRepository.update(updatedCarPark);
        return updatedCarPark;
    }

    private async mapManyCarParkWithAddress(carParks: CarPark[]): Promise<CarPark[]>{
        return Promise.all(carParks.map(carPark => this.mapOneCarParkWithAddress(carPark)))
    }

    public async getDetails(location: Location, offset: number): Promise<CarParkDetails>{
        try{
            const {x,y} = location

            const [carpark] = await Promise.all([
                await this.mapOneCarParkWithAddress(
                    await this.carParkRepository.findOneByLocation({x,y}, offset)
                ),
                await uraRequestService.checkAndMakeRequests()
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
        } catch(err){
            if(err instanceof TRPCError) throw err;

            const e = err as Error;
            throw new TRPCError({
                code:"INTERNAL_SERVER_ERROR",
                message:e.message
            })
        }
    }

    public async getFullDetails(
        userId: string,
        carParkId: string,
    ): Promise<FullCarParkDetails>{
        try{
            const [carpark] = await Promise.all([
                await this.mapOneCarParkWithAddress(
                    await this.carParkRepository.findOneById(carParkId)
                ),
                await uraRequestService.checkAndMakeRequests() //Reload URA Data
            ])
    
            const [nearByCarParks, isFavourited, reviews] = await Promise.all([
                this.mapManyCarParkWithAddress(
                    await this.carParkRepository.findNearByCarParks(carpark.getValue().location,10)
                ),
                this.carParkRepository.isFavouritedByUser(carParkId,userId),
                this.userReviewRepository.findManyByCarParkId(carParkId)
            ])
    
    
            const {
                id,
                name,
                address,
                capacity,
                availableLots,
                location,
            } = carpark.getValue()
    
            return{
                id,
                name,
                address,
                capacity,
                availableLots,
                location,
                isFavourited,
                nearByCarParks: nearByCarParks.map((item) => {
                    const {id,name,address,capacity,availableLots} = item.getValue();
                    return {
                        id,name,address,capacity,availableLots
                    }
                }),
                reviews

            }
        }  catch(err){
            if(err instanceof TRPCError) throw err;

            const e = err as Error;
            throw new TRPCError({
                code:"INTERNAL_SERVER_ERROR",
                message:e.message
            })
        }
    }

    public async startParking(
        userId:string,
        carParkId: string
    ){
        try{
            const carpark = await this.carParkRepository.findOneById(carParkId);
            const existingParkingHistory = await this.parkingHistoryRepository.findExistingByUserIdOrNull(
                userId
            )

            if(existingParkingHistory) throw new TRPCError({
                code:"BAD_REQUEST",
                message:"You have an ongoing parking record"
            })

            const currentDate = new Date();

            const newParkingHistory = new ParkingHistory({
                id:uuidv4(),
                carParkId,
                userId,
                startDate: currentDate,
                endDate: null,
                createdAt: currentDate,
                updatedAt: currentDate
            })
            await this.parkingHistoryRepository.save(newParkingHistory)
        }catch(err){
            if(err instanceof TRPCError) throw err;

            const e = err as Error;
            throw new TRPCError({
                code:"INTERNAL_SERVER_ERROR",
                message:e.message
            })
        }
    }

    public async endParking(
        userId:string,
        carParkId: string
    ){
        try{
            const existingParkingRecord = await this.parkingHistoryRepository.findExistingByUserIdAndCarParkId(
                userId,
                carParkId
            )
    
            const updatedParkingRecord = existingParkingRecord.endParking()
            await this.parkingHistoryRepository.update(updatedParkingRecord);
        }catch(err){
            if(err instanceof TRPCError) throw err;

            const e = err as Error;
            throw new TRPCError({
                code:"INTERNAL_SERVER_ERROR",
                message:e.message
            })
        }
    }

    public async setFavourite(
        userId:string,
        carParkId: string,
        isFavourited: boolean
    ){
        try{
            const existingFavourite = await this.userFavouriteRepository.findOneByCarParkAndUserIdOrNull(
                carParkId,
                userId
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
                console.log("HERE")
                await this.userFavouriteRepository.update(existingFavourite.delete())
            }
            // User wants to set to favourite but is not favourited
            else if(isFavourited && !existingFavourite){
                await this.userFavouriteRepository.save(new UserFavourite({
                    id: uuidv4(),
                    carParkId,
                    userId,
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
        }catch(err){
            if(err instanceof TRPCError) throw err;

            const e = err as Error;
            throw new TRPCError({
                code:"INTERNAL_SERVER_ERROR",
                message:e.message
            })
        }
    }

    public async createReview(
        userId:string,
        carParkId: string,
        rating: number,
        description: string
    ){
        try{
    
            const [carPark, existingReview] = await Promise.all([
                await this.carParkRepository.findOneById(carParkId),
                await this.userReviewRepository.findOneByUserIdAndCarParkIdOrNull(
                    userId,
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
                userId,
                rating,
                description,
                createdAt: currentDate,
                updatedAt: currentDate,
                deletedAt: null
            })
            await this.userReviewRepository.save(userReview)
        }catch(err){
            if(err instanceof TRPCError) throw err;

            const e = err as Error;
            throw new TRPCError({
                code:"INTERNAL_SERVER_ERROR",
                message:e.message
            })
        }
    }

}
