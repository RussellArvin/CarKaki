import React from "react";
import Navbar from "~/components/global/navbar";
import { ParkingHistoryTable } from "~/components/global/parking-history-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { api } from "~/utils/api";


  export default function ParkingHistoryPage() {

    const {
        isLoading,
        data
    } = api.user.getCarParkHistory.useQuery();

    const isPageLoading = isLoading || data === undefined

    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center min-h-screen p-4">
            <Card className="w-full max-w-4xl">
            <CardHeader>
                <CardTitle>Parking History</CardTitle>
                <CardDescription>View your most recent parking history</CardDescription>
            </CardHeader>
            <CardContent>
            {
                isPageLoading ? (<Skeleton className="h-[500px]"/> ) : (<ParkingHistoryTable data={data} />)
            }
            </CardContent>
            </Card>
        </div>
      </>
    );
  }
