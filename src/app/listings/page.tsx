
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
  Check,
  MessageSquare,
} from 'lucide-react';
import Link from 'next/link';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

type ListingStatus =
  | 'active'
  | 'receiver incoming'
  | 'approved'
  | 'awaiting approval'
  | 'delivered';

const initialListings = [
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
  delivered: 'bg-gray-500/20 text-gray-700 border-gray-500/40',
};


export default function MyListingsPage() {
  const [listings, setListings] = useState(initialListings);
  const { toast } = useToast();

  const handleApprove = (listingId: string, pickupOption: 'otp' | 'leave') => {
    setListings(
      listings.map((l) =>
        l.id === listingId ? { ...l, status: 'approved' } : l
      )
    );
    toast({
      title: 'Request Approved!',
      description: `The requester has been notified with the ${
        pickupOption === 'otp' ? 'OTP' : 'instructions'
      }.`,
    });
  };

  const handleDeny = (listingId: string) => {
    setListings(
      listings.map((l) =>
        l.id === listingId ? { ...l, status: 'active', claimedBy: null } : l
      )
    );
     toast({
      title: 'Request Denied',
      description: 'The listing is now active again.',
      variant: 'destructive',
    });
  };

  const handleDelivered = (listingId: string) => {
     const updatedListings = listings.filter((l) => l.id !== listingId);
    setListings(updatedListings);
    toast({
        title: 'Transaction Complete!',
        description: 'The listing has been removed from the system.',
    });
  }

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
                    <TableHead>Claimed By</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {listings.map((listing) => (
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
                       <TableCell>
                        {listing.claimedBy || 'N/A'}
                      </TableCell>
                      <TableCell className="text-right">
                         {listing.status === 'awaiting approval' ? (
                          <div className="flex gap-2 justify-end">
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="outline" size="sm" className="text-green-500 border-green-500 hover:bg-green-500/10 hover:text-green-600">
                                        <CheckCircle2 className="mr-2 h-4 w-4" /> Approve
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Choose Pickup Method</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Select how you want to hand over the food item.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                     <div className="grid grid-cols-2 gap-4">
                                        <Button variant="outline" className="h-24 flex-col gap-2" onClick={() => handleApprove(listing.id, 'otp')}>
                                            <Check className="h-6 w-6" />
                                            <span>Connect via OTP</span>
                                        </Button>
                                         <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                 <Button variant="outline" className="h-24 flex-col gap-2">
                                                    <MessageSquare className="h-6 w-6" />
                                                    <span>Just Leave It</span>
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                 <AlertDialogHeader>
                                                    <AlertDialogTitle>Instructions for "Just Leave It"</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Please provide clear instructions for the recipient to find the item.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <div className="grid gap-2">
                                                    <Label htmlFor="instructions">Instructions</Label>
                                                    <Textarea id="instructions" placeholder="e.g., 'Item will be in a blue bag next to the front door.'" />
                                                </div>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleApprove(listing.id, 'leave')}>Confirm</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                         </AlertDialog>
                                    </div>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                            <Button variant="outline" size="sm" className="text-red-500 border-red-500 hover:bg-red-500/10 hover:text-red-600" onClick={() => handleDeny(listing.id)}>
                              <XCircle className="mr-2 h-4 w-4" /> Deny
                            </Button>
                          </div>
                        ) : listing.status === 'approved' || listing.status === 'receiver incoming' ? (
                            <Button variant="outline" size="sm" onClick={() => handleDelivered(listing.id)}>
                                <CheckCircle2 className="mr-2 h-4 w-4" /> Delivered Successfully
                            </Button>
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
