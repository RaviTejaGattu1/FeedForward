'use client';

import { useState } from 'react';
import { AppHeader } from '@/components/layout/app-header';
import { AppFooter } from '@/components/layout/app-footer';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle2,
  ChevronDown,
  MoreHorizontal,
  PlusCircle,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';

type ListingStatus =
  | 'active'
  | 'receiver incoming'
  | 'approved'
  | 'awaiting approval';

const listings = [
  {
    id: '1',
    foodName: 'Sourdough Bread',
    quantity: 10,
    status: 'awaiting approval' as ListingStatus,
    claimedBy: 'Community Shelter',
    createdAt: '2023-10-26T10:00:00Z',
  },
  {
    id: '2',
    foodName: 'Organic Apples',
    quantity: 50,
    status: 'active' as ListingStatus,
    claimedBy: null,
    createdAt: '2023-10-25T14:30:00Z',
  },
  {
    id: '3',
    foodName: 'Canned Beans',
    quantity: 24,
    status: 'approved' as ListingStatus,
    claimedBy: 'Jane Doe',
    createdAt: '2023-10-24T09:00:00Z',
  },
  {
    id: '4',
    foodName: 'Fresh Milk',
    quantity: 12,
    status: 'receiver incoming' as ListingStatus,
    claimedBy: 'Local Food Bank',
    createdAt: '2023-10-23T18:00:00Z',
  },
];

const statusStyles: { [key in ListingStatus]: string } = {
  active: 'bg-green-500/20 text-green-700 border-green-500/40',
  'receiver incoming': 'bg-yellow-500/20 text-yellow-700 border-yellow-500/40',
  approved: 'bg-blue-500/20 text-blue-700 border-blue-500/40',
  'awaiting approval': 'bg-orange-500/20 text-orange-700 border-orange-500/40',
};


export default function MyListingsPage() {
  const [filteredListings, setFilteredListings] = useState(listings);
  
  return (
    <div className="flex min-h-screen w-full flex-col">
      <AppHeader />
      <main className="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 p-4 md:gap-8 md:p-10">
        <div className="mx-auto grid w-full max-w-6xl gap-2">
          <h1 className="text-3xl font-semibold">My Listings</h1>
        </div>
        <div className="mx-auto grid w-full max-w-6xl items-start gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Your Food Listings</CardTitle>
                <CardDescription>
                  Manage your listings and view their status.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-7 gap-1">
                      <ChevronDown className="h-3.5 w-3.5" />
                      <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                        Filter
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Filter by status</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuCheckboxItem checked>
                      Active
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem>
                      Awaiting Approval
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem>
                      Receiver Incoming
                    </DropdownMenuCheckboxItem>
                     <DropdownMenuCheckboxItem>
                      Approved
                    </DropdownMenuCheckboxItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                 <Button size="sm" variant="outline" className="h-7 gap-1" asChild>
                  <Link href="/provide">
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                      New Listing
                    </span>
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Food Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Claimed By</TableHead>
                    <TableHead>
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredListings.map((listing) => (
                    <TableRow key={listing.id}>
                      <TableCell className="font-medium">
                        {listing.foodName}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={statusStyles[listing.status]}
                        >
                          {listing.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{listing.quantity}</TableCell>
                      <TableCell>
                        {listing.claimedBy || 'N/A'}
                      </TableCell>
                      <TableCell>
                         {listing.status === 'awaiting approval' ? (
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="text-green-500 border-green-500 hover:bg-green-500/10 hover:text-green-600">
                              <CheckCircle2 className="mr-2 h-4 w-4" /> Approve
                            </Button>
                            <Button variant="outline" size="sm" className="text-red-500 border-red-500 hover:bg-red-500/10 hover:text-red-600">
                              <XCircle className="mr-2 h-4 w-4" /> Deny
                            </Button>
                          </div>
                        ) : (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              aria-haspopup="true"
                              size="icon"
                              variant="ghost"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Toggle menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>Edit</DropdownMenuItem>
                            <DropdownMenuItem className="text-red-500">Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>
      <AppFooter />
    </div>
  );
}