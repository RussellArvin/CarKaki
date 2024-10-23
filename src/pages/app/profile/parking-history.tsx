import { Checkbox } from "@radix-ui/react-checkbox";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { CaretSortIcon, DotsHorizontalIcon } from "@radix-ui/react-icons";
import { ColumnDef, ColumnFiltersState, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, SortingState, useReactTable, VisibilityState } from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown, ChevronDownIcon, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, MoreHorizontal, Table } from "lucide-react";
import { useRouter } from "next/router";
import React from "react";
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


//   interface ParkingHistory {
//     id: string;
//     code: string;
//     name: string;
//     address: string;
//     vehicleCategory: string;
//     parkingSystem: string;
//     capacity: number;
//     availableLots: number;
//     location: {
//       x: number;
//       y: number;
//     };
//     createdAt: string;
//     updatedAt: string;
//   }
  

// const defaultVisibility: VisibilityState = {
//     code: true,
//     name: true,
//     address: true,
//     vehicleCategory: true,
//     availableLots: true,
//   };
  
//   interface DataTableProps {
//     data: ParkingHistory[];
//   }
  
//   export default function DataTable() {
//     // Initialize column visibility with all columns visible
//     const [columnVisibility, setColumnVisibility] = 
//       React.useState<VisibilityState>(defaultVisibility);
    
//     const [sorting, setSorting] = React.useState<SortingState>([]);
//     const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
//     const [rowSelection, setRowSelection] = React.useState({});
  
//     const columns: ColumnDef<ParkingHistory>[] = [
//       {
//         id: "code",
//         accessorKey: "code",
//         header: "Code",
//         cell: ({ row }) => <div>{row.getValue("code")}</div>,
//       },
//       {
//         id: "name",
//         accessorKey: "name",
//         header: "Name",
//         cell: ({ row }) => <div>{row.getValue("name")}</div>,
//       },
//       {
//         id: "address",
//         accessorKey: "address",
//         header: "Address",
//         cell: ({ row }) => <div>{row.getValue("address")}</div>,
//       },
//       {
//         id: "vehicleCategory",
//         accessorKey: "vehicleCategory",
//         header: "Vehicle Type",
//         cell: ({ row }) => <div>{row.getValue("vehicleCategory")}</div>,
//       },
//       {
//         id: "availableLots",
//         accessorKey: "availableLots",
//         header: "Available Lots",
//         cell: ({ row }) => (
//           <div>
//             {row.getValue("availableLots")} / {row.original.capacity}
//           </div>
//         ),
//       },
//     ];
  
//     const table = useReactTable({
//       data: [
//         {
//             "id": "04afaf8a-abeb-4bc5-b5a2-107ce6d9b420",
//             "code": "J0093",
//             "name": "JOO KOON CRESCENT ",
//             "address": "16 Joo Koon Cres, Singapore 629018",
//             "vehicleCategory": "Car",
//             "parkingSystem": "C",
//             "capacity": 22,
//             "availableLots": 4,
//             "location": {
//                 "x": 10195.5713,
//                 "y": 34602.9943
//             },
//             "createdAt": "2024-10-16T13:48:35.101Z",
//             "updatedAt": "2024-10-21T13:54:54.058Z"
//         },
//         {
//             "id": "f7fd36d2-bf74-4fa8-b81a-5b54f1ffccd4",
//             "code": "J0099",
//             "name": "JALAN BAHAR HEAVY VEHICLE PARK",
//             "address": "11 Jurong West Ave 5, Singapore 649488",
//             "vehicleCategory": "Heavy Vehicle",
//             "parkingSystem": "C",
//             "capacity": 20,
//             "availableLots": 15,
//             "location": {
//                 "x": 13459.4999,
//                 "y": 36687.9521
//             },
//             "createdAt": "2024-10-16T13:48:35.101Z",
//             "updatedAt": "2024-10-21T13:54:54.058Z"
//         }
//     ],
//       columns,
//       getCoreRowModel: getCoreRowModel(),
//       onSortingChange: setSorting,
//       onColumnFiltersChange: setColumnFilters,
//       onColumnVisibilityChange: setColumnVisibility,
//       onRowSelectionChange: setRowSelection,
//       getPaginationRowModel: getPaginationRowModel(),
//       getSortedRowModel: getSortedRowModel(),
//       getFilteredRowModel: getFilteredRowModel(),
//       state: {
//         sorting,
//         columnFilters,
//         columnVisibility,
//         rowSelection,
//       },
//       // Set initial state for pagination
//       initialState: {
//         pagination: {
//           pageSize: 10,
//         },
//       },
//     });
  
//     // Debug logs
//     console.log("Visible Columns:", table.getVisibleFlatColumns());
//     console.log("Column Visibility State:", columnVisibility);
  
//     return (
//       <div className="w-full">
//         <div className="flex items-center justify-between py-4">
//           <Input
//             placeholder="Filter by name..."
//             value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
//             onChange={(event) =>
//               table.getColumn("name")?.setFilterValue(event.target.value)
//             }
//             className="max-w-sm"
//           />
//           <DropdownMenu>
//             <DropdownMenuTrigger asChild>
//               <Button variant="outline" className="ml-auto">
//                 Columns <ChevronDown className="ml-2 h-4 w-4" />
//               </Button>
//             </DropdownMenuTrigger>
//             <DropdownMenuContent align="end">
//               {table
//                 .getAllColumns()
//                 .filter((column) => column.getCanHide())
//                 .map((column) => {
//                   return (
//                     <DropdownMenuCheckboxItem
//                       key={column.id}
//                       className="capitalize"
//                       checked={column.getIsVisible()}
//                       onCheckedChange={(value) => column.toggleVisibility(!!value)}
//                     >
//                       {column.id}
//                     </DropdownMenuCheckboxItem>
//                   );
//                 })}
//             </DropdownMenuContent>
//           </DropdownMenu>
//         </div>
//         <div className="rounded-md border">
//           <Table>
//             <TableHeader>
//               {table.getHeaderGroups().map((headerGroup) => (
//                 <TableRow key={headerGroup.id}>
//                   {headerGroup.headers.map((header) => (
//                     <TableHead key={header.id}>
//                       {header.isPlaceholder
//                         ? null
//                         : flexRender(
//                             header.column.columnDef.header,
//                             header.getContext()
//                           )}
//                     </TableHead>
//                   ))}
//                 </TableRow>
//               ))}
//             </TableHeader>
//             <TableBody>
//               {table.getRowModel().rows?.length ? (
//                 table.getRowModel().rows.map((row) => (
//                   <TableRow
//                     key={row.id}
//                     data-state={row.getIsSelected() && "selected"}
//                   >
//                     {row.getVisibleCells().map((cell) => (
//                       <TableCell key={cell.id}>
//                         {flexRender(
//                           cell.column.columnDef.cell,
//                           cell.getContext()
//                         )}
//                       </TableCell>
//                     ))}
//                   </TableRow>
//                 ))
//               ) : (
//                 <TableRow>
//                   <TableCell
//                     colSpan={columns.length}
//                     className="h-24 text-center"
//                   >
//                     No results.
//                   </TableCell>
//                 </TableRow>
//               )}
//             </TableBody>
//           </Table>
//         </div>
//         <div className="flex items-center justify-between space-x-2 py-4">
//           <div className="text-sm text-muted-foreground">
//             {table.getFilteredSelectedRowModel().rows.length} of{" "}
//             {table.getFilteredRowModel().rows.length} row(s) selected.
//           </div>
//           <div className="flex items-center space-x-2">
//             <Button
//               variant="outline"
//               size="sm"
//               onClick={() => table.previousPage()}
//               disabled={!table.getCanPreviousPage()}
//             >
//               Previous
//             </Button>
//             <Button
//               variant="outline"
//               size="sm"
//               onClick={() => table.nextPage()}
//               disabled={!table.getCanNextPage()}
//             >
//               Next
//             </Button>
//           </div>
//         </div>
//       </div>
//     );
//   }