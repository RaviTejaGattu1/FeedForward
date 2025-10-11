
'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  CookingPot,
  MapPin,
  Check,
  MessageSquare,
  Clock,
  Navigation,
  ChevronLeft,
  LogIn,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useListings } from '@/hooks/use-listings';
import { Skeleton } from '@/components/ui/skeleton';
import {
  GoogleMap,
  DirectionsService,
  DirectionsRenderer,
  useLoadScript,
} from '@react-google-maps/api';
import { getCoordsFromAddress } from '@/lib/geocoding';
import { JackpotTypewriter } from '@/components/ui/typewriter';
import { useAuth } from '@/hooks/use-auth';

type ReservationStatus = 'unreserved' | 'awaiting' | 'approved' | 'completed';
type PickupOption = 'otp' | 'leave' | null;

const MAP_LIBRARIES = ['places'] as (
  | 'places'
  | 'drawing'
  | 'geometry'
  | 'localContext'
  | 'visualization'
)[];

const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';

function ListingDetailSkeleton() {
    return (
        <div className="flex min-h-screen flex-col">
            <AppHeader />
            <main className="flex-1">
                <div className="container py-8 md:py-12">
                    <Skeleton className="h-8 w-32 mb-8" />
                    <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                        <Skeleton className="w-full h-96 rounded-lg" />
                        <div className="flex flex-col gap-6">
                            <Skeleton className="h-8 w-24" />
                            <Skeleton className="h-12 w-3/4" />
                            <Skeleton className="h-6 w-1/2" />
                            <Skeleton className="h-24 w-full" />
                            <Skeleton className="h-12 w-full" />
                        </div>
                    </div>
                </div>
            </main>
            <AppFooter />
        </div>
    );
}

export default function ListingDetailPage({
  params: { id },
}: {
  params: { id: string };
}) {
  const { toast } = useToast();
  const router = useRouter();
  const { getListingById, updateListing, isInitialized } = useListings();
  const { user, loading: authLoading } = useAuth();
  
  const listing = getListingById(id);

  const [reservationStatus, setReservationStatus] = useState<ReservationStatus>('unreserved');
  const [pickupOption, setPickupOption] = useState<PickupOption>(null); 
  const [providerInstructions, setProviderInstructions] = useState('');

  const [directions, setDirections] =
    useState<google.maps.DirectionsResult | null>(null);
  
  const [startLocation, setStartLocation] = useState('');
  const [userLocationCoords, setUserLocationCoords] =
    useState<google.maps.LatLngLiteral | null>(null);
  
  const destination = (listing?.latitude && listing?.longitude) ? { lat: listing.latitude, lng: listing.longitude } : listing?.address;

  const [otp, setOtp] = useState('123456');

  const { isLoaded: isMapLoaded } = useLoadScript(
    googleMapsApiKey
      ? {
          googleMapsApiKey,
          libraries: MAP_LIBRARIES,
        }
      : { skip: true }
  );
  
  const directionsTimeoutRef = useRef<NodeJS.Timeout | null>(null);


  useEffect(() => {
    if (listing) {
        if (listing.status === 'awaiting approval') {
            setReservationStatus('awaiting');
        } else if (listing.status === 'approved') {
            setReservationStatus('approved');
            setPickupOption('otp'); 
        } else if (listing.status === 'delivered') {
            setReservationStatus('completed');
        }
    }
  }, [listing]);

  useEffect(() => {
    if (reservationStatus === 'approved' && pickupOption === 'otp') {
      const finalOtp = String(Math.floor(100000 + Math.random() * 900000));
      setOtp(finalOtp);
    }
  }, [reservationStatus, pickupOption]);

  useEffect(() => {
    if (reservationStatus === 'approved') {
      const lastSearch = localStorage.getItem('lastSearchLocation');
      if (lastSearch) {
        setStartLocation(lastSearch);
      } else if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
             const geocoder = new window.google.maps.Geocoder();
             const latlng = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
            };
            geocoder.geocode({ location: latlng }, (results, status) => {
              if (status === 'OK' && results?.[0]) {
                setStartLocation(results[0].formatted_address);
              }
            });
          },
          () => {
            console.error('Could not get user location.');
            toast({
              variant: 'destructive',
              title: 'Location Error',
              description: 'Could not get your current location. Please enter a starting address.',
            });
          }
        );
      }
    }
  }, [reservationStatus, toast]);

  useEffect(() => {
     if (isMapLoaded && startLocation && destination) {
        if (directionsTimeoutRef.current) {
          clearTimeout(directionsTimeoutRef.current);
        }

        directionsTimeoutRef.current = setTimeout(async () => {
          try {
            const originCoords = await getCoordsFromAddress(startLocation);
            if (originCoords) {
              setUserLocationCoords(originCoords);

              const directionsService = new google.maps.DirectionsService();
              directionsService.route(
                {
                  origin: originCoords,
                  destination: destination,
                  travelMode: google.maps.TravelMode.DRIVING,
                },
                (result, status) => {
                  if (status === google.maps.DirectionsStatus.OK && result) {
                    setDirections(result);
                  } else {
                    console.error(`error fetching directions ${result}`);
                    setDirections(null);
                  }
                }
              );
            } else {
                 setDirections(null);
            }
          } catch (error) {
            console.error("Error getting directions:", error);
            setDirections(null);
          }
        }, 1000); 
     }

      return () => {
      if (directionsTimeoutRef.current) {
        clearTimeout(directionsTimeoutRef.current);
      }
    };
  }, [startLocation, destination, isMapLoaded]);


  const handleReserve = () => {
    if (!listing || !user) return;
    updateListing(listing.id, { status: 'awaiting approval', claimedBy: user.uid });
    setReservationStatus('awaiting');
    toast({
      title: 'Reservation Pending',
      description: 'The provider has been notified. You will be updated once they respond.',
    });
  };

  const handleReceived = () => {
    if (!listing) return;
    updateListing(listing.id, { status: 'delivered' });
    setReservationStatus('completed');
    toast({
      title: 'Transaction Complete!',
      description: 'Thank you for using FeedForward. This listing is now closed.',
    });
  }

  if (!isInitialized || authLoading) {
    return <ListingDetailSkeleton />;
  }

  if (!listing) {
    return (
       <div className="flex min-h-screen flex-col">
        <AppHeader />
        <main className="flex-1 flex items-center justify-center">
            <Card className="text-center w-full max-w-lg">
                <CardHeader>
                    <CardTitle>Listing Not Found</CardTitle>
                    <CardDescription>The food listing you are looking for does not exist or has been removed.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild>
                        <Link href="/search">
                            <ChevronLeft className="mr-2 h-4 w-4" />
                            Back to Search
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        </main>
        <AppFooter />
       </div>
    );
  }

  const isMyListing = user && user.uid === listing.userId;
  const canReserve = user && !isMyListing && reservationStatus === 'unreserved';

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <main className="flex-1">
        <div className="container py-8 md:py-12">
         <Button variant="ghost" onClick={() => router.back()} className="mb-8">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            <div className="relative w-full h-96 rounded-lg overflow-hidden">
              <Image
                src={listing.imageUrl || 'https://placehold.co/600x400/purple/white?text=Food'}
                alt={listing.foodName}
                fill
                className="object-cover"
                data-ai-hint="food item"
              />
            </div>

            <div className="flex flex-col gap-6">
              <div>
                <Badge variant="secondary">{listing.foodType}</Badge>
                <h1 className="text-4xl font-bold tracking-tighter mt-2">
                  {listing.foodName}
                </h1>
                <div className="flex items-center gap-4 text-muted-foreground text-sm mt-2">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{listing.address}</span>
                  </div>
                  <span>Posted {new Date(listing.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Item Details</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Quantity</span>
                    <span>{listing.quantity}</span>
                  </div>
                   {listing.weight && (
                     <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Weight</span>
                        <span>{listing.weight}</span>
                    </div>
                   )}
                   {listing.volume && (
                     <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Volume</span>
                        <span>{listing.volume}</span>
                    </div>
                   )}
                </CardContent>
              </Card>

              {!user && reservationStatus === 'unreserved' && (
                <Card>
                    <CardContent className='pt-6'>
                        <Button className='w-full' asChild>
                            <Link href="/login">
                                <LogIn className='mr-2' />
                                Log in to reserve
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
              )}

              {canReserve && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="lg" className="w-full">
                      Reserve Now
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirm Reservation</AlertDialogTitle>
                      <AlertDialogDescription>
                        You are about to reserve this item. The provider will be
                        notified and will need to approve your request.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleReserve}>
                        Confirm Reservation
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>
          
          {reservationStatus === 'awaiting' && (
              <Alert variant="default" className="mt-8">
                  <Clock className="h-4 w-4" />
                  <AlertTitle>Awaiting Response</AlertTitle>
                  <AlertDescription>
                      Waiting for the provider to respond to your request. You will be notified of any updates.
                  </AlertDescription>
              </Alert>
          )}

          {reservationStatus === 'approved' && pickupOption && (
            <div className="mt-12">
               <h2 className="text-2xl font-semibold tracking-tight mb-6">
                Pickup and Navigation
              </h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                   {pickupOption === 'otp' && (
                      <Card>
                        <CardHeader className="flex-row items-center gap-4">
                            <Check className="h-8 w-8 text-primary" />
                            <CardTitle>Connect via OTP</CardTitle>
                        </CardHeader>
                        <CardContent>
                           <p className="text-sm text-muted-foreground mb-4">
                              Provider accepted request. Provide the OTP below to get the food.
                            </p>
                            <div className="bg-muted p-4 rounded-md text-center">
                                <p className="text-sm">Your OTP</p>
                                <p className="text-4xl">
                                  <JackpotTypewriter text={otp} />
                                </p>
                            </div>
                        </CardContent>
                      </Card>
                   )}
                   {pickupOption === 'leave' && (
                       <Card>
                        <CardHeader className="flex-row items-center gap-4">
                            <MessageSquare className="h-8 w-8 text-primary" />
                            <CardTitle>Just Leave It Instructions</CardTitle>
                        </CardHeader>
                        <CardContent>
                           <p className="text-sm text-muted-foreground mb-4">
                              The provider has left the item for you. Follow their instructions for pickup.
                            </p>
                            <div className="bg-muted p-4 rounded-md">
                                <p className="text-sm font-semibold">Provider's Note:</p>
                                <p className="text-sm">"Item will be in a blue bag next to the front door."</p>
                            </div>
                        </CardContent>
                      </Card>
                   )}
                </div>
                <div>
                  <Card>
                    <CardHeader className="flex-row items-center gap-4">
                        <Navigation className="h-8 w-8 text-primary" />
                        <CardTitle>Route to Pickup Location</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="start-location">Start Location</Label>
                            <Input 
                                id="start-location" 
                                value={startLocation} 
                                onChange={(e) => setStartLocation(e.target.value)}
                                placeholder="Enter your starting address"
                            />
                        </div>
                        <div className="h-64 bg-muted rounded-md flex items-center justify-center">
                           {isMapLoaded ? (
                              <GoogleMap
                                mapContainerClassName="w-full h-full"
                                center={userLocationCoords || { lat: 0, lng: 0 }}
                                zoom={userLocationCoords ? 12 : 1}
                              >
                                {directions && (
                                    <DirectionsRenderer options={{ directions }} />
                                )}
                              </GoogleMap>
                           ) : (
                                <p className="text-muted-foreground">Loading map...</p>
                           )}
                        </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
              <Button size="lg" className="w-full mt-8" onClick={handleReceived}>Received Successfully</Button>
            </div>
          )}

          {reservationStatus === 'completed' && (
               <Alert variant="default" className="mt-8 bg-green-500/20 border-green-500/40 text-green-700">
                  <Check className="h-4 w-4 text-green-700" />
                  <AlertTitle>Pickup Complete!</AlertTitle>
                  <AlertDescription>
                      You have successfully received the food. Thank you for helping reduce waste!
                  </AlertDescription>
              </Alert>
          )}
        </div>
      </main>
      <AppFooter />
    </div>
  );
}
