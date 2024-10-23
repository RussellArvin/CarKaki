import { Checkbox } from "@radix-ui/react-checkbox";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { CaretSortIcon, DotsHorizontalIcon } from "@radix-ui/react-icons";
import { ColumnDef, ColumnFiltersState, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, SortingState, useReactTable, VisibilityState } from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown, ChevronDownIcon, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, MoreHorizontal, Table } from "lucide-react";
import { useRouter } from "next/router";
import React from "react";
import { ParkingDataTable } from "~/components/global/carpark-table";
import Navbar from "~/components/global/navbar";
import { ParkingHistoryTable } from "~/components/global/parking-history-table";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Skeleton } from "~/components/ui/skeleton";
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import APP_ROUTES from "~/lib/constants/APP_ROUTES";
import { api, RouterOutputs } from "~/utils/api";


  export default function ParkingHistoryPage() {

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
