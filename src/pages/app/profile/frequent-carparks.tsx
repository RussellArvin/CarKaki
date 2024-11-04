import React from "react";
import { ParkingDataTable } from "~/components/global/carpark-table";
import Navbar from "~/components/global/navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { api} from "~/utils/api";


  export default function FrequentCarParksPage() {

    const {
        isLoading,
        data
    } = api.user.getFrequentlyVisitedCarParks.useQuery();

    const isPageLoading = isLoading || data === undefined

    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center min-h-screen p-4">
            <Card className="w-full max-w-4xl">
            <CardHeader>
                <CardTitle>Frequently Visited Carparks</CardTitle>
                <CardDescription>View your most recent parking history</CardDescription>
            </CardHeader>
            <CardContent>
            {
                isPageLoading ? (<Skeleton className="h-[500px]"/> ) : (<ParkingDataTable data={data} />)
            }
            </CardContent>
            </Card>
        </div>
      </>
    );
  }
