
'use client';

import { useState, useEffect, useRef } from 'react';
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
  MoreHorizontal,
  PlusCircle,
  XCircle,
  Check,
  MessageSquare,
  LogIn,
  KeyRound,
  Info,
  Trash2,
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
import { useListings, type Listing, type ListingStatus } from '@/hooks/use-listings';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import { JackpotTypewriter } from '@/components/ui/typewriter';

const statusStyles: { [key in ListingStatus]: string } = {
  active: 'bg-green-500/20 text-green-700 border-green-500/40',
  'receiver incoming': 'bg-yellow-500/20 text-yellow-700 border-yellow-500/40',
  approved: 'bg-blue-500/20 text-blue-700 border-blue-500/40',
  'awaiting approval': 'bg-orange-500/20 text-orange-700 border-orange-500/40',
  delivered: 'bg-gray-500/20 text-gray-700 border-gray-500/40',
};

function OtpDisplay({ listingId }: { listingId: string }) {
    const { getOtpForListing } = useListings();
    const otp = getOtpForListing(listingId);

    return (
        <div className="flex items-center gap-2 text-sm border rounded-lg p-2 bg-muted">
            <KeyRound className="h-4 w-4 text-muted-foreground" />
            <span className="text-base">
                <JackpotTypewriter text={otp} />
            </span>
        </div>
    );
}

export default function MyListingsPage() {
  const { user, loading } = useAuth();
  const { listings, updateListing, removeListing, isInitialized } = useListings({ forCurrentUser: true });
  const { toast } = useToast();
  const router = useRouter();
  const [instructions, setInstructions] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);


  const handleApprove = (listingId: string, pickupOption: 'otp' | 'leave') => {
    let updates: Partial<Listing> = {
        status: 'approved',
        pickupMethod: pickupOption,
    };
    if (pickupOption === 'leave') {
        updates.pickupInstructions = instructions;
    }

    updateListing(listingId, updates);

    toast({
      title: 'Request Approved!',
      description: `The requester has been notified.`,
    });
    setInstructions(''); // Reset instructions after submitting
  };

  const handleDeny = (listingId: string) => {
    updateListing(listingId, { status: 'active', claimedBy: null });
     toast({
      title: 'Request Denied',
      description: 'The listing is now active again.',
      variant: 'destructive',
    });
  };

  const handleDelivered = (listingId: string) => {
    updateListing(listingId, { status: 'delivered' });
    toast({
        title: 'Delivery Confirmed',
        description: 'The transaction has been completed.',
    });
  }

  const handleEdit = (listingId: string) => {
    router.push(`/provide?edit=${listingId}`);
  };

  if (loading || !user) {
    return (
       <div className="flex min-h-screen w-full flex-col">
        <AppHeader />
        <main className="flex min-h-[calc(100vh_-_theme(spacing.16))] flex-1 flex-col gap-4 p-4 md:gap-8 md:p-10">
          <div className="mx-auto grid w-full max-w-6xl gap-2">
            <Skeleton className="h-10 w-48" />
          </div>
          <div className="mx-auto grid w-full max-w-6xl items-start gap-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-5 w-80" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
          </div>
        </main>
        <AppFooter />
      </div>
    );
  }

  const activeListings = listings.filter(l => l.status !== 'delivered');
  const deliveredListings = listings.filter(l => l.status === 'delivered');

  const renderListingRow = (listing: Listing) => (
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
            {listing.claimedBy ? (
              <span className="text-sm">{listing.claimedBy}</span>
            ) : 'N/A'
            }
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
                        <div className="grid grid-cols-2 gap-4 py-4">
                           <AlertDialog>
                             <AlertDialogTrigger asChild>
                                <Button variant="outline" className="h-24 flex-col gap-2">
                                  <KeyRound className="h-6 w-6" />
                                  <span>Connect via OTP</span>
                                </Button>
                             </AlertDialogTrigger>
                             <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Approve with OTP?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will generate a one-time password for the recipient to verify the pickup.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleApprove(listing.id, 'otp')}>Confirm</AlertDialogAction>
                                </AlertDialogFooter>
                             </AlertDialogContent>
                           </AlertDialog>
                           
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
                                        <Textarea 
                                            id="instructions" 
                                            placeholder="e.g., 'Item will be in a blue bag next to the front door.'" 
                                            value={instructions}
                                            onChange={(e) => setInstructions(e.target.value)}
                                        />
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
            ) : listing.status === 'approved' ? (
                <div className="flex items-center justify-end gap-4">
                    {listing.pickupMethod === 'otp' && <OtpDisplay listingId={listing.id} />}
                    {listing.pickupMethod === 'leave' && 
                        <div className="flex items-center gap-2 text-sm text-muted-foreground p-2">
                            <Info className="h-4 w-4" />
                            <span>Instructions sent</span>
                        </div>
                    }
                    <Button variant="outline" size="sm" onClick={() => handleDelivered(listing.id)}>
                        <CheckCircle2 className="mr-2 h-4 w-4" /> Delivered
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
                <DropdownMenuItem onClick={() => handleEdit(listing.id)}>Edit</DropdownMenuItem>
                <DropdownMenuItem className="text-red-500" onClick={() => removeListing(listing.id)}>Delete</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            )}
        </TableCell>
        </TableRow>
  );

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
                  Manage your active and pending listings.
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
                  {!isInitialized && Array.from({ length: 3 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell colSpan={4}><Skeleton className="h-8 w-full" /></TableCell>
                      </TableRow>
                  ))}
                  {isInitialized && activeListings.map(renderListingRow)}
                  {isInitialized && activeListings.length === 0 && (
                     <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                            You have no active listings. Create one to get started!
                        </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <Card>
             <CardHeader>
                <CardTitle>Completed Listings</CardTitle>
                <CardDescription>
                  Your past delivered listings.
                </CardDescription>
             </CardHeader>
             <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Food Name</TableHead>
                             <TableHead>Status</TableHead>
                            <TableHead>Claimed By</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isInitialized && deliveredListings.map((listing) => (
                            <TableRow key={listing.id}>
                                <TableCell>{listing.foodName}</TableCell>
                                <TableCell>
                                    <Badge
                                    variant="outline"
                                    className={statusStyles[listing.status]}
                                    >
                                    {listing.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>{listing.claimedBy}</TableCell>
                                <TableCell>{new Date(listing.createdAt).toLocaleDateString()}</TableCell>
                                <TableCell className="text-right">
                                    <AlertDialog>
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
                                            <AlertDialogTrigger asChild>
                                                <DropdownMenuItem className="text-red-500">
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </AlertDialogTrigger>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This action cannot be undone. This will permanently delete this listing data.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction
                                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                    onClick={() => removeListing(listing.id)}
                                                >
                                                    Delete
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </TableCell>
                            </TableRow>
                        ))}
                        {isInitialized && deliveredListings.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                                    You have no delivered listings yet.
                                </TableCell>
                            </TableRow>
                        )}
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
