
'use client';

import { useState } from 'react';
import Image from 'next/image';
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
import {
  CookingPot,
  MapPin,
  Leaf,
  BrainCircuit,
  Flame,
  Check,
  MessageSquare,
  Clock,
  Navigation,
} from 'lucide-react';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

// Mock data for a single listing, assuming we get this from a page param
const listing = {
  id: '1',
  foodName: 'Sourdough Bread',
  quantity: 10,
  address: '123 Main St, Anytown USA',
  distance: 2.5,
  imageUrl: PlaceHolderImages.find((img) => img.id === 'bread')
    ?.imageUrl as string,
  imageHint: PlaceHolderImages.find((img) => img.id === 'bread')
    ?.imageHint as string,
  provider: 'Good Samaritan Bakery',
  postedAt: '2 hours ago',
  freshness: '95% (Excellent)',
  macros: 'Calories: 80, Protein: 3g, Carbs: 15g',
  recipes: [
    'Garlic bread: Slice, spread with butter and garlic, and bake.',
    'Croutons: Cut into cubes, toss with oil, and bake until crispy.',
    'Bread pudding: A sweet dish made with milk, eggs, and sugar.',
  ],
};

type ReservationStatus = 'unreserved' | 'awaiting' | 'approved' | 'completed';
type PickupOption = 'otp' | 'leave' | null;

export default function ListingDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { toast } = useToast();
  const [reservationStatus, setReservationStatus] = useState<ReservationStatus>('unreserved');
  // This would be set by the provider's action in a real app
  const [pickupOption, setPickupOption] = useState<PickupOption>(null); 
  const [providerInstructions, setProviderInstructions] = useState('');

  const handleReserve = () => {
    setReservationStatus('awaiting');
    toast({
      title: 'Reservation Pending',
      description: 'The provider has been notified. You will be updated once they respond.',
    });
  };

  const handleReceived = () => {
    setReservationStatus('completed');
    toast({
      title: 'Transaction Complete!',
      description: 'Thank you for using FeedForward. This listing is now closed.',
    });
  }

  // Simulating provider approval after a delay
  const simulateProviderApproval = (option: PickupOption, instructions?: string) => {
    setTimeout(() => {
      setReservationStatus('approved');
      setPickupOption(option);
      if (instructions) {
        setProviderInstructions(instructions);
      }
      toast({
        title: 'Reservation Approved!',
        description: 'The provider has approved your request. Please see pickup instructions.',
      });
    }, 3000);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <main className="flex-1">
        <div className="container py-8 md:py-12">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {/* Left Column: Image */}
            <div className="relative w-full h-96 rounded-lg overflow-hidden">
              <Image
                src={listing.imageUrl}
                alt={listing.foodName}
                fill
                className="object-cover"
                data-ai-hint={listing.imageHint}
              />
            </div>

            {/* Right Column: Details */}
            <div className="flex flex-col gap-6">
              <div>
                <Badge variant="secondary">{listing.provider}</Badge>
                <h1 className="text-4xl font-bold tracking-tighter mt-2">
                  {listing.foodName}
                </h1>
                <div className="flex items-center gap-4 text-muted-foreground text-sm mt-2">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{listing.address} ({listing.distance} miles)</span>
                  </div>
                  <span>Posted {listing.postedAt}</span>
                </div>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Item Details</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Quantity</span>
                    <span>{listing.quantity} loaves</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Weight</span>
                    <span>Approx. 1.5 lbs per loaf</span>
                  </div>
                </CardContent>
              </Card>

              {reservationStatus === 'unreserved' && (
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
          
          {/* Status Section */}
          {reservationStatus === 'awaiting' && (
              <Alert variant="default" className="mt-8">
                  <Clock className="h-4 w-4" />
                  <AlertTitle>Awaiting Response</AlertTitle>
                  <AlertDescription>
                      Waiting for the provider to respond to your request. You will be notified of any updates.
                  </AlertDescription>
              </Alert>
          )}

          {/* Pickup and Navigation Section */}
          {reservationStatus === 'approved' && pickupOption && (
            <div className="mt-12">
               <h2 className="text-2xl font-semibold tracking-tight mb-6">
                Pickup and Navigation
              </h2>
              <div className="grid md:grid-cols-2 gap-8">
                {/* Pickup instructions */}
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
                                <p className="text-4xl font-bold tracking-widest">123456</p>
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
                 {/* Map */}
                <div>
                  <Card>
                    <CardHeader className="flex-row items-center gap-4">
                        <Navigation className="h-8 w-8 text-primary" />
                        <CardTitle>Route to Pickup Location</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-64 bg-muted rounded-md flex items-center justify-center">
                            <p className="text-muted-foreground">[Google Maps integration placeholder]</p>
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
                  </AlerDescription>
              </Alert>
          )}

          {/* AI Features Section (only show if unreserved or awaiting) */}
          {(reservationStatus === 'unreserved' || reservationStatus === 'awaiting') && (
            <div className="mt-12">
              <h2 className="text-2xl font-semibold tracking-tight mb-6">
                AI-Powered Insights
              </h2>
              <div className="grid lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="flex-row items-center gap-4 space-y-0">
                    <Leaf className="h-8 w-8 text-primary" />
                    <CardTitle>Freshness Predictor</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-green-500">
                      {listing.freshness}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Based on image analysis and posting time.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex-row items-center gap-4 space-y-0">
                    <Flame className="h-8 w-8 text-primary" />
                    <CardTitle>Macro Info (Approx.)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="font-semibold">{listing.macros}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Estimated nutritional information per serving.
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex-row items-center gap-4 space-y-0">
                    <BrainCircuit className="h-8 w-8 text-primary" />
                    <CardTitle>Quick Recipes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      {listing.recipes.map((recipe, i) => (
                        <li key={i}>{recipe}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

        </div>
      </main>
      <AppFooter />
    </div>
  );
}
