import toast from "react-hot-toast";
import { Button } from "../ui/button";
import useUserStore from "./user-store";
import { api } from "~/utils/api";
import { TRPCClientError } from "@trpc/client";

interface ParkingControlsProps {
    carParkId: string
}

export const ParkingControls = ({ carParkId }: ParkingControlsProps) => {
    const { user } = useUserStore();
    const userContext = api.useUtils().user;

    const {
        mutateAsync: startParkingMutationAsync
      } = api.carPark.startParking.useMutation()
    
      const {
        mutateAsync: endParkingMutationAsync
      } = api.carPark.endParking.useMutation()
    
    const currentParking = user?.currentParking;
    const isParkedHere = currentParking?.carParkId === carParkId;
    const isParkedElsewhere = currentParking && !isParkedHere;

    const startParking = async () => {
      
        await toast.promise(
          startParkingMutationAsync({
            id: carParkId
          }), 
          {
            loading: 'Starting parking session...',
            success: () => {
              void userContext.get.invalidate();
              return 'Parking session started!'
            },
            error: (error) => {
              if (error instanceof TRPCClientError) {
                  return error.message;
              }
              return "Failed to start parking session";
          }
          }
        );
      }
  
      const endParking = async () => {
      
        await toast.promise(
          endParkingMutationAsync({
            id: carParkId
          }), 
          {
            loading: 'Ending parking session...',
            success: () => {
              void userContext.get.invalidate();
              return 'Parking session ended!'
            },
            error: (error) => {
              if (error instanceof TRPCClientError) {
                  return error.message;
              }
              return "Failed to end parking session";
          }
          }
        );
      }
  

    if (isParkedElsewhere) return null;

    if (isParkedHere) {
        return (
            <Button 
                variant="destructive"
                onClick={endParking}
            >
                End Parking
            </Button>
        );
    }

    return (
        <Button 
            className="text-white w-full sm:w-auto bg-green-600 hover:bg-green-700"
            onClick={startParking}
        >
            Start Parking
        </Button>
    );
}