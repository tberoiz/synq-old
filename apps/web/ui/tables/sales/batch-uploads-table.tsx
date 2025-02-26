// "use client";

// import { Button } from "@synq/ui/button";
// import { Input } from "@synq/ui/input";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@synq/ui/table";
// import { Edit, Clock, CheckCircle, AlertCircle, Plus } from "lucide-react";

// interface BatchUpload {
//   id: string;
//   status: "Draft" | "In progress" | "Listed" | "Failed";
//   date: string; // ISO date string
//   totalItems: number;
//   amount: number;
//   platform: string;
// }

// interface Listing {
//   id: string;
//   status: "pending" | "listed" | "failed";
//   listId: string;
//   platform: string;
//   link: string;
// }

// interface BulkListingBatch {
//   id: string;
//   name: string;
//   description: string;
//   totalListings: number;
//   successfulListings: number;
//   failedListings: number;
//   listings: Listing[];
// }

// // Mock data for batch uploads
// interface BatchUpload {
//   id: string;
//   status: "In progress" | "Listed" | "Failed";
//   date: string;
//   totalItems: number;
//   amount: number;
//   platform: "eBay";
// }

// const mockBatchUploads: BatchUpload[] = [
//   {
//     id: "1",
//     status: "In progress",
//     date: "2024-10-01",
//     totalItems: 50,
//     amount: 1000,
//     platform: "eBay",
//   },
//   {
//     id: "2",
//     status: "In progress",
//     date: "2024-10-02",
//     totalItems: 30,
//     amount: 600,
//     platform: "eBay",
//   },
//   {
//     id: "3",
//     status: "In progress",
//     date: "2024-10-03",
//     totalItems: 20,
//     amount: 400,
//     platform: "eBay",
//   },
//   {
//     id: "4",
//     status: "In progress",
//     date: "2024-10-04",
//     totalItems: 45,
//     amount: 900,
//     platform: "eBay",
//   },
//   {
//     id: "5",
//     status: "Listed",
//     date: "2024-10-05",
//     totalItems: 60,
//     amount: 1200,
//     platform: "eBay",
//   },
//   {
//     id: "6",
//     status: "Listed",
//     date: "2024-10-06",
//     totalItems: 25,
//     amount: 500,
//     platform: "eBay",
//   },
//   {
//     id: "7",
//     status: "Listed",
//     date: "2024-10-07",
//     totalItems: 35,
//     amount: 700,
//     platform: "eBay",
//   },
//   {
//     id: "8",
//     status: "Listed",
//     date: "2024-10-08",
//     totalItems: 55,
//     amount: 1100,
//     platform: "eBay",
//   },
//   {
//     id: "9",
//     status: "Listed",
//     date: "2024-10-09",
//     totalItems: 15,
//     amount: 300,
//     platform: "eBay",
//   },
//   {
//     id: "10",
//     status: "Listed",
//     date: "2024-10-10",
//     totalItems: 40,
//     amount: 800,
//     platform: "eBay",
//   },
//   {
//     id: "11",
//     status: "In progress",
//     date: "2024-10-11",
//     totalItems: 70,
//     amount: 1400,
//     platform: "eBay",
//   },
//   {
//     id: "12",
//     status: "Failed",
//     date: "2024-10-12",
//     totalItems: 10,
//     amount: 200,
//     platform: "eBay",
//   },
//   {
//     id: "13",
//     status: "Listed",
//     date: "2024-10-13",
//     totalItems: 50,
//     amount: 1000,
//     platform: "eBay",
//   },
//   {
//     id: "14",
//     status: "In progress",
//     date: "2024-10-14",
//     totalItems: 65,
//     amount: 1300,
//     platform: "eBay",
//   },
//   {
//     id: "15",
//     status: "Failed",
//     date: "2024-10-15",
//     totalItems: 18,
//     amount: 360,
//     platform: "eBay",
//   },
//   {
//     id: "16",
//     status: "Listed",
//     date: "2024-10-16",
//     totalItems: 42,
//     amount: 840,
//     platform: "eBay",
//   },
//   {
//     id: "17",
//     status: "In progress",
//     date: "2024-10-17",
//     totalItems: 75,
//     amount: 1500,
//     platform: "eBay",
//   },
//   {
//     id: "18",
//     status: "Failed",
//     date: "2024-10-18",
//     totalItems: 22,
//     amount: 440,
//     platform: "eBay",
//   },
// ];

// // Mock data for bulk listing details
// const mockBulkListingBatch: BulkListingBatch = {
//   id: "123",
//   name: "Summer Collection 2023",
//   description: "List summer fashion items across multiple platforms.",
//   totalListings: 50,
//   successfulListings: 45,
//   failedListings: 5,
//   listings: [
//     {
//       id: "1",
//       status: "listed",
//       listId: "L12345",
//       platform: "Etsy",
//       link: "https://etsy.com/listing/12345",
//     },
//     {
//       id: "2",
//       status: "failed",
//       listId: "L67890",
//       platform: "Amazon",
//       link: "https://amazon.com/listing/67890",
//     },
//     {
//       id: "3",
//       status: "pending",
//       listId: "L54321",
//       platform: "eBay",
//       link: "https://ebay.com/listing/54321",
//     },
//   ],
// };

// export function BatchUploadsTable() {
//   const getStatusIcon = (status: BatchUpload["status"]) => {
//     switch (status) {
//       case "Draft":
//         return <Edit className="w-4 h-4 mr-2" />;
//       case "In progress":
//         return <Clock className="w-4 h-4 mr-2" />;
//       case "Listed":
//         return <CheckCircle className="w-4 h-4 mr-2" />;
//       case "Failed":
//         return <AlertCircle className="w-4 h-4 mr-2" />;
//       default:
//         return null;
//     }
//   };

//   return (
//     <>
//     <div className="flex justify-between">
//       <h2 className="text-3xl font-semibold ml-1 mb-2">Listings</h2>
//       <div className="flex gap-4">
//       <Input
//         size={24}
//         placeholder="Search..."
//         className="max-w-sm flex-1"
//       />
//       <Button size="sm">New Listing<Plus /></Button>
//       </div>
//     </div>
//       <div className="border rounded-lg overflow-x-auto max-h-[600px] overflow-y-auto">
//         <Table>
//           <TableHeader>
//             <TableRow>
//               <TableHead>Status</TableHead>
//               <TableHead>Date</TableHead>
//               <TableHead>Total Items</TableHead>
//               <TableHead>Amount</TableHead>
//               <TableHead>Platform</TableHead>
//             </TableRow>
//           </TableHeader>
//           <TableBody>
//             {mockBatchUploads.map((batch) => (
//               <TableRow className="cursor-pointer hover:bg-gray-50">
//                 <TableCell>
//                   <div
//                     className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
//                       batch.status === "Draft"
//                         ? "bg-gray-100 text-gray-800"
//                         : batch.status === "In progress"
//                           ? "bg-blue-100 text-blue-800"
//                           : batch.status === "Listed"
//                             ? "bg-green-100 text-green-800"
//                             : "bg-red-100 text-red-800"
//                     }`}
//                   >
//                     {getStatusIcon(batch.status)}
//                     {batch.status}
//                   </div>
//                 </TableCell>
//                 <TableCell>
//                   {new Date(batch.date).toLocaleDateString()}
//                 </TableCell>
//                 <TableCell>{batch.totalItems}</TableCell>
//                 <TableCell>
//                   {new Intl.NumberFormat("en-US", {
//                     style: "currency",
//                     currency: "USD",
//                   }).format(batch.amount)}
//                 </TableCell>
//                 <TableCell>
//                   <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
//                     {batch.platform}
//                   </div>
//                 </TableCell>
//               </TableRow>
//             ))}
//           </TableBody>
//         </Table>
//       </div>
//     </>
//   );
// }
