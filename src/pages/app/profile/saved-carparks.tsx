import React from "react";
import Navbar from "~/components/global/navbar";
import { SavedCarParksTable } from "~/components/global/saved-carparks";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { api } from "~/utils/api";


  export default function ParkingHistoryPage() {

    const {
        isLoading,
        data
    } = api.user.getSavedCarParks.useQuery();

    const isPageLoading = isLoading || data === undefined

    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center min-h-screen p-4">
            <Card className="w-full max-w-4xl">
            <CardHeader>
                <CardTitle>Saved Carparks</CardTitle>
                <CardDescription>View your saved carparks</CardDescription>
            </CardHeader>
            <CardContent>
            {
                isPageLoading ? (<Skeleton className="h-[500px]"/> ) : (<SavedCarParksTable data={data} />)
            }
            </CardContent>
            </Card>
        </div>
      </>
    );
  }
